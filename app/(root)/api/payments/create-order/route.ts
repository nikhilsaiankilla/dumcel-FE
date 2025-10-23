import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

// Choose Razorpay keys based on environment
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys are not set");

const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = "INR", credits } = body;

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
