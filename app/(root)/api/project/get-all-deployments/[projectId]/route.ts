import { authenticate } from "@/lib/auth";
import { DeploymentModel } from "@/models/deployment.model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: { projectId: string };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        const { projectId } = params;
        if (!projectId) return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

        // Pagination
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const state = searchParams.get("state") || undefined;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = { projectId };
        if (state) filter.state = state;

        const [deployments, totalCount] = await Promise.all([
            DeploymentModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "projectId", select: "_id projectName subDomain updatedAt" }),
            DeploymentModel.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                deployments,
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
        console.error("Error fetching project deployments:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
