"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileDropdownProps {
    user?: {
        name?: string;
        photo?: string;
        email?: string;
    } | null;
    loading?: boolean;
    error?: string | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            const json = await res.json();
            
            if (res.ok) {
                localStorage.removeItem('token')
                router.push("/");
            } else {
                console.error("Failed to logout");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmText.trim().toLowerCase() !== "delete") return;
        setDeleting(true);

        try {
            const res = await fetch("/api/auth/delete/account", {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setIsDialogOpen(false);
                router.push("/signup");
            } else {
                console.error("Failed to delete account");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="cursor-pointer">
                        {user?.photo ? (
                            <AvatarImage src={user.photo} />
                        ) : (
                            <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
                        )}
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="mt-2 w-56">
                    <DropdownMenuLabel>{user?.name ?? "User"}</DropdownMenuLabel>
                    <p className="text-xs px-2 text-gray-300 mb-2">
                        {user?.email ?? "email"}
                    </p>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => router.push("/dashboard/credits")}>
                        Buy Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.push("/dashboard/credit-usage")}
                    >
                        Credit Usage
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/payments")}>
                        Payments
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Delete Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone. <br />
                            To confirm, type <span className="font-semibold">DELETE</span>{" "}
                            below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Input
                            placeholder="Type DELETE to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={confirmText.trim().toLowerCase() !== "delete" || deleting}
                            onClick={handleDeleteAccount}
                            className="cursor-pointer bg-red-500 hover:bg-red-500 text-white"
                        >
                            {deleting ? "Deleting..." : "Confirm Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfileDropdown;
