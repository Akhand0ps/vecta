
import { Router } from "express";
import { createUser,login, verify,uploadAvatar,getAvatar, getAvatarUploadUrl, completeAvatarUpload } from "../controllers/user.controller";
import { upload } from "../utils/multer.upload";

import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();



router.post("/register",createUser)
router.post("/login",login)
router.post("/verify",verify)
router.post("/avatar",upload.single("avatar"),authMiddleware,uploadAvatar)
router.get("/avatar",authMiddleware,getAvatar)
router.post("/upload-url",authMiddleware,getAvatarUploadUrl);
router.post("/complete-upload",authMiddleware,completeAvatarUpload);

export default router;