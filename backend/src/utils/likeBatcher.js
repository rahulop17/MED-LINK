import mongoose from "mongoose"
import { Post } from "../models/post.model.js"
import { ApiError } from "./ApiError.js"

/** Buffer window: many users liking the same viral post share 1–2 DB writes. */
const FLUSH_MS = 10
const MAX_BATCH = 250

/** @type {Map<string, { add: Set<string>, remove: Set<string>, waiters: any[], timer: NodeJS.Timeout }>} */
const batches = new Map()

function getBatch(postId) {
  let batch = batches.get(postId)
  if (!batch) {
    batch = {
      add: new Set(),
      remove: new Set(),
      waiters: [],
      timer: setTimeout(() => {
        flush(postId).catch(() => {})
      }, FLUSH_MS),
    }
    batches.set(postId, batch)
  }
  return batch
}

/**
 * Queue a like (liked=true) or unlike (liked=false) for a post.
 * Resolves after the next flush with the post's likesCount.
 */
export function enqueueLikeChange(postId, userId, liked) {
  const uid = userId.toString()

  return new Promise((resolve, reject) => {
    const batch = getBatch(postId)

    if (liked) {
      batch.remove.delete(uid)
      batch.add.add(uid)
    } else {
      batch.add.delete(uid)
      batch.remove.add(uid)
    }

    batch.waiters.push({ userId: uid, liked, resolve, reject })

    if (batch.add.size + batch.remove.size >= MAX_BATCH) {
      clearTimeout(batch.timer)
      flush(postId).catch(() => {})
    }
  })
}

async function flush(postId) {
  const batch = batches.get(postId)
  if (!batch) return
  batches.delete(postId)
  clearTimeout(batch.timer)

  const adds = [...batch.add].map((id) => new mongoose.Types.ObjectId(id))
  const removes = [...batch.remove].map((id) => new mongoose.Types.ObjectId(id))

  try {
    const exists = await Post.exists({ _id: postId })
    if (!exists) {
      const err = new ApiError(404, "Post not found")
      batch.waiters.forEach((w) => w.reject(err))
      return
    }

    // Same-path $pull + $addToSet not allowed in one update → at most 2 writes
    if (removes.length) {
      await Post.updateOne(
        { _id: postId },
        { $pull: { likes: { $in: removes } } }
      )
    }
    if (adds.length) {
      await Post.updateOne(
        { _id: postId },
        { $addToSet: { likes: { $each: adds } } }
      )
    }

    const post = await Post.findById(postId).select("likes").lean()
    const likesCount = post?.likes?.length ?? 0
    const likedSet = new Set((post?.likes || []).map((id) => id.toString()))

    for (const w of batch.waiters) {
      const isLiked = likedSet.has(w.userId)
      w.resolve({
        liked: isLiked,
        likesCount,
        message: isLiked ? "Post liked" : "Post unliked",
      })
    }
  } catch (err) {
    batch.waiters.forEach((w) => w.reject(err))
  }
}
