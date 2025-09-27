import { bitcountSingle } from '@/fonts/font'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Btn = ({ link, label }: { link: string, label: string }) => {
    return (
        <Link
            href={link}
            className={`px-6 py-3 bg-purple-700 font-bold text-white rounded-xl flex items-center gap-2 hover:bg-transparent hover:text-purple-700 border-2 border-transparent hover:border-purple-700 hover:border-dotted transition-colors duration-200 ease-in-out text-sm md:text-lg ${bitcountSingle.className}`}
        >
            {label} <ArrowRight className="w-4 h-4" />
        </Link>
    )
}

export default Btn