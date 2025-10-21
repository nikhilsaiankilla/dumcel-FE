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
import z from "zod"
import Script from "next/script"

const creditSchema = z.object({
    credits: z
        .number("Enter a valid number")
        .min(10, "Minimum 10 credits required")
        .max(10000, "Maximum 10,000 credits allowed"),
})

const CREDIT_RATE = 1

type Inputs = z.infer<typeof creditSchema>

export function BuyCreditsForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<Inputs>({
        resolver: zodResolver(creditSchema),
        defaultValues: { credits: 0 },
    })

    const [resError, setResError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const credits = watch("credits") || 0
    const total = credits * CREDIT_RATE

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            setLoading(true)
            setResError("")

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            const res = await fetch(`http://localhost:8003/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    amount: total * 100,
                    credits: data.credits,
                }),
            })

            const json = await res.json()
            if (!json.success) throw new Error(json.error || "Order creation failed")

            const { orderId, amount, currency } = json

            // Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "Dumcel",
                description: `${data.credits} credits purchase`,
                order_id: orderId,
                handler: async (response: any) => {
                    console.log('response ', response);

                    const verifyRes = await fetch(`http://localhost:8003/payment/verify-order`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response),
                    })
                    const verifyJson = await verifyRes.json()
                    console.log('Verify ', verifyJson);

                    if (verifyJson.success) {
                        alert("Payment verified successfully!")
                    } else {
                        alert("Payment verification failed")
                    }
                },
                theme: { color: "#0f172a" },
            }

            // @ts-ignore
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err: any) {
            setResError(err.message || "Something went wrong")
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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="credits">Credits</FieldLabel>
                                    <Input
                                        id="credits"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={2} // allows max 2 digits (up to 50)
                                        placeholder="Enter credits"
                                        {...register("credits", {
                                            setValueAs: (v) => (v === "" ? 0 : Number(v)),
                                            validate: (v) => {
                                                if (isNaN(v)) return "Only numbers are allowed";
                                                if (v < 1) return "Minimum 1 credit required";
                                                if (v > 50) return "Maximum 50 credits allowed";
                                                return true;
                                            },
                                        })}
                                        onKeyDown={(e) => {
                                            // Prevent typing anything except digits, backspace, tab, delete, arrows
                                            if (
                                                !/[0-9]/.test(e.key) &&
                                                !["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        required
                                    />
                                    {errors.credits && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.credits.message}
                                        </p>
                                    )}
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
                                    <FieldDescription className="text-center">
                                        Credits are non-refundable once purchased
                                    </FieldDescription>
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
