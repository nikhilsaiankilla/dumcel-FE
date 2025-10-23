import { OtpModel } from "@/models/otp.model";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { generateOTP } from "@/lib/utils"; // adjust import path

export async function POST(req: NextRequest) {
    try {
        const schema = z.object({
            email: z.string().email(),
        });

        // Parse body correctly
        const body = await req.json();
        const { email } = schema.parse(body);

        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Generate OTP
        const otp = generateOTP();
        if (!otp) {
            return NextResponse.json({ success: false, error: "Failed to generate OTP" }, { status: 500 });
        }

        // Store OTP in DB
        const otpStored = await OtpModel.create({
            otp,
            email: existingUser.email,
            userId: existingUser._id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        });
        if (!otpStored) {
            return NextResponse.json({ success: false, error: "Failed to store OTP" }, { status: 500 });
        }

        // TODO: send OTP via email

        // Create response first
        const response = NextResponse.json(
            { success: true, message: "OTP sent to email" },
            { status: 200 }
        );

        // Then attach cookies (mutates headers)
        response.cookies.set("otpSent", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60, // seconds
            sameSite: "lax",
        });

        response.cookies.set("otpEmail", email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60,
            sameSite: "lax",
        });

        return response;
    } catch (error: unknown) {
        console.error("Forget password error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
