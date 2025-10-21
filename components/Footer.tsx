import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="w-full relative max-w-7xl mx-auto px-4 md:p-10 bg-black/20 backdrop-blur-sm mb-5">
            <div className="w-full flex flex-wrap justify-between gap-10 items-start">

                {/* Products / Features */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-lg text-white font-bold">Features</h3>
                    <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                        <li>One-Click Deployment</li>
                        <li>Analytics Dashboard</li>
                        <li>GitHub Integration</li>
                        <li>React App Hosting</li>
                        <li>Real-Time Metrics</li>
                    </ul>
                </div>

                {/* Resources / Links */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-lg text-white font-bold">Resources</h3>
                    <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                        <li>
                            <Link href="/docs" className="hover:text-white transition">
                                Documentation
                            </Link>
                        </li>
                        <li>
                            <Link href="/pricing" className="hover:text-white transition">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" className="hover:text-white transition">
                                FAQ
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-white transition">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Logo */}
                <div className="flex items-center justify-center">
                    <Image src="/logo.png" alt="Dumcel Logo" width={50} height={50} />
                </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-gray-400 py-5 text-sm">
                Developed by <span className="font-semibold">Nikhil Sai Ankilla</span> &mdash; Building Dumcel for effortless React deployments and analytics.
            </p>
        </footer>
    )
}

export default Footer
