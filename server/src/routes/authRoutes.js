import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { requireAuth, COOKIE_NAME } from "../middleware/auth.js";
import { sendError } from "../utils/sendError.js";

const router = Router();

const TOKEN_TTL = "7d";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep in sync with TOKEN_TTL

// Brute-force guard: 5 attempts per 15 minutes per IP, login only. Doesn't
// touch any other route.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  };
}

router.post("/auth/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password required" });
  }

  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedHash = process.env.AUTH_PASSWORD_HASH;

  try {
    // Always run bcrypt.compare even on a username mismatch, against the
    // real configured hash, so a wrong username and a wrong password take
    // about the same amount of time - avoids using response timing to
    // discover the valid username.
    const usernameMatches = username === expectedUsername;
    const passwordMatches = await bcrypt.compare(password, expectedHash);

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ sub: username }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.status(200).json({ username });
  } catch (err) {
    return sendError(res, err);
  }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  return res.status(200).json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  return res.status(200).json({ username: req.user.sub });
});

export default router;
