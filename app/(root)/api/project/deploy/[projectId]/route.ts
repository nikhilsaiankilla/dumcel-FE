import { DeploymentModel } from "@/models/deployment.model";
import { ProjectModel } from "@/models/project.model";
import { TokenModel } from "@/models/tokens.model";
import { DeploymentState } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { authenticate } from "@/lib/auth";
import { getECSClient } from "@/utils/initConfigs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const ecsClient = getECSClient();

        const { projectId } = await params;
        if (!projectId) return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

        // Authenticate user
        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;
        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        // Parse environment variables from request
        const body = await request.json();
        const { env } = body;

        // Fetch project
        const project = await ProjectModel.findById(projectId);
        if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

        // Check critical AWS env vars
        const { CLUSTER_ARN, TASK_DEFINITION_ARN, SUBNET_1, SUBNET_2, SUBNET_3, SECURITY_GROUP_ID, BUILDER_CONTAINER_NAME } = process.env;
        if (!CLUSTER_ARN || !TASK_DEFINITION_ARN || !SUBNET_1 || !SECURITY_GROUP_ID || !BUILDER_CONTAINER_NAME) {
            throw new Error("Missing critical AWS configuration");
        }

        // Create deployment record as QUEUED
        const deployment = await DeploymentModel.create({
            projectId,
            state: DeploymentState.QUEUED,
            userId,
        });

        // Get user Git token
        const userTokenDoc = await TokenModel.findOne({ user: userId });
        if (!userTokenDoc?.accessToken) throw new Error("Git token not found for user");
        const gitToken = userTokenDoc.accessToken;

        // Prepare ECS environment variables
        const authEnv = [{ name: "GIT_TOKEN", value: gitToken }];
        const envArray =
            env && typeof env === "object"
                ? Object.entries(env).map(([key, value]) => ({ name: key, value: String(value) }))
                : [];

        const baseEnv = [
            { name: "PROJECT_ID", value: projectId },
            { name: "DEPLOYMENT_ID", value: deployment.id },
            { name: "SUB_DOMAIN", value: project.subDomain },
            { name: "GIT_REPO_URL", value: project.gitUrl },
        ];

        const allEnvVars = [...baseEnv, ...envArray, ...authEnv];
        const subnets = [SUBNET_1, SUBNET_2, SUBNET_3].filter((s): s is string => !!s);

        // Run ECS Task
        const command = new RunTaskCommand({
            cluster: CLUSTER_ARN,
            taskDefinition: TASK_DEFINITION_ARN,
            launchType: "FARGATE",
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: "ENABLED",
                    subnets,
                    securityGroups: [SECURITY_GROUP_ID],
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: BUILDER_CONTAINER_NAME,
                        environment: allEnvVars,
                    },
                ],
            },
        });

        await ecsClient.send(command);

        return NextResponse.json({
            success: true,
            message: "Deployment queued successfully",
            data: { projectId, deploymentId: deployment.id, subDomain: project.subDomain },
        });
    } catch (error: unknown) {
        console.error("Deploy error:", error);

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
