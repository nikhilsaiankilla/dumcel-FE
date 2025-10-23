import { authenticate } from "@/lib/auth";
import { createClient } from "@clickhouse/client";
import { NextRequest, NextResponse } from "next/server";

const clickhouseClient = createClient({
    url: process.env.CLICKHOUSE_URL,
    database: process.env.DATABASE,
    username: process.env.CLICKHOUSE_USER_NAME,
    password: process.env.CLICKHOUSE_PASSWORD
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const userFromReq = authenticate(req);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        // FIX 1: Access dynamic route segment (projectId) from the 'params' object
        const { projectId } = await params;

        if (!clickhouseClient) {
            // Return a standard HTTP response for missing dependencies
            return NextResponse.json(
                { success: false, error: "ClickHouse client not initialized" },
                { status: 503 } // 503 Service Unavailable is often suitable for missing external service
            );
        }

        if (!projectId) {
            // Return a standard HTTP response for missing required data
            return NextResponse.json(
                { success: false, error: "Project Id is Missing" },
                { status: 400 } // 400 Bad Request
            );
        }

        // FIX 3 (Minor Consistency): Use the more robust and readable 'INTERVAL 7 DAY' 
        // for all ClickHouse queries for consistency.
        const last7DaysCondition = `timestamp >= now() - INTERVAL 7 DAY`;

        const [
            countryRows,
            deviceRows,
            browserRows,
            osRows,
            referrerRows,
            dailyVisitorsRows,
            languageRows,
            avgVisitsRows,
            totalUniqueVisitorsRows
        ] = await Promise.all([
            clickhouseClient.query({
                query: `SELECT country, COUNT(DISTINCT ip) AS visitors FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} AND country != '' GROUP BY country ORDER BY visitors DESC LIMIT 10`,
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT device_type, COUNT(*) AS count FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY device_type`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT browser, COUNT(*) AS count FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY browser ORDER BY count DESC`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT os, COUNT(*) AS count FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY os ORDER BY count DESC`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT referrer, COUNT(*) AS count FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY referrer ORDER BY count DESC LIMIT 10`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT toDate(timestamp) AS date, COUNT(DISTINCT ip) AS unique_visitors FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY date ORDER BY date ASC`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT accept_language, COUNT(*) AS count FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY accept_language ORDER BY count DESC LIMIT 10`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT round(avg(visits), 2) AS avg_visits_per_ip FROM (SELECT ip, COUNT(*) AS visits FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition} GROUP BY ip)`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json()),

            clickhouseClient.query({
                query: `SELECT COUNT(DISTINCT ip) AS total_unique_visitors FROM project_analytics WHERE project_id = {projectId:String} AND ${last7DaysCondition}`, // Used consistent filter
                query_params: { projectId },
                format: "JSONEachRow"
            }).then((r: any) => r.json())
        ]);

        // FIX 2: Return a new NextResponse
        return NextResponse.json({
            success: true,
            analytics: {
                countryDistribution: countryRows,
                deviceTypeDistribution: deviceRows,
                browserDistribution: browserRows,
                osDistribution: osRows,
                topReferrers: referrerRows,
                dailyVisitorsTrend: dailyVisitorsRows,
                languagePreferences: languageRows,
                // The optional chaining is good, but for safety with TS, 
                // cast the global client to 'any' or define its type 
                // on the global object's declaration.
                averageVisitsPerIp: avgVisitsRows?.[0]?.avg_visits_per_ip || 0,
                totalUniqueVisitors: totalUniqueVisitorsRows?.[0]?.total_unique_visitors || 0
            }
        }, { status: 200 }); // Specify the status

    } catch (error: unknown) {
        console.error("Error fetching analytics:", error);

        // FIX 2: Return a new NextResponse for error handling
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error"
            },
            { status: 500 }
        );
    }
}