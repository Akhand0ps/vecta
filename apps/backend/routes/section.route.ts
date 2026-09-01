import { Router } from "express";

import {
    getSectionController,
} from "../controllers/section.controller";

const router = Router();
router.get("/:boardId/:sectionId",getSectionController);


export default router;