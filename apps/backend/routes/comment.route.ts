import {Router} from "express";
import { createCommentController,getCommentController, deleteCommentController, editCommentController, getAllCommentsController } from "../controllers/comment.controller";

const router = Router();


router.post("/:issueId",createCommentController);
router.get("/:issueId/:commentId",getCommentController);
router.get("/:issueId",getAllCommentsController);
router.put("/:issueId/:commentId",editCommentController);
router.delete("/:issueId/:commentId",deleteCommentController); 


export default router;