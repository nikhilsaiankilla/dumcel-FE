// lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET!;

export function authenticate(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };
        return decoded;
    } catch {
        return null;
    }
}
