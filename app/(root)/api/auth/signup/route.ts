import { CreditTransactionModel } from "@/models/creditTransaction.model";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcryptjs";
import { connectDb } from "@/utils/connectDb";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        console.log('inside the db');
        
        const schema = z.object({
            name: z.string().min(3, "Name must be at least 3 characters"),
            email: z.string().email(),
            password: z
                .string()
                .min(6, "Password must be at least 6 characters long")
                .regex(/[A-Z]/, "Password must include at least one uppercase letter")
                .regex(/[a-z]/, "Password must include at least one lowercase letter")
                .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
        });

        // Parse body
        const body = await req.json();
        const { email, password, name } = schema.parse(body);

        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            credits: 10,
        });

        // Log credit transaction
        await CreditTransactionModel.create({
            userId: newUser._id,
            type: "credit",
            amount: 10,
            reason: "Welcome bonus for signing up",
            balanceAfter: newUser.credits,
        });

        // TODO: Trigger Kafka queue if needed

        return NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                userId: newUser._id,
                credits: newUser.credits,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
