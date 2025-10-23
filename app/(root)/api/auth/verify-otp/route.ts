import { OtpModel } from "@/models/otp.model";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(req: NextRequest) {
    try {
        const schema = z.object({
            otp: z.string().length(6, "OTP must be 6 digits"),
            email: z.string().email(),
        });

        const body = await req.json();
        const { otp, email } = schema.parse(body);

        // Find most recent OTP
        const storedOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 });

        if (!storedOtp) {
            return NextResponse.json(
                { success: false, error: "No OTP found. Please generate a new one." },
                { status: 400 }
            );
        }

        if (storedOtp.expiresAt && storedOtp.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, error: "OTP has expired. Please generate a new one." },
                { status: 400 }
            );
        }

        if (storedOtp.otp !== otp) {
            return NextResponse.json(
                { success: false, error: "Invalid OTP. Please try again." },
                { status: 400 }
            );
        }

        // Optional: delete OTP after verification
        await OtpModel.deleteOne({ _id: storedOtp._id });

        // Prepare response and set cookies
        const res = NextResponse.json(
            { success: true, message: "OTP verified successfully" },
            { status: 200 }
        );

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60, // in seconds
            sameSite: "lax" as const,
            path: "/",
        };

        res.cookies.set("otpVerified", "true", cookieOptions);
        res.cookies.set("passwordResetAllowed", "true", cookieOptions);
        res.cookies.set("email", email, cookieOptions);
        // Clear otpSent cookie
        res.cookies.set("otpSent", "", { ...cookieOptions, maxAge: 0 });

        return res;
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
