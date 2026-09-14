
import { Router } from "express";
import { createUser,login, verify,uploadAvatar } from "../controllers/user.controller";
import { upload } from "../utils/multer.upload";

import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();



router.post("/register",createUser)
router.post("/login",login)
router.post("/verify",verify)
router.post("/avatar",upload.single("avatar"),authMiddleware,uploadAvatar)

export default router;