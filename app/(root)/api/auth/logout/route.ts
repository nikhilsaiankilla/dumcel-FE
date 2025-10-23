import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };

        // Prepare the response
        const res = NextResponse.json(
            {
                success: true,
                message: "Logged out successfully",
            },
            { status: 200 }
        );

        // Clear cookies
        res.cookies.set("token", "", { ...cookieOptions, maxAge: 0 });
        res.cookies.set("otpVerified", "", { ...cookieOptions, maxAge: 0 });
        res.cookies.set("passwordResetAllowed", "", { ...cookieOptions, maxAge: 0 });
        res.cookies.set("otpEmail", "", { ...cookieOptions, maxAge: 0 });
        res.cookies.set("otpSent", "", { ...cookieOptions, maxAge: 0 });

        return res;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
