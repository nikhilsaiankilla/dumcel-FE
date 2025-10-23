import { authenticate } from "@/lib/auth";
import { DeploymentModel } from "@/models/deployment.model";
import { ProjectModel } from "@/models/project.model";
import { connectDb } from "@/utils/connectDb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        await connectDb();

        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
        }

        const project = await ProjectModel.findById(projectId).lean();
        if (!project) {
            return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
        }

        const latestDeployment = await DeploymentModel.findOne({ projectId })
            .sort({ createdAt: -1 })
            .lean();

        const projectWithDeploymentId = {
            ...project,
            deployment: {
                latestDeploymentId: latestDeployment?._id || null,
                state: latestDeployment?.state || "not started",
            },
        };

        return NextResponse.json({ success: true, data: projectWithDeploymentId });
    } catch (error: unknown) {
        console.error("Get project error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
