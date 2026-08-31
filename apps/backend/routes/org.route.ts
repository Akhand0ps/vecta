import { Router } from "express";
import {
    createOrgController,
    deleteOrgController,
    getOrgController,
    getOrgsController
} from "../controllers/org.controller";


const router = Router();

router.post("/",createOrgController);
router.get("/:orgId",getOrgController);
router.get("/",getOrgsController);
router.delete("/:orgId",deleteOrgController)

export default router;