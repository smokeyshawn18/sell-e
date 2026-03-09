import { Router } from "express";
import * as notificationController from "../controllers/notificationController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET   /api/notifications          — get all notifications for logged-in user
router.get("/", requireAuth(), notificationController.getAllNotifications);
// GET   /api/notifications/unread   — get unread count
router.get("/unread", notificationController.getUnreadCount);
// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", notificationController.markAsRead);
// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", notificationController.markAllAsRead);
// DELETE /api/notifications/:id     — delete one
router.delete("/:id", notificationController.deleteNotification);

export default router;
