"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTable } from "./data-table";
import { PaymentsColumns } from "./columns/payments-columns";

export interface ICreditPurchase {
    user: string;
    amount: number; // total INR amount paid
    credits: number; // credits granted for that payment
    orderId: string; // Razorpay order ID
    paymentId?: string; // Razorpay payment ID (after success)
    status: "created" | "paid" | "failed";
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentsTab = () => {
    const [payments, setPayments] = useState<ICreditPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState<{
        hasNextPage: boolean;
        hasPrevPage: boolean;
        page: number;
        totalPages: number;
    }>({
        hasNextPage: false,
        hasPrevPage: false,
        page: 1,
        totalPages: 1,
    });

    const fetchPayments = async (pageNum = 1) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const url = `/api/credits/get-payments?page=${pageNum}&limit=${limit}`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to fetch payments (${res.status}): ${text}`);
            }

            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Failed to fetch payments");

            const mappedPayments: ICreditPurchase[] = (json?.data?.payments || []).map((p: any) => ({
                ...p,
                createdAt: new Date(p.createdAt),
                updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
            }));

            setPayments(mappedPayments);
            setPagination({
                hasNextPage: json?.data?.pagination?.hasNextPage ?? false,
                hasPrevPage: json?.data?.pagination?.hasPrevPage ?? false,
                page: json?.data?.pagination?.page ?? 1,
                totalPages: json?.data?.pagination?.totalPages ?? 1,
            });

        } catch (err: unknown) {
            console.error("Error fetching payments:", err);
            setError(err instanceof Error ? err.message : "Something went wrong while fetching payments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(page);
    }, [page]);

    const handlePrev = () => {
        if (pagination.hasPrevPage) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (pagination.hasNextPage) setPage((prev) => prev + 1);
    };

    if (loading) {
        return (
            <div className="w-full min-h-[75vh] space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-14 rounded-md shadow-sm" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-[75vh] flex items-center justify-center">
                <h1 className="text-red-500">{error}</h1>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1 className="text-lg md:text-3xl font-bold text-foreground mb-4">Your Payments</h1>

            <div className="w-full flex min-h-[70vh] items-center justify-between flex-col gap-5">
                <div className="w-full mt-5">
                    {payments.length === 0 ? (
                        <div className="w-full flex items-center justify-center">
                            <h1>No Payments Found</h1>
                        </div>
                    ) : (
                        <DataTable columns={PaymentsColumns} data={payments} />
                    )}
                </div>

                {pagination.totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePrev();
                                    }}
                                    className={
                                        pagination.hasPrevPage
                                            ? ""
                                            : "opacity-50 pointer-events-none"
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            isActive={pagination.page === pageNum}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(pageNum);
                                            }}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNext();
                                    }}
                                    className={
                                        pagination.hasNextPage
                                            ? ""
                                            : "opacity-50 pointer-events-none"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
};

export default PaymentsTab;
