import ProfileDropdown from "@/components/profile-dropdown";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <section className="w-full">
            <nav className="w-full flex items-center justify-between px-5 py-5 md:px-20">
                <Link href="/dashboard" className="flex items-end gap-2">
                    <Image src="/logo.png" alt="logo" width={30} height={30} className="cursor-pointer" />
                    <span className="text-white text-xl hidden md:block">Dumcel</span>
                </Link>

                <ProfileDropdown />
            </nav>
            {
                children
            }
        </section>
    )
}
