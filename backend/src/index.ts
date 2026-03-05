import express from "express";
import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";
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

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
