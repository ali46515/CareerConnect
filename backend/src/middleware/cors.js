// src/middleware/cors.js
import cors from "cors";
import { config } from "../config/index.js";

export const corsOptions = cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});
