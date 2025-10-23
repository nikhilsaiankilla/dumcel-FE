import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const githubClientId =
            process.env.GITHUB_CLIENT_ID || (global as any)?.secrets?.github_client_id;
        const githubClientSecret =
            process.env.GITHUB_CLIENT_SECRET || (global as any)?.secrets?.github_client_secret;

        if (!githubClientId || !githubClientSecret) {
            return NextResponse.json(
                { success: false, error: "Auth secrets are missing from environment or global.secrets." },
                { status: 500 }
            );
        }

        const redirectUri = "http://localhost:3000/connecting";
        const scope = "repo,user:email";

        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        return NextResponse.json(
            {
                success: true,
                redirectUri: githubAuthUrl,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GitHub OAuth init error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
