import express from "express";
import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import cors from "cors";
const app = express();

app.use(clerkMiddleware()); // auth body is attached to req
app.use(express.json()); // parse JSON req bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded req bodies

app.use(
  cors({
    origin: ENV.FRONTEND_URL, // ALLOWED frontendURL
    credentials: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({
    message:
      "Welcome to Sell-E API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
      notifications: "/api/notifications",
    },
  });
});

// Route prefix of this Application
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
