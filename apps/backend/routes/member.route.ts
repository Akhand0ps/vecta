import { Router } from "express";
import {AddMemberController, verifyInvitation,revokeInvitation} from "../controllers/membership.controller";

const router = Router();


router.post("/",AddMemberController)
router.get("/verify/:token",verifyInvitation);
router.put("/revoke/:userId",revokeInvitation);


export default router;