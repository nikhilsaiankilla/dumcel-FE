import { CreditTransactionModel } from "@/models/creditTransaction.model";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const githubClientId =
            process.env.GITHUB_CLIENT_ID || (global as any)?.secrets?.github_client_id;
        const githubClientSecret =
            process.env.GITHUB_CLIENT_SECRET || (global as any)?.secrets?.github_client_secret;
        const jwtSecret =
            process.env.JWT_SECRET || (global as any)?.secrets?.jwt_secret || "secret";
        const frontendUrl =
            process.env.FRONTEND_URL || (global as any)?.secrets?.frontend_url || "http://localhost:3000";

        if (!githubClientId || !githubClientSecret) {
            throw new Error("GitHub auth secrets missing from environment or global.secrets");
        }

        // Extract "code" param properly
        const code = req.nextUrl.searchParams.get("code");
        if (!code) {
            return NextResponse.json({ success: false, error: "Missing authorization code" }, { status: 400 });
        }

        // Exchange code → access token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: githubClientId,
                client_secret: githubClientSecret,
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("GitHub token exchange failed");

        // Get GitHub user + emails
        const [userRes, emailRes] = await Promise.all([
            fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);

        const ghUser = await userRes.json();
        const ghEmails = await emailRes.json();
        const primaryEmail = ghEmails.find((e: any) => e.primary)?.email;

        // Find or create user
        let user =
            (primaryEmail && (await UserModel.findOne({ email: primaryEmail }))) ||
            (await UserModel.findOne({ githubId: ghUser.id }));

        if (!user) {
            user = await UserModel.create({
                name: ghUser.name || ghUser.login,
                email: primaryEmail || `${ghUser.login}@github.nouser`,
                githubId: ghUser.id,
                photo: ghUser.avatar_url,
                credits: 10,
            });

            await CreditTransactionModel.create({
                userId: user._id,
                type: "credit",
                amount: 10,
                reason: "Welcome bonus for joining via GitHub",
                balanceAfter: user.credits,
            });
        } else if (!user.githubId) {
            user.githubId = ghUser.id;
            await user.save();
        }

        // Issue JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            jwtSecret,
            { expiresIn: "1h" }
        );

        // Prepare redirect response
        const redirectUrl = `${frontendUrl}/auth/github?token=${token}`;
        const response = NextResponse.redirect(redirectUrl);

        // Set cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600, // 1 hour
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("GitHub login error:", err);

        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "GitHub login failed",
            },
            { status: 500 }
        );
    }
}
