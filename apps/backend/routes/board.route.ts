import { Router} from "express";

import{
    createBoardController,
    getBoardController,
    getAllBoardController,
    deleteBoardController
} from "../controllers/board.controller";

const router = Router();


router.post("/:orgId",createBoardController);
router.get("/:orgId/:boardId",getBoardController);
router.get("/:orgId",getAllBoardController);
router.delete("/:orgId/:boardId",deleteBoardController);


export default router;