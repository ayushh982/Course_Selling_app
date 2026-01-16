import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import orderRoute from "./routes/order.route.js";

dotenv.config();

const app = express();

/* =========================
   CONTENT SECURITY POLICY
   ========================= */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' https://js.stripe.com https://m.stripe.network 'unsafe-inline' blob:",
      "frame-src https://js.stripe.com",
      "connect-src 'self' https://api.stripe.com https://m.stripe.network",
      "img-src 'self' data: blob: https:",
    ].join("; ")
  );
  next();
});

/* =========================
   BODY & COOKIE MIDDLEWARE
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   FILE UPLOAD
   ========================= */
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

/* =========================
   CORS (FIXED)
   ========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://uitcourse.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server calls
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   DATABASE
   ========================= */
const DB_URI = process.env.MONGO_URI;

try {
  await mongoose.connect(DB_URI);
  console.log("✅ Connected to DB Successfully");
} catch (error) {
  console.error("❌ DB Connection Error:", error);
}

/* =========================
   CLOUDINARY
   ========================= */
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

/* =========================
   ROUTES
   ========================= */
app.get("/", (req, res) => {
  res.send("Hello Course Selling App!");
});

app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/order", orderRoute);

/* =========================
   SERVER
   ========================= */
const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
