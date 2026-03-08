import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function getAllNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = getAuth(req); // Assuming user ID is stored in req.user
    const notifications = await queries.getNotificationsByUserId(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
