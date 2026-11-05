import { createRemoteJWKSet, jwtVerify } from "jose";

// The Next.js client (BetterAuth JWT plugin) signs the tokens and publishes
// its public keys at <AUTH_URL>/api/auth/jwks. We only need those public keys
// to check that a token is real - no shared secret is stored on this server.
const AUTH_URL = (
  process.env.AUTH_URL ||
  (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0]
)
  .trim()
  .replace(/\/$/, "");

const JWKS = createRemoteJWKSet(new URL(`${AUTH_URL}/api/auth/jwks`));

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).send({ message: "Unauthorized: no token provided" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: AUTH_URL,
      audience: AUTH_URL,
    });

    if (!payload.email) {
      return res.status(401).send({ message: "Unauthorized: invalid token" });
    }

    // Always trust the user from the token, never from the request body
    req.user = {
      id: payload.id || payload.sub,
      name: payload.name,
      email: payload.email,
      image: payload.image || null,
    };
    next();
  } catch (error) {
    const expired = error?.code === "ERR_JWT_EXPIRED";
    return res.status(401).send({
      message: expired ? "Unauthorized: token expired" : "Unauthorized: invalid token",
    });
  }
}
