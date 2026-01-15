import express from "express";
import userMiddleware from "../middlewares/user.mid.js";
import { signup,login,logout,purchases } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/purchases",userMiddleware,purchases);

export default router;