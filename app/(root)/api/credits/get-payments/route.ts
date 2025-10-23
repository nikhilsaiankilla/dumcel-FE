import { authenticate } from "@/lib/auth";
import { CreditPurchaseModel } from "@/models/payment.model";
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

        // Pagination from query params
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Fetch payments & total count
        const [payments, totalCount] = await Promise.all([
            CreditPurchaseModel.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CreditPurchaseModel.countDocuments({ userId }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                payments,
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
        console.error("Get all payments error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
