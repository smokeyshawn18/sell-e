import { Router } from "express";

const router = Router();

// GET   /api/notifications          — get all notifications for logged-in user
// GET   /api/notifications/unread   — get unread count
// PATCH /api/notifications/:id/read — mark one as read
// PATCH /api/notifications/read-all — mark all as read
// DELETE /api/notifications/:id     — delete one

export default router;
