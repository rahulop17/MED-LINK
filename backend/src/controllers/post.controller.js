import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Post } from "../models/post.model.js"
import { Comment } from "../models/comment.model.js"
import { uploadOnCloudinary } from "../config/cloudinary.js"
import { coalesce } from "../utils/coalesce.js"
import { enqueueLikeChange } from "../utils/likeBatcher.js"

// -------------------- CREATE POST --------------------
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body

  if (!content?.trim() && !req.file) {
    throw new ApiError(400, "Post must have text content or an image")
  }

  let imageUrl = ""
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path)
    imageUrl = uploaded?.secure_url || ""
  }

  const post = await Post.create({
    doctor: req.user._id,
    content: content || "",
    image: imageUrl,
  })

  return res.status(201).json(
    new ApiResponse(201, post, "Post created successfully")
  )
})

// -------------------- GET FEED --------------------
const getFeed = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("doctor", "name specialization avatar")
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(200, posts, "Feed fetched successfully")
  )
})

// -------------------- LIKE / UNLIKE POST --------------------
// 1) Coalesce same user+post bursts
// 2) Batch many users on the same viral post into 1–2 Mongo writes / ~10ms
const toggleLike = asyncHandler(async (req, res) => {
  const postId = req.params.id
  if (!mongoose.isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post id")
  }

  const userId = req.user._id
  const key = `like:${postId}:${userId.toString()}`

  const result = await coalesce(key, async () => {
    const post = await Post.findById(postId).select("likes").lean()
    if (!post) {
      throw new ApiError(404, "Post not found")
    }

    const alreadyLiked = (post.likes || []).some(
      (id) => id.toString() === userId.toString()
    )
    const wantLiked = !alreadyLiked

    return enqueueLikeChange(postId, userId, wantLiked)
  })

  return res.status(200).json(
    new ApiResponse(
      200,
      { liked: result.liked, likesCount: result.likesCount },
      result.message
    )
  )
})

// -------------------- DELETE POST --------------------
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    throw new ApiError(404, "Post not found")
  }

  if (post.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this post")
  }

  await Post.findByIdAndDelete(req.params.id)

  return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"))
})

// -------------------- GET DOCTOR'S POSTS --------------------
const getDoctorPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ doctor: req.params.doctorId })
    .populate("doctor", "name specialization avatar")
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(200, posts, "Doctor posts fetched successfully")
  )
})

// -------------------- ADD COMMENT --------------------
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required")
  }

  const post = await Post.findById(req.params.id)
  if (!post) throw new ApiError(404, "Post not found")

  const authorModel = req.user.role === "doctor" ? "Doctor" : "User"

  const comment = await Comment.create({
    post: req.params.id,
    author: req.user._id,
    authorModel,
    content,
  })

  const populated = await comment.populate("author", "name avatar role")

  return res.status(201).json(
    new ApiResponse(201, populated, "Comment added")
  )
})

// -------------------- GET COMMENTS --------------------
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate("author", "name avatar role")
    .sort({ createdAt: 1 })

  return res.status(200).json(
    new ApiResponse(200, comments, "Comments fetched")
  )
})

export { createPost, getFeed, toggleLike, deletePost, getDoctorPosts, addComment, getComments }