import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { UserModel } from "@/models/user.model";
import { ProjectModel } from "@/models/project.model";
import { CreditTransactionModel } from "@/models/creditTransaction.model";
import { generateSlug } from "random-word-slugs";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        const body = await request.json();

        const schema = z.object({
            name: z.string(),
            gitUrl: z.string(),
            subDomain: z.string().optional(),
        });

        const safeParseResult = schema.safeParse(body);
        if (!safeParseResult.success) {
            return NextResponse.json({ success: false, error: safeParseResult.error.message || "Required all fields" }, { status: 400 });
        }

        const { name, gitUrl, subDomain } = safeParseResult.data;

        // Fetch user to check credits
        const user = await UserModel.findById(userId);
        if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        if (user.credits < 10) {
            return NextResponse.json({ success: false, error: "Not enough credits. You need at least 10 credits to create a project." }, { status: 400 });
        }

        // Create project first
        const project = await ProjectModel.create({
            projectName: name,
            userId,
            gitUrl,
            subDomain: subDomain || generateSlug(),
        });

        // Deduct 10 credits after successful creation
        try {
            user.credits -= 10;
            await user.save();

            await CreditTransactionModel.create({
                userId: user._id,
                type: "debit",
                amount: 10,
                reason: `${name} Project creation`,
                balanceAfter: user.credits,
            });
        } catch (creditError) {
            console.error("Credit deduction failed:", creditError);
            // Optional: notify admin or rollback project if needed
        }

        return NextResponse.json({
            success: true,
            data: { project },
        });
    } catch (error) {
        console.error("Project creation error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
