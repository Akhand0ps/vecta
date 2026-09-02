import {Router} from "express";

import{
    createIssueController,
    getIssueController,
    getAllIssuesController,
    updateIssueController,
    deleteIssueController,
    issueMoveController,
    assignIssueController,
    unAssignIssueContrller,
    getIssueAssigneesController,
    getAssignHistoryController

} from "../controllers/issue.controller";



const router = Router();



router.post("/:boardId",createIssueController);
router.get("/:boardId/:sectionId/:issueId",getIssueController);
router.get("/all/:boardId",getAllIssuesController);
router.put("/update/:boardId/:sectionId/:issueId",updateIssueController);
router.delete("/delete/:boardId/:sectionId/:issueId",deleteIssueController);
router.put("/move/:boardId/:sectionId/:issueId",issueMoveController);


//issuemapping

router.post("/:issueId/assign",assignIssueController)
router.post("/:issueId/unassign",unAssignIssueContrller)
router.get("/:issueId/assignees/active",getIssueAssigneesController)
router.get("/:issueId/assignees/history",getAssignHistoryController)


export default router;
