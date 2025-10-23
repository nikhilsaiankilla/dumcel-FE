import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { ProjectModel } from "@/models/project.model";

export async function GET(request: NextRequest) {
    try {
        const schema = z.object({
            subDomain: z
                .string()
                .min(1, "Subdomain is required")
                .regex(/^[a-z0-9-]+$/, "Subdomain must contain only lowercase letters, numbers, and hyphens"),
        });

        const subDomainParam = request.nextUrl.searchParams.get("subDomain") || "";
        const { subDomain } = schema.parse({ subDomain: subDomainParam });

        const existingProject = await ProjectModel.findOne({ subDomain });

        const available = !existingProject;
        const message = available ? "Subdomain is available." : "Subdomain is already taken.";

        return NextResponse.json({
            success: true,
            available,
            message,
        });
    } catch (error: unknown) {
        console.error("Error checking subdomain:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation Error",
                    message: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Server Error",
                message: "Failed to check subdomain availability.",
            },
            { status: 500 }
        );
    }
}
