import Razorpay from "razorpay";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { CreditPurchaseModel } from "@/models/payment.model";
import { UserModel } from "@/models/user.model";
import { CreditTransactionModel } from "@/models/creditTransaction.model";

// Razorpay keys
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

export async function POST(request: NextRequest) {
    try {
        const userId = (request as any).user?.userId;
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthenticated user" }, { status: 401 });
        }

        if (!razorpayKeyId || !razorpayKeySecret) throw new Error("Razorpay keys are not set");

        const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
        });

        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits, amount } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Missing payment verification fields" },
                { status: 400 }
            );
        }

        // Verify Razorpay signature
        const hmac = crypto.createHmac("sha256", razorpayKeySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest("hex");

        if (razorpay_signature !== generated_signature) {
            return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
        }

        // Update or create CreditPurchase record
        await CreditPurchaseModel.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                userId,
                paymentId: razorpay_payment_id,
                status: "paid",
                credits,
                amount,
            },
            { new: true, upsert: true }
        );

        // Update User credits
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $inc: { credits } },
            { new: true }
        );

        // Log transaction
        await CreditTransactionModel.create({
            userId,
            type: "credit",
            amount,
            reason: "Credit purchase",
            relatedEntity: razorpay_payment_id,
            balanceAfter: user?.credits,
        });

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
            data: {
                credits,
                amount,
                balance: user?.credits,
            },
        });
    } catch (error) {
        console.error("Verify order error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
