import { authenticate } from "@/lib/auth";
import { DeploymentModel } from "@/models/deployment.model";
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

        const projects = await ProjectModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const projectsWithState = await Promise.all(
            projects.map(async (project) => {
                const latestDeployment = await DeploymentModel.findOne({ projectId: project._id })
                    .sort({ createdAt: -1 })
                    .select("state")
                    .lean();

                return {
                    ...project,
                    latestState: latestDeployment?.state || "not started",
                };
            })
        );

        const totalCount = await ProjectModel.countDocuments({ userId });

        return NextResponse.json({
            success: true,
            data: {
                projects: projectsWithState,
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
