import { authenticate } from "@/lib/auth";
import { CreditTransactionModel } from "@/models/creditTransaction.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const userFromReq = authenticate(req);
        const userId = userFromReq?.userId;

        if (!userId) return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // Pagination
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Fetch transactions & total count
        const [transactions, totalCount] = await Promise.all([
            CreditTransactionModel.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CreditTransactionModel.countDocuments({ userId }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                transactions,
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
    } catch (error) {
        console.error("Get all credit usage error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
