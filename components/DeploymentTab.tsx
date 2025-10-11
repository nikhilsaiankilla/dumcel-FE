"use client"

import { DeploymentType } from "@/types";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { DataTable } from "./data-table";
import { DeploymentColumns } from "@/app/(root)/dashboard/DeploymentsColumns";

const DeploymentTab = () => {
    const [deployments, setDeployments] = useState<DeploymentType[]>([]);
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

    useEffect(() => {
        const fetchProjects = async (pageNum = 1) => {
            try {
                const token = localStorage.getItem('token');
                setLoading(true);
                const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + `/project/get-all-deployments?page=${pageNum}&limit=${limit}`, {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json"
                    }
                })

                if (!res.ok) {
                    setLoading(false)
                    return setError("Something went Wrong")
                }

                const deploymentsJson = await res.json();
                const mappedDeployments: DeploymentType[] = (deploymentsJson?.data?.deployments || []).map(
                    (d: any) => ({
                        _id: d._id,
                        projectId: d.projectId?._id || "",       // string
                        projectName: d.projectId?.projectName || "", // string
                        subDomain: d.projectId?.subDomain || "",    // string
                        state: d.state,
                        createdAt: new Date(d.createdAt),
                        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
                    })
                );

                setDeployments(mappedDeployments)
                setPagination({
                    hasNextPage: deploymentsJson?.data?.pagination?.hasNextPage || false,
                    hasPrevPage: deploymentsJson?.data?.pagination?.hasPrevPage || false,
                    page: deploymentsJson?.data?.pagination?.page || 1,
                    totalPages: deploymentsJson?.data?.pagination?.totalPages || 1,
                });
                setLoading(false)
            } catch (error: unknown) {
                setLoading(false)
                setError(error instanceof Error ? error.message : "Something went Wrong")
            }
        }
        fetchProjects(page)
    }, [page])

    const handlePrev = () => {
        if (pagination.hasPrevPage) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (pagination.hasNextPage) setPage((prev) => prev + 1);
    };

    if (loading) {
        return (
            <div className="w-full min-h-[75vh] space-y-2">
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
                <Skeleton className="w-full h-14 rounded-md shadow-sm" />
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
            <div className="w-full space-y-4">
                <h1 className="text-lg md:text-3xl font-bold text-foreground">Deployments</h1>
            </div>
            <div className="w-full flex min-h-[70vh] items-center justify-between flex-col gap-5">
                <div className="w-full mt-5">
                    {deployments.length === 0 ? (
                        <div className="w-full flex items-center justify-center">
                            <h1>No Deployments</h1>
                        </div>
                    ) : (
                        <DataTable columns={DeploymentColumns} data={deployments} />
                    )}
                </div>
                {
                    pagination.totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePrev();
                                        }}
                                        className={pagination.hasPrevPage ? "" : "opacity-50 pointer-events-none"}
                                    />
                                </PaginationItem>
                                {/* Render numbered page links */}
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
                                    {pagination.totalPages > 3 && <PaginationEllipsis />}
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNext();
                                        }}
                                        className={pagination.hasNextPage ? "" : "opacity-50 pointer-events-none"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )
                }
            </div>
        </div >
    )
}

export default DeploymentTab