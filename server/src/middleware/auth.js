import jwt from "jsonwebtoken";

const COOKIE_NAME = "segla_session";

// Verifies the JWT in the httpOnly session cookie. Applied to every route
// mounted after it in app.js except /auth/* (login has to be reachable
// without a token, obviously).
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    // Covers both an expired token and a bad/tampered signature - client
    // treats both the same way (send them back to login).
    return res.status(401).json({ error: "Not authenticated" });
  }
}

export { requireAuth, COOKIE_NAME };
