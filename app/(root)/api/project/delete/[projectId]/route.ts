import { authenticate } from "@/lib/auth";
import { ProjectModel } from "@/models/project.model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: Promise<{ projectId: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        const { projectId } = await params;
        if (!projectId) return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

        // Find project
        const project = await ProjectModel.findById(projectId);
        if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

        // Ensure user owns the project
        if (project.userId.toString() !== userId) {
            return NextResponse.json({ success: false, error: "You are not authorized to delete this project" }, { status: 403 });
        }

        // Delete the project
        await ProjectModel.findByIdAndDelete(projectId);

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully",
            projectId,
        });
    } catch (error: unknown) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
