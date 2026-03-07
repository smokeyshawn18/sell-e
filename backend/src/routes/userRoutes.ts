import { Router } from "express";
import { syncUser } from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

// Sync Clerk users to our database (Protected Route)
router.post("/sync", requireAuth(), syncUser);
export default router;
