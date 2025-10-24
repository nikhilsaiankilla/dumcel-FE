"use client"

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
import z from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"

const signupSchema = z.object({
    name: z.string().min(3, 'Name should contain atleast 3 characters'),
    email: z.string().email(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
    confirmPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
})

type Inputs = z.infer<typeof signupSchema>

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const [resErrors, setResErrors] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setResErrors(""); // clear previous errors
        setLoading(true);

        try {
            const res = await fetch(`/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.error || "Something went wrong during signup");
            }

            // Signup successful
            router.push("/login");

        } catch (err: unknown) {
            setResErrors(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-1.5", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Sign up to your account</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1.5">
                        <FieldGroup className="-space-y-5.5">
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Nikhil Sai"
                                    {...register("name")}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-0.5">{errors.name.message}</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    {...register("email")}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-0.5">{errors.email.message}</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-0.5">{errors.password.message}</p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    {...register("confirmPassword")}
                                    required
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-0.5">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </Field>

                            <Field className="pt-2">
                                <Button type="submit" className="w-full">
                                    {loading ? <>Signing up <Loader className="animate-spin" /></> : "Signup"}
                                </Button>
                                <Button variant="outline" type="button" className="w-full mt-1.5">
                                    Login with GitHub
                                </Button>
                                <FieldDescription className="text-center mt-2 text-sm">
                                    Already have an account?{" "}
                                    <a href="/login" className="underline">
                                        Login
                                    </a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                    {resErrors && <p className="text-red-500 text-sm mt-0.5">
                        {resErrors}
                    </p>}
                </CardContent>
            </Card>
        </div>
    )
}
