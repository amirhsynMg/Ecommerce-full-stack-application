import express from "express";
import {
  login,
  logout,
  sighnup,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/sighnup", sighnup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshToken", refreshToken);
router.get("/profile", getProfile);
export default router;
