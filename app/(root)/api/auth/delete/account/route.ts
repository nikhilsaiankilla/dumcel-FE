import { authenticate } from "@/lib/auth";
import { DeploymentModel } from "@/models/deployment.model";
import { OtpModel } from "@/models/otp.model";
import { ProjectModel } from "@/models/project.model";
import { TokenModel } from "@/models/tokens.model";
import { UserModel } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const session = await mongoose.startSession();

    try {
        const userFromReq = authenticate(req);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthenticated user" },
                { status: 401 }
            );
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        session.startTransaction();

        await Promise.all([
            ProjectModel.deleteMany({ userId }).session(session),
            TokenModel.deleteMany({ userId }).session(session),
            DeploymentModel.deleteMany({ userId }).session(session),
            OtpModel.deleteMany({ userId }).session(session),
            UserModel.deleteOne({ _id: userId }).session(session),
        ]);

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            {
                success: true,
                message: "Account and all related data deleted successfully.",
            },
            { status: 200 }
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error deleting account:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete account",
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
