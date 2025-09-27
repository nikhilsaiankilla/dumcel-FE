"use client"

import { Menu, X } from 'lucide-react';
import { bitcountSingle } from '@/fonts/font'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="relative flex items-center justify-between w-full px-4 bg-white sm:px-7 md:px-20 py-5 overflow-x-hidden">
            <Link href="/" className="flex items-end justify-center gap-2">
                <div className="bg-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Image src="/logo.png" alt="Dumcel" width={24} height={24} />
                </div>
                <h1
                    className={`md:block hidden text-black text-xl font-semibold cursor-pointer tracking-wide ${bitcountSingle.className}`}
                >
                    Dumcel
                </h1>
            </Link>

            {/* Desktop menu */}
            <ul
                className={`md:flex hidden text-black items-center gap-6 ${bitcountSingle.className}`}
            >
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        href="/dashboard"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Deploy
                    </Link>
                </li>
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Login
                    </Link>
                </li>
            </ul>

            {/* Mobile menu */}
            <ul
                className={`md:hidden w-screen h-screen text-black bg-white flex items-center justify-center flex-col gap-10 fixed top-0 ${isOpen ? "right-0" : "-right-full"} z-40 transition-all duration-300 ease-linear ${bitcountSingle.className}`}
            >
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        href="/dashboard"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Deploy
                    </Link>
                </li>
                <li>
                    <Link
                        href="/"
                        className="text-lg cursor-pointer hover:text-purple-400 transition-colors duration-200"
                    >
                        Login
                    </Link>
                </li>
            </ul>

            {/* Mobile toggle button */}
            <div className="absolute right-5 top-6 md:hidden z-50">
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className='text-black' /> : <Menu className='text-black' />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
