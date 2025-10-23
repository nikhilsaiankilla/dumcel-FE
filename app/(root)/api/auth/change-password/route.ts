import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 
import z from "zod";

export async function POST(req: NextRequest) {
    try {
        const schema = z.object({
            email: z.string().email(),
            oldPassword: z
                .string()
                .min(6, "Password must be at least 6 characters long")
                .regex(/[A-Z]/, "Password must include at least one uppercase letter")
                .regex(/[a-z]/, "Password must include at least one lowercase letter")
                .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
            newPassword: z
                .string()
                .min(6, "Password must be at least 6 characters long")
                .regex(/[A-Z]/, "Password must include at least one uppercase letter")
                .regex(/[a-z]/, "Password must include at least one lowercase letter")
                .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
        });

        const body = await req.json();
        const { email, newPassword, oldPassword } = schema.parse(body);

        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        if (oldPassword === newPassword) {
            return NextResponse.json({ success: false, error: "Old and new password should be different" }, { status: 400 });
        }

        if (!existingUser.password) {
            return NextResponse.json({ success: false, error: "Account may be connected via GitHub" }, { status: 400 });
        }

        const isVerified = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isVerified) {
            return NextResponse.json({ success: false, error: "Invalid old password" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await existingUser.updateOne({ $set: { password: hashedPassword } });

        return NextResponse.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
