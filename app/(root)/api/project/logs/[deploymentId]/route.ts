import { authenticate } from "@/lib/auth";
import { createClient } from "@clickhouse/client";
import { NextRequest, NextResponse } from "next/server";

const clickhouseClient = createClient({
    url: process.env.CLICKHOUSE_URL,
    database: process.env.DATABASE,
    username: process.env.CLICKHOUSE_USER_NAME,
    password: process.env.CLICKHOUSE_PASSWORD
});

interface LogRow {
    event_id: string;
    project_id: string;
    deployment_id: string;
    log: string;
    timestamp: string; // or Date if you parse it
    type: string;
    step: string;
    meta?: Record<string, any>;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ deploymentId: string }> }
) {
    try {
        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });
        }

        const { deploymentId } = await params;
        if (!deploymentId) {
            return NextResponse.json({ success: false, error: "Deployment ID is required" }, { status: 400 });
        }

        const lastTimestamp = request.nextUrl.searchParams.get("lastTimestamp") || "1970-01-01 00:00:00";
        const limitValue = Number(request.nextUrl.searchParams.get("limit")) || 500;

        if (!clickhouseClient) {
            throw new Error("ClickHouse client not initialized");
        }

        const query = `
            SELECT 
                event_id, 
                project_id, 
                deployment_id, 
                log, 
                timestamp, 
                type, 
                step, 
                meta
            FROM log_events
            WHERE deployment_id = {deployment_id:String}
            AND timestamp > {lastTimestamp:DateTime}
            ORDER BY timestamp ASC
            LIMIT {limit:Int32}
        `;

        const logsResponse = await clickhouseClient.query({
            query,
            query_params: {
                deployment_id: deploymentId,
                lastTimestamp,
                limit: limitValue,
            },
            format: "JSONEachRow",
        });

        const rawLogs = (await logsResponse.json()) as LogRow[];

        return NextResponse.json({
            success: true,
            data: {
                count: rawLogs.length,
                lastTimestamp: rawLogs.length > 0 ? rawLogs[rawLogs.length - 1].timestamp : lastTimestamp,
                logs: rawLogs,
            },
        });

    } catch (error: unknown) {
        console.error("Error fetching logs:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
