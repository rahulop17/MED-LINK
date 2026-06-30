import { Router } from "express"
import {
  createPost,
  getFeed,
  toggleLike,
  deletePost,
  getDoctorPosts,
  addComment,
  getComments,
} from "../controllers/post.controller.js"
import { verifyJWT, verifyDoctor } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.post("/", verifyJWT, verifyDoctor, upload.single("image"), createPost)
router.get("/feed", verifyJWT, getFeed)
router.get("/doctor/:doctorId", getDoctorPosts)
router.post("/:id/like", verifyJWT, toggleLike)
router.delete("/:id", verifyJWT, verifyDoctor, deletePost)
router.post("/:id/comments", verifyJWT, addComment)
router.get("/:id/comments", verifyJWT, getComments)

export default router