import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

export type Role = "SUPER_ADMIN" | "ADMIN" | "COACH" | "FRONT_DESK" | "CONTENT_MANAGER";

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  assignedCentre?: string | null;
}

export interface AuthResult {
  authorized: boolean;
  status: number;
  error?: string;
  user?: UserSession;
}

const JWT_SECRET = process.env.JWT_SECRET || "s-and-a-badminton-super-secret-jwt-key-2026-production";
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. Password Hashing (scrypt with 16-byte random salt)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      derivedKey
    );
  } catch {
    return false;
  }
}

// 2. Base64URL Encoding for JWT
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

// 3. JWT Access Token Signing & Verification
export function createAccessToken(user: UserSession): { token: string; expiresAt: number } {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
  const payload = JSON.stringify({
    sub: user.userId,
    email: user.email,
    name: user.fullName,
    role: user.role,
    centre: user.assignedCentre,
    exp: Math.floor(expiresAt / 1000),
    iat: Math.floor(Date.now() / 1000),
  });

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return {
    token: `${encodedHeader}.${encodedPayload}.${signature}`,
    expiresAt,
  };
}

export function verifyAccessToken(token: string): UserSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null; // Expired
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
      fullName: decoded.name,
      role: decoded.role,
      assignedCentre: decoded.centre,
    };
  } catch {
    return null;
  }
}

// 4. Refresh Token Generation, Hashing & Rotation
export async function createRefreshToken(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ rawToken: string; tokenId: string; expiresAt: Date }> {
  const sql = getSql();
  if (!sql) throw new Error("Database unavailable");

  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const tokenId = `rt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await sql`
    INSERT INTO refresh_tokens (
      id, user_id, token_hash, expires_at, revoked, ip_address, user_agent
    ) VALUES (
      ${tokenId}, ${userId}, ${tokenHash}, ${expiresAt.toISOString()}, FALSE,
      ${ipAddress || null}, ${userAgent || null}
    );
  `;

  return { rawToken: `${tokenId}.${rawToken}`, tokenId, expiresAt };
}

export async function rotateRefreshToken(
  compositeToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserSession; newAccessToken: string; newRefreshToken: string } | null> {
  const sql = getSql();
  if (!sql) return null;

  const [tokenId, rawSecret] = compositeToken.split(".");
  if (!tokenId || !rawSecret) return null;

  const tokenHash = crypto.createHash("sha256").update(rawSecret).digest("hex");

  const records = await sql`
    SELECT r.*, u.email, u.full_name, u.role, u.assigned_centre, u.is_active
    FROM refresh_tokens r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ${tokenId};
  `;

  if (records.length === 0) return null;
  const tokenRecord = records[0];

  // Detect reuse attack
  if (tokenRecord.revoked || tokenRecord.token_hash !== tokenHash) {
    // Revoke all tokens for this user family as security precaution
    await sql`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ${tokenRecord.user_id};`;
    return null;
  }

  // Check expiration
  if (new Date() > new Date(tokenRecord.expires_at)) {
    await sql`UPDATE refresh_tokens SET revoked = TRUE WHERE id = ${tokenId};`;
    return null;
  }

  // Check user active status
  if (!tokenRecord.is_active) {
    return null;
  }

  const user: UserSession = {
    userId: tokenRecord.user_id,
    email: tokenRecord.email,
    fullName: tokenRecord.full_name,
    role: tokenRecord.role,
    assignedCentre: tokenRecord.assigned_centre,
  };

  // Mark current refresh token as replaced & rotated
  const newRefresh = await createRefreshToken(user.userId, ipAddress, userAgent);
  await sql`
    UPDATE refresh_tokens 
    SET revoked = TRUE, replaced_by_token_id = ${newRefresh.tokenId}
    WHERE id = ${tokenId};
  `;

  const newAccess = createAccessToken(user);

  return {
    user,
    newAccessToken: newAccess.token,
    newRefreshToken: newRefresh.rawToken,
  };
}

export async function revokeRefreshToken(compositeToken: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  const [tokenId] = compositeToken.split(".");
  if (!tokenId) return false;

  await sql`UPDATE refresh_tokens SET revoked = TRUE WHERE id = ${tokenId};`;
  return true;
}

// 5. Cookie & Session Constants
export const AUTH_COOKIE_NAME = "sa_admin_token";
export const REFRESH_COOKIE_NAME = "sa_admin_refresh";

/**
 * Extracts authentication token from either Authorization Bearer header or HttpOnly cookie.
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        return decodeURIComponent(cookie.substring(AUTH_COOKIE_NAME.length + 1));
      }
    }
  }

  return null;
}

/**
 * Extracts refresh token from composite token or refresh cookie
 */
export function extractRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${REFRESH_COOKIE_NAME}=`)) {
        return decodeURIComponent(cookie.substring(REFRESH_COOKIE_NAME.length + 1));
      }
    }
  }
  return null;
}

/**
 * Sets secure HttpOnly cookies for session authentication
 */
export function setAuthCookies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  accessToken: string,
  refreshToken?: string
) {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (response.cookies?.set) {
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    if (refreshToken) {
      response.cookies.set({
        name: REFRESH_COOKIE_NAME,
        value: refreshToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }
  }
}

/**
 * Clears authentication cookies upon logout or session invalidation
 */
export function clearAuthCookies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
) {
  const isProduction = process.env.NODE_ENV === "production";

  if (response.cookies?.set) {
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

// 6. Route Protection Helper (requireAuth)
export async function requireAuth(
  request: Request,
  allowedRoles?: Role[]
): Promise<AuthResult> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required. Please sign in to access this resource.",
    };
  }

  const user = verifyAccessToken(token);

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired session. Please sign in again.",
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return {
        authorized: false,
        status: 403,
        error: `Forbidden: Role '${user.role}' does not have permission for this action.`,
        user,
      };
    }
  }

  return {
    authorized: true,
    status: 200,
    user,
  };
}
