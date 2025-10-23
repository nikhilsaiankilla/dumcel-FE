import { authenticate } from "@/lib/auth";
import { ProjectModel } from "@/models/project.model";
import { connectDb } from "@/utils/connectDb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectDb();

        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [projects, totalCount] = await Promise.all([
            ProjectModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ProjectModel.countDocuments({ userId }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                projects,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNextPage: page * limit < totalCount,
                    hasPrevPage: page > 1,
                },
            },
        });
    } catch (error: unknown) {
        console.error("Get all projects error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
