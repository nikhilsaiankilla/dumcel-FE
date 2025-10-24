import { authenticate } from "@/lib/auth";
import { connectDb } from "@/utils/connectDb";
import { getRazorpayClient } from "@/utils/initConfigs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDb();
        const razorpay = getRazorpayClient();
        const body = await request.json();
        const { amount, currency = "INR", credits } = body;

        const userFromReq = authenticate(request);
        const userId = userFromReq?.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        if (!amount || !credits) {
            return NextResponse.json(
                { success: false, error: "Missing amount or credits" },
                { status: 400 }
            );
        }

        const options = {
            amount, // amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                credits,
                receipt: order.receipt,
            },
        });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
