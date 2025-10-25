"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CreditUsageType } from "../credit-usage-tab";
import { Badge } from "../ui/badge";
import CustomBadge from "../custom-badge";

export const CreditUsageColumns: ColumnDef<CreditUsageType>[] = [
    {
        accessorKey: "_id",
        header: "Transaction ID",
        cell: ({ row }) => {
            const id: string = row.getValue("_id");
            return <span className="text-sm font-bold text-white">{id.slice(-6)}</span>; // last 6 digits
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type: string = row.getValue("type")

            return (
                <CustomBadge variant="type" type={type} className="capitalize" />
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
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => {
            const reason: string = row.getValue("reason");
            return <span className="text-gray-300">{reason}</span>;
        },
    },
    {
        accessorKey: "balanceAfter",
        header: "Balance After",
        cell: ({ row }) => {
            const balance: number = row.getValue("balanceAfter");
            return <span className="font-medium text-gray-300">₹{balance}</span>;
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
