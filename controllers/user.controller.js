// src/controllers/user.controller.js
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


function signToken(user) {
  const payload = { sub: user._id.toString(), username: user.username, role: user.role };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  return jwt.sign(payload, secret, { expiresIn });
}

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    // You may also issue a refresh token here (stored in DB/redis or HttpOnly cookie). Kept simple for clarity.
    return res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || "1h", user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get profile of logged-in user
 */
export const me = async (req, res) => {
  const id = req.user && req.user.sub;
  if (!id) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
};

/**
 * Admin-only: get list of users
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin-only: delete a user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing user id" });
    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
