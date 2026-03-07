import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import * as queries from "../db/queries";

export async function syncUser(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { email, name, imageUrl } = req.body;
    if (!email || !name || !imageUrl) {
      return res.status(400).json({ error: "Missing user information" });
    }
    const user = await queries.upsertUser({
      id: userId,
      email,
      name,
      imageUrl,
    });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}
