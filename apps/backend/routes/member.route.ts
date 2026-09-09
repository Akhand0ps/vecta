import { Router } from "express";
import {AddMemberController} from "../controllers/membership.controller";

const router = Router();


router.post("/invite",AddMemberController)



export default router;