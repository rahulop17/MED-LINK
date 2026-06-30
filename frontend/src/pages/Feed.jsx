import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/common/Navbar"

import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

function Feed() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const [newPostContent, setNewPostContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [postImageFile, setPostImageFile] = useState(null)
  const [postImagePreview, setPostImagePreview] = useState(null)
  const imageInputRef = useRef(null)

  // Comments state
  const [openComments, setOpenComments] = useState({})
  const [commentsData, setCommentsData] = useState({})
  const [commentInput, setCommentInput] = useState({})
  const [commentLoading, setCommentLoading] = useState({})

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPostImageFile(file)
      setPostImagePreview(URL.createObjectURL(file))
    }
  }

  const fetchFeed = async () => {
    try {
      const response = await axiosInstance.get("/posts/feed", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      setPosts(response.data.data)
    } catch (error) {
      console.log("Error fetching feed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchFeed()
  }, [user])

  const handleLike = async (postId) => {
    try {
      await axiosInstance.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      fetchFeed()
    } catch (error) {
      console.log("Error liking post:", error)
    }
  }

  const handlePublishPost = async (e) => {
    e.preventDefault()
    if ((!newPostContent.trim() && !postImageFile) || user?.role !== "doctor") return

    setPosting(true)
    try {
      const formData = new FormData()
      formData.append("content", newPostContent)
      if (postImageFile) {
        formData.append("image", postImageFile)
      }

      await axiosInstance.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setNewPostContent("")
      setPostImageFile(null)
      setPostImagePreview(null)
      fetchFeed()
    } catch (error) {
      console.log("Error publishing post:", error)
    } finally {
      setPosting(false)
    }
  }

  const handleToggleComments = async (postId) => {
    const isOpen = openComments[postId]
    setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }))

    if (!isOpen && !commentsData[postId]) {
      try {
        const res = await axiosInstance.get(`/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        })
        setCommentsData((prev) => ({ ...prev, [postId]: res.data.data }))
      } catch (err) {
        console.log("Error fetching comments:", err)
      }
    }
  }

  const handleAddComment = async (postId) => {
    const content = commentInput[postId]?.trim()
    if (!content) return

    setCommentLoading((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await axiosInstance.post(
        `/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      setCommentsData((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data.data],
      }))
      setCommentInput((prev) => ({ ...prev, [postId]: "" }))
    } catch (err) {
      console.log("Error adding comment:", err)
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dr. ${post.doctor?.name} on MedLink`,
          text: post.content?.slice(0, 100) + "...",
          url: window.location.href,
        })
      } catch (err) {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getCommentsCount = (id) => (id.charCodeAt(0) % 15) + 3
  const getSharesCount = (id) => (id.charCodeAt(0) % 8) + 1

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6 sticky top-24">
            <Card className="bg-white border-slate-200/50 rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,82,204,0.03)] hover:shadow-[0_12px_40px_rgb(0,82,204,0.05)] transition-all duration-300">
              <div className="h-20 bg-gradient-to-tr from-forest to-blue-600/90" />
              <CardContent className="p-6 text-center -mt-11 flex flex-col items-center">
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="lg"
                  className="w-20 h-20 border-4 border-white shadow-md bg-white mb-3 shrink-0 rounded-2xl"
                />
                {/* FIX: only show Dr. prefix for doctors */}
                <h3 className="font-extrabold text-slate-900 text-base truncate w-full">
                  {user?.role === "doctor" ? `Dr. ${user?.name}` : user?.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate w-full">
                  {user?.role === "doctor" ? user?.specialization || "Clinical Consultant" : "Patient Portal User"}
                </p>
                <div className="w-full border-t border-slate-100/80 mt-6 pt-5">
                  <Link
                    to={user?.role === "doctor" ? "/doctor/dashboard" : "/my-appointments"}
                    className="block text-center w-full py-3 bg-forest hover:bg-forest-light text-white text-xs font-black rounded-xl transition duration-200 shadow-[0_4px_12px_rgba(0,82,204,0.15)]"
                  >
                    {user?.role === "doctor" ? "Manage Workspace" : "Book Appointments"}
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50 rounded-[20px] p-5 hidden lg:block shadow-[0_8px_30px_rgb(0,82,204,0.03)]">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-3">Workspace Quicklinks</h4>
              <div className="space-y-3 text-xs text-slate-600 font-bold">
                <Link to="/doctors" className="flex items-center gap-2.5 hover:text-forest transition">
                  <span className="text-slate-400">🔍</span> Find Medical Experts
                </Link>
                <Link to="/symptom-checker" className="flex items-center gap-2.5 hover:text-forest transition">
                  <span className="text-slate-400">🤖</span> AI Symptom Assessor
                </Link>
              </div>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-7 space-y-6">

            {/* Create Post */}
            <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,82,204,0.03)]">
              <div className="flex gap-4">
                <Avatar src={user?.avatar} name={user?.name} size="md" className="rounded-xl" />
                <div className="flex-1">
                  {user?.role === "doctor" ? (
                    <form onSubmit={handlePublishPost} className="space-y-4">
                      <textarea
                        placeholder="Share a clinical insight, article, or medical update..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800 resize-none p-3.5 leading-relaxed"
                      />

                      {postImagePreview && (
                        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center">
                          <img src={postImagePreview} alt="Selected upload preview" className="max-h-48 object-contain" />
                          <button
                            type="button"
                            onClick={() => { setPostImageFile(null); setPostImagePreview(null) }}
                            className="absolute top-2 right-2 w-7 h-7 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors"
                          >✕</button>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-4 mt-2">
                        <div className="flex items-center gap-4 text-[11px] font-bold">
                          <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                          <button type="button" onClick={() => imageInputRef.current.click()} className="flex items-center gap-2 text-slate-500 hover:text-forest transition duration-150">
                            <span className="text-blue-500 text-sm">🖼️</span><span>Photo</span>
                          </button>
                          <button type="button" className="flex items-center gap-2 text-slate-500 hover:text-forest transition duration-150">
                            <span className="text-orange-500 text-sm">📄</span><span>Article</span>
                          </button>
                          <button type="button" className="flex items-center gap-2 text-slate-500 hover:text-forest transition duration-150">
                            <span className="text-rose-500 text-sm">🎥</span><span>Live</span>
                          </button>
                        </div>
                        <Button
                          type="submit"
                          disabled={posting || (!newPostContent.trim() && !postImageFile)}
                          size="sm"
                          className="rounded-xl px-5 text-xs font-black shadow-md shadow-forest/15"
                        >
                          {posting ? "Publishing..." : "Publish"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-slate-50/60 border border-slate-150/80 p-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition duration-150">
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                        Follow real-time insights, tips, and articles published by verified clinical practitioners on MedLink.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Posts Stream */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 border border-slate-200/50 rounded-[28px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
                <p className="text-slate-400 text-xs font-bold mt-5 tracking-wider uppercase">Loading clinical feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-[28px] p-20 text-center border border-slate-200/50 shadow-[0_8px_30px_rgb(0,82,204,0.03)]">
                <p className="text-slate-400 text-sm font-semibold">No medical insights published yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const shares = getSharesCount(post._id)
                  const hasArticleLink = post.content?.toLowerCase().includes("study") ||
                    post.content?.toLowerCase().includes("review") ||
                    post.content?.toLowerCase().includes("clinical")

                  return (
                    <Card key={post._id} className="bg-white border-slate-200/50 rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,82,204,0.03)] hover:shadow-[0_20px_50px_rgba(0,82,204,0.08)] transition-all duration-300">

                      {/* Author Header */}
                      <div className="flex items-center gap-3.5 mb-5">
                        <Avatar src={post.doctor?.avatar} name={post.doctor?.name} size="md" className="rounded-xl border border-slate-100" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">Dr. {post.doctor?.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
                            {post.doctor?.specialization || "Clinical Specialist"} • {timeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-line mb-4">
                        {post.content}
                      </p>

                      {/* Image */}
                      {post.image && (
                        <div className="rounded-2xl border border-slate-100 overflow-hidden mb-5 max-h-[380px] bg-slate-50/50 shadow-inner">
                          <img src={post.image} alt="post" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Article Preview */}
                      {hasArticleLink && !post.image && (
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-50 p-4.5 mb-5 transition duration-200 flex flex-col sm:flex-row items-center gap-4 cursor-pointer shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 text-2xl shadow-inner">📚</div>
                          <div className="flex-1 min-w-0 text-left">
                            <span className="inline-block text-[8px] font-black uppercase tracking-wider text-forest bg-blue-100/60 px-2 py-0.5 rounded-md mb-1.5">Clinical Publication</span>
                            <h5 className="font-extrabold text-slate-900 text-xs truncate leading-snug">Implementing AI in Routine ECG Screenings: A Multi-Center Review</h5>
                            <p className="text-[10px] text-slate-550 truncate mt-0.5 font-medium">PubMed Central • Clinical databases scan on patient cardiac health indices</p>
                          </div>
                        </div>
                      )}

                      {/* Reactions Count */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-3 border-b border-slate-100/85 mb-3.5">
                        <span className="flex items-center gap-1.5 text-slate-500 font-extrabold">
                          <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-[10px]">❤️</span>
                          {post.likes?.length || 0} likes
                        </span>
                        <div className="flex gap-3">
                          <span>{commentsData[post._id]?.length ?? getCommentsCount(post._id)} comments</span>
                          <span>•</span>
                          <span>{shares} shares</span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between px-1">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors py-2.5 px-4 rounded-xl hover:bg-rose-50"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Like</span>
                        </button>

                        <button
                          onClick={() => handleToggleComments(post._id)}
                          className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-500 hover:text-forest transition-colors py-2.5 px-4 rounded-xl hover:bg-blue-50/60"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Comment</span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-500 hover:text-forest transition-colors py-2.5 px-4 rounded-xl hover:bg-blue-50/60"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742L15.316 7.43m0 9.14l-6.632-3.31a3 3 0 110-2.514l6.632-3.31a3 3 0 110 5.028l-6.632 3.31a3 3 0 110-2.514z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {openComments[post._id] && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          {/* Existing comments */}
                          {(commentsData[post._id] || []).map((comment) => (
                            <div key={comment._id} className="flex gap-2.5">
                              <Avatar
                                src={comment.author?.avatar}
                                name={comment.author?.name}
                                size="sm"
                                className="rounded-lg shrink-0"
                              />
                              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                                <p className="text-[10px] font-extrabold text-slate-800">
                                  {comment.author?.role === "doctor"
                                    ? `Dr. ${comment.author?.name}`
                                    : comment.author?.name}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Empty state */}
                          {commentsData[post._id]?.length === 0 && (
                            <p className="text-[10px] text-slate-400 font-semibold text-center py-2">
                              No comments yet. Be the first!
                            </p>
                          )}

                          {/* Add comment */}
                          <div className="flex gap-2.5 pt-1">
                            <Avatar src={user?.avatar} name={user?.name} size="sm" className="rounded-lg shrink-0" />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentInput[post._id] || ""}
                                onChange={(e) =>
                                  setCommentInput((prev) => ({ ...prev, [post._id]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === "Enter" && handleAddComment(post._id)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-forest/40 focus:ring-1 focus:ring-forest/20 transition-all"
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={commentLoading[post._id] || !commentInput[post._id]?.trim()}
                                className="px-3 py-2 bg-forest text-white text-xs font-black rounded-xl disabled:opacity-50 transition-colors hover:bg-forest-light"
                              >
                                {commentLoading[post._id] ? "..." : "Post"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-6 sticky top-24">
            <Card className="bg-white border-slate-200/50 rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,82,204,0.03)]">
              <h3 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-widest pb-2.5 border-b border-slate-100 mb-4">
                Trending Insights
              </h3>
              <div className="space-y-4 text-left">
                <div>
                  <Badge variant="info" className="text-[7px] py-0 px-1 font-black leading-none rounded-md">Trending</Badge>
                  <h5 className="font-extrabold text-slate-800 text-[11px] mt-1 hover:text-forest cursor-pointer transition truncate">Telehealth Expansion</h5>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">2.4k posts</p>
                </div>
                <div>
                  <Badge variant="info" className="text-[7px] py-0 px-1 font-black leading-none rounded-md">Research</Badge>
                  <h5 className="font-extrabold text-slate-800 text-[11px] mt-1 hover:text-forest cursor-pointer transition truncate">Immunotherapy</h5>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">1.8k posts</p>
                </div>
                <div>
                  <Badge variant="info" className="text-[7px] py-0 px-1 font-black leading-none rounded-md">AI Tech</Badge>
                  <h5 className="font-extrabold text-slate-800 text-[11px] mt-1 hover:text-forest cursor-pointer transition truncate">Cardio ECG Algos</h5>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">940 posts</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-200/50 rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,82,204,0.03)]">
              <h3 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-widest pb-2.5 border-b border-slate-100 mb-4">
                Clinical Experts
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name="Sarah Chen" size="sm" className="rounded-lg w-8 h-8" />
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-800 text-[10px] truncate leading-tight">Dr. S. Chen</h5>
                      <p className="text-[8px] text-slate-400 font-bold truncate leading-none mt-0.5">Immunology</p>
                    </div>
                  </div>
                  <Link to="/doctors" className="shrink-0">
                    <button className="text-forest hover:text-forest-light text-xs font-black shrink-0">＋</button>
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name="Marcus Thorne" size="sm" className="rounded-lg w-8 h-8" />
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-800 text-[10px] truncate leading-tight">Dr. M. Thorne</h5>
                      <p className="text-[8px] text-slate-400 font-bold truncate leading-none mt-0.5">Gen. Surgery</p>
                    </div>
                  </div>
                  <Link to="/doctors" className="shrink-0">
                    <button className="text-forest hover:text-forest-light text-xs font-black shrink-0">＋</button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Feed

