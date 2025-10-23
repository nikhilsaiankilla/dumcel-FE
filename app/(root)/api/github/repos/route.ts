import { authenticate } from "@/lib/auth";
import { TokenModel } from "@/models/tokens.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Assume userId is attached via middleware
        const userFromReq = authenticate(req);
        const userId = userFromReq?.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized user" },
                { status: 401 }
            );
        }

        const tokenDoc = await TokenModel.findOne({ user: userId, provider: "github" });
        if (!tokenDoc?.accessToken) {
            return NextResponse.json(
                { success: false, error: "GitHub not connected" },
                { status: 400 }
            );
        }

        // Fetch public repositories
        const reposRes = await fetch(
            "https://api.github.com/user/repos?visibility=public",
            {
                headers: { Authorization: `Bearer ${tokenDoc.accessToken}` },
            }
        );

        if (!reposRes.ok) {
            throw new Error(`GitHub API request failed with status ${reposRes.status}`);
        }

        const repos = await reposRes.json();

        return NextResponse.json({
            success: true,
            data: repos,
        });
    } catch (err) {
        console.error("GitHub repo fetch error:", err);
        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
