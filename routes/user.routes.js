// src/routes/user.routes.js
import express from "express";
import { body } from "express-validator";
import { login, me, listUsers, deleteUser } from "../controllers/user.controller.js";
import { verifyToken, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Auth routes
 * - POST /api/auth/login
 * - GET  /api/auth/me
 */

router.post(
  "/auth/login",
  [
    body("username").isString().trim().notEmpty(),
    body("password").isString().notEmpty(),
  ],
  login
);

router.get("/auth/me", verifyToken, me);

// Admin-only user management
router.get("/users", verifyToken, restrictTo("admin"), listUsers);
router.delete("/users/:id", verifyToken, restrictTo("admin"), deleteUser);

export default router;