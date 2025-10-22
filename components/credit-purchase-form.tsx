"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import Script from "next/script"
import { toast } from "sonner"

const CREDIT_RATE = 2

export function BuyCreditsForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [resError, setResError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [credits, setCredits] = useState<number>(0);

    const total = credits * CREDIT_RATE

    const onSubmit = async () => {
        try {
            setLoading(true)
            setResError("")
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Authentication token not found")

            if (credits < 10) {
                throw new Error('Buy Minimum 10 credits');
            } else if (credits > 50) {
                throw new Error('You only buy maximum 50 credits');
            }

            const res = await fetch(`http://localhost:8003/payment/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    amount: total * 100, // in paise
                    credits: credits,
                }),
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(`Order creation failed (${res.status}): ${text}`)
            }

            const json = await res.json()
            if (!json.success) throw new Error(json.error || "Order creation failed")

            const { orderId, amount, currency } = json?.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: "Dumcel",
                description: `${credits} credits purchase`,
                order_id: orderId,
                theme: { color: "#0f172a" },
                handler: async (response: any) => {
                    try {
                        if (
                            !response.razorpay_order_id ||
                            !response.razorpay_payment_id ||
                            !response.razorpay_signature
                        ) {
                            throw new Error("Incomplete payment response")
                        }

                        const verifyRes = await fetch(
                            `http://localhost:8003/payment/verify-order`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    credits: credits,
                                    amount: total,
                                }),
                            }
                        )

                        const verifyJson = await verifyRes.json()

                        if (!verifyJson.success) {
                            throw new Error(verifyJson.error || "Payment verification failed")
                        }

                        alert("Payment verified successfully!")
                    } catch (err: any) {
                        console.error("Payment verification error:", err)
                        setResError(err.message || "Payment verification failed")
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                        toast.info(`Payment Cancelled By User`)
                    },
                },
            }

            // @ts-ignore
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err: unknown) {
            console.error("Order creation error:", err)
            setResError(err instanceof Error ? err.message : "Something went wrong during order creation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Razorpay script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="w-[380px] shadow-lg">
                    <CardHeader>
                        <CardTitle>Buy Credits</CardTitle>
                        <CardDescription>
                            Purchase credits to unlock premium features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="credits">Credits</FieldLabel>
                                    <Input
                                        id="credits"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        min={10}
                                        max={50}
                                        placeholder="Enter credits (10–50)"
                                        value={credits === 0 ? 0 : credits} // shows empty initially
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCredits(Number(val))
                                        }}
                                        required
                                    />
                                </Field>

                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Rate: ₹{CREDIT_RATE}/credit</span>
                                    <span>Total: ₹{total}</span>
                                </div>

                                <Field>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="cursor-pointer w-full"
                                    >
                                        {loading ? (
                                            <>
                                                Processing <Loader className="animate-spin ml-2" />
                                            </>
                                        ) : (
                                            "Proceed to Pay"
                                        )}
                                    </Button>
                                    <p className="text-gray-300 text-sm mt-3 p-3 bg-amber-500/10 border-[0.5px] rounded-md border-amber-500/20">
                                        Minimum 10 and maximum 50 credits can be purchased.
                                        Credits are <span className="font-semibold text-amber-400">non-refundable</span>.
                                        Don’t buy this if you’re trying to go production this setup will be shut down soon.
                                        If you’re just curious or don’t mind spending a few bucks for fun, you’re welcome to proceed.
                                    </p>

                                </Field>
                            </FieldGroup>

                            {resError && (
                                <p className="text-red-500 text-sm mt-1 text-center">
                                    {resError}
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
