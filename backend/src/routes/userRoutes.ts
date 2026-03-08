import { Router } from "express";
import * as userController from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

// Sync Clerk users to our database (Protected Route)
router.post("/sync", requireAuth(), userController.syncUser);
export default router;
