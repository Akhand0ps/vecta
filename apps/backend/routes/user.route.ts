
import e, { Router } from "express";
import { createUser,login, verify } from "../controllers/user.controller";

const router = Router();



router.post("/register",createUser)
router.post("/login",login)
router.post("/login/verify",verify)

export default router;