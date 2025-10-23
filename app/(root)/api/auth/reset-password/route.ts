import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import z from "zod/v3";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const schema = z.object({
            email: z.string().email(),
            newPassword: z
                .string()
                .min(6, "Password must be at least 6 characters long")
                .regex(/[A-Z]/, "Password must include at least one uppercase letter")
                .regex(/[a-z]/, "Password must include at least one lowercase letter")
                .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
        });

        const body = await req.json(); // Correct way to read JSON in Next.js API routes
        const { email, newPassword } = schema.parse(body);

        const cookies = req.cookies; // Read cookies using req.cookies.get(name)?.value
        const passwordResetAllowed = cookies.get("passwordResetAllowed")?.value;

        if (passwordResetAllowed !== "true") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password reset session expired. Please re-verify OTP.",
                },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        const result = await UserModel.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            throw new Error("No user found or password update failed");
        }

        // Prepare response and clear cookies
        const res = NextResponse.json(
            {
                success: true,
                message: "Password reset successfully",
            },
            { status: 200 }
        );

        res.cookies.set("passwordResetAllowed", "", { maxAge: 0, path: "/" });
        res.cookies.set("otpVerified", "", { maxAge: 0, path: "/" });

        // TODO: send confirmation email

        return res;
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
