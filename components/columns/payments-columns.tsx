"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ICreditPurchase } from "../payments-tab";
import { Badge } from "../ui/badge";
import CustomBadge from "../custom-badge";

export const PaymentsColumns: ColumnDef<ICreditPurchase>[] = [
    {
        accessorKey: "orderId",
        header: "Order ID",
        cell: ({ row }) => {
            const orderId: string = row.getValue("orderId");
            return <span className="text-sm text-white">{orderId}</span>; // last 6 digits
        },
    },
    {
        accessorKey: "paymentId",
        header: "Payment ID",
        cell: ({ row }) => {
            const paymentId: string | undefined = row.getValue("paymentId");
            return paymentId ? (
                <Link href={`#`} className="text-blue-400 hover:underline flex items-center gap-1">
                    {paymentId}
                </Link>
            ) : (
                <span className="text-gray-500">-</span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status: string = row.getValue("status")

            // Pass status directly to CustomBadge with a "status" variant
            return (
                <CustomBadge
                    variant="state" // or "status" if you want, internally treated the same as state
                    type={status}
                    className="capitalize"
                />
            )
        },
    },
    {
        accessorKey: "amount",
        header: "Amount (₹)",
        cell: ({ row }) => {
            const amount: number = row.getValue("amount");
            return <span className="font-medium text-gray-300">₹{amount}</span>;
        },
    },
    {
        accessorKey: "credits",
        header: "Credits",
        cell: ({ row }) => {
            const credits: number = row.getValue("credits");
            return <span className="font-medium text-gray-300">{credits}</span>;
        },
    },
    {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => {
            const currency: string = row.getValue("currency");
            return <span className="text-gray-300">{currency}</span>;
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const createdAt: Date = row.getValue("createdAt");
            return (
                <span>
                    {createdAt
                        ? new Date(createdAt).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })
                        : "-"}
                </span>
            );
        },
    },
];
