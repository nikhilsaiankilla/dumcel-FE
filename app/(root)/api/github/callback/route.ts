import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "@/models/user.model";
import { CreditTransactionModel } from "@/models/creditTransaction.model";
import { connectDb } from "@/utils/connectDb";
import { TokenModel } from "@/models/tokens.model";

export async function GET(req: NextRequest) {
    await connectDb();

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    const githubClientId =
        process.env.GITHUB_CLIENT_ID;
    const githubClientSecret =
        process.env.GITHUB_CLIENT_SECRET;
    const jwtSecret =
        process.env.JWT_SECRET;
    const frontendUrl =
        process.env.FRONTEND_URL;

    if (!githubClientId || !githubClientSecret || !jwtSecret) {
        return NextResponse.json(
            { success: false, error: "GitHub auth secrets missing" },
            { status: 500 }
        );
    }

    if (!code) {
        return NextResponse.json(
            { success: false, error: "Missing authorization code" },
            { status: 500 }
        );
    }

    if (!state) {
        return NextResponse.json(
            { success: false, error: "Missing State" },
            { status: 500 }
        );
    }

    if (state === "login") {
        try {
            // Exchange code → access token
            const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                }),
            });

            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;
            if (!accessToken) throw new Error("GitHub token exchange failed");

            // Get GitHub user profile + email
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

            // Use githubId or email to find user
            let user =
                (primaryEmail && (await UserModel.findOne({ email: primaryEmail }))) ||
                (await UserModel.findOne({ githubId: ghUser.id }));

            // If not found, create new user
            if (!user) {
                user = await UserModel.create({
                    name: ghUser.name || ghUser.login,
                    email: primaryEmail || `${ghUser.login}@github.nouser`,
                    githubId: ghUser.id,
                    photo: ghUser.avatar_url,
                    credits: 10, // Welcome bonus
                });

                await CreditTransactionModel.create({
                    userId: user._id,
                    type: "credit",
                    amount: 10,
                    reason: "Welcome bonus for joining via GitHub",
                    balanceAfter: user.credits,
                });
            } else {
                // Update missing GitHub fields if necessary
                if (!user.githubId) {
                    user.githubId = ghUser.id;
                    await user.save();
                }
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

            response.cookies.set("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600, // 1 hour
                sameSite: "lax",
                path: "/",
            });

            return response;
        } catch (error: unknown) {
            console.log('git repo logging ', error);
            const errorMessage = error instanceof Error ? error.message : "Something Went Wrong";
            return NextResponse.redirect(`${frontendUrl}/login?github=error&message=${encodeURIComponent(errorMessage)}`);
        }
    }

    if (state === "repo") {
        try {
            // Verify JWT instead of parsing as JSON
            const token = req.cookies.get("token")?.value;
            const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string);

            if (decoded?.userId) {
                if (!code) throw new Error("Missing authorization code");
                if (!state) throw new Error("Missing state");

                // Decode JWT user from state
                let userId: string;
                try {
                    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string);
                    userId = decoded.userId;
                    if (!userId) throw new Error("Invalid state payload");
                } catch {
                    throw new Error("Invalid state token");
                }

                // Exchange code → access token with repo scope
                const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                        client_id: process.env.GITHUB_CLIENT_ID,
                        client_secret: process.env.GITHUB_CLIENT_SECRET,
                        code,
                        scope: "public_repo",
                    }),
                });

                const tokenData = await tokenRes.json();
                const accessToken = tokenData.access_token;
                if (!accessToken) throw new Error("GitHub token exchange failed");

                // Save or update token
                await TokenModel.findOneAndUpdate(
                    { user: userId, provider: "github" },
                    { accessToken },
                    { upsert: true, new: true }
                );

                await UserModel.findByIdAndUpdate(userId, { isGitConnected: true }, { new: true });

                const frontendUrl = process.env.FRONTEND_URL; // e.g., http://localhost:3000
                return NextResponse.redirect(`${frontendUrl}/dashboard?github=success`);
            }
        } catch (error: unknown) {
            console.log('git repo connecting error ', error);

            const errorMessage = error instanceof Error ? error.message : "Something Went Wrong";
            return NextResponse.redirect(`${frontendUrl}/dashboard?github=error&message=${encodeURIComponent(errorMessage)}`);
        }
    }
}
