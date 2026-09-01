import {Router} from "express";

import{
    createIssueController,
    getIssueController,
    getAllIssuesController,
    updateIssueController,
    deleteIssueController,
    issueMoveController
} from "../controllers/issue.controller";



const router = Router();



router.post("/:boardId",createIssueController);
router.get("/:boardId/:sectionId/:issueId",getIssueController);
router.get("/all/:boardId",getAllIssuesController);
router.put("/update/:boardId/:sectionId/:issueId",updateIssueController);
router.delete("/delete/:boardId/:sectionId/:issueId",deleteIssueController);
router.put("/move/:boardId/:sectionId/:issueId",issueMoveController);


export default router;
