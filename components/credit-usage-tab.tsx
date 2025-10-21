"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTable } from "./data-table";
import { CreditUsageColumns } from "./columns/credits-columns";

export interface CreditUsageType {
    _id: string;
    type: "credit" | "debit";
    amount: number;
    reason: string;
    relatedEntity?: string;
    balanceAfter: number;
    createdAt: Date;
}

const CreditUsageTab = () => {
    const [transactions, setTransactions] = useState<CreditUsageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({
        hasNextPage: false,
        hasPrevPage: false,
        page: 1,
        totalPages: 1,
    });

    const fetchTransactions = async (pageNum = 1) => {
        try {
            const token = localStorage.getItem("token");
            setLoading(true);

            const url = `${process.env.NEXT_PUBLIC_BASE_URL}/credits?page=${pageNum}&limit=${limit}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                setLoading(false);
                return setError("Something went wrong while fetching credit usage.");
            }

            const json = await res.json();

            const mappedTransactions: CreditUsageType[] =
                (json?.data?.transactions || []).map((t: any) => ({
                    _id: t._id,
                    type: t.type,
                    amount: t.amount,
                    reason: t.reason,
                    relatedEntity: t.relatedEntity,
                    balanceAfter: t.balanceAfter,
                    createdAt: new Date(t.createdAt),
                }));

            setTransactions(mappedTransactions);
            setPagination({
                hasNextPage: json?.data?.pagination?.hasNextPage || false,
                hasPrevPage: json?.data?.pagination?.hasPrevPage || false,
                page: json?.data?.pagination?.page || 1,
                totalPages: json?.data?.pagination?.totalPages || 1,
            });

            setLoading(false);
        } catch (err: unknown) {
            setLoading(false);
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    useEffect(() => {
        fetchTransactions(page);
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
        <div className="w-full flex flex-col gap-5">
            <h1 className="text-lg md:text-3xl font-bold text-foreground">
                Recent Credit Usage
            </h1>

            <div className="w-full mt-5">
                {transactions.length === 0 ? (
                    <div className="w-full flex items-center justify-center">
                        <h1>No Transactions Found</h1>
                    </div>
                ) : (
                    <DataTable columns={CreditUsageColumns} data={transactions} />
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
                                    pagination.hasPrevPage ? "" : "opacity-50 pointer-events-none"
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
                                    pagination.hasNextPage ? "" : "opacity-50 pointer-events-none"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default CreditUsageTab;
