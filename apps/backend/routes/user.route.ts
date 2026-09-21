
import { Router } from "express";
import { createUser,login, verify,uploadAvatar,getAvatar, getAvatarUploadUrl, completeAvatarUpload, me } from "../controllers/user.controller";
import { upload } from "../utils/multer.upload";

import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimiter } from "../middleware/raterlimiter";
const router = Router();


const loginLimiter = rateLimiter({
    windowSeconds:120,
    maxAttempts:3,
    keyPrefix:"rl:login"
})

router.post("/register",createUser)
router.post("/login",loginLimiter,login)
router.get("/me",authMiddleware,me)
router.post("/verify",verify)
router.post("/avatar",upload.single("avatar"),authMiddleware,uploadAvatar)
router.get("/avatar",authMiddleware,getAvatar)
router.post("/upload-url",authMiddleware,getAvatarUploadUrl);
router.post("/complete-upload",authMiddleware,completeAvatarUpload);

export default router;