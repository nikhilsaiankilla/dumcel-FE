import { authenticate } from "@/lib/auth";
import { UserModel } from "@/models/user.model";
import { connectDb } from "@/utils/connectDb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const userFromReq = authenticate(req);
        const userId = userFromReq?.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: user },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
