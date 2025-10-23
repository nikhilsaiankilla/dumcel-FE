import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z from "zod";

export async function POST(req: NextRequest) {
    try {
        // Define schema
        const schema = z.object({
            email: z.string().email(),
            password: z
                .string()
                .min(6, "Password must be at least 6 characters long")
                .regex(/[A-Z]/, "Password must include at least one uppercase letter")
                .regex(/[a-z]/, "Password must include at least one lowercase letter")
                .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
        });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json(
                {
                    success: false,
                    error: "JWT Secret is missing from both process.env and global.secrets",
                },
                { status: 500 }
            );
        }

        // Parse and validate body
        const body = await req.json();
        const { email, password } = schema.parse(body);

        // Find user
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Verify password
        const hashed = existingUser.password;
        if (!hashed) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isVerified = await bcrypt.compare(password, hashed);
        if (!isVerified) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            jwtSecret,
            { expiresIn: "1h" }
        );

        // Set cookie
        const res = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                userId: existingUser._id,
                token,
            },
            { status: 200 }
        );

        res.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600, // seconds
            path: "/",
        });

        return res;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
