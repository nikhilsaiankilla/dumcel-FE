import Image from "next/image"
import Navbar from "@/components/Navbar"
import Btn from "@/components/Btn"
import Link from "next/link"
import { Globe, Merge } from "lucide-react"

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-black border-b border-t border-gray-300/20 text-center py-3 text-white text-sm">
        Im Working on this project, stay tuned for updates!
      </div>
      <main className="w-full min-h-screen scroll-smooth relative bg-black">
        {/* Hero Section */}
        <section className="w-full relative max-w-7xl mx-auto h-screen border-[0.5px] border-gray-300/20 overflow-hidden">
          {/* 1. Gradient Background: Apply a linear gradient from left (green/teal), center (purple/blue), to right (orange/red). 
      2. Grid Overlay: Use a background image property to create the grid lines. 
         - The `repeating-linear-gradient` creates the vertical and horizontal lines.
         - The opacity is kept low (e.g., `rgba(255, 255, 255, 0.05)`) for the subtle effect.
    */}
          <div
            className="absolute inset-0 z-0 bg-black" // Added bg-black as a solid base color
            style={{
              // Main gradient: Fades from the colored spectrum (at the bottom 25% of the section)
              // to a transparent color at the top. The 'to top' direction is key.
              background: `
          radial-gradient(
            circle at bottom,
            rgba(0, 200, 151, 0.3) 5%,      /* Teal/Green (Start of color spectrum at the very bottom) */
            rgba(47, 128, 237, 0.7) 10%,    /* Blue/Purple (Middle of the spectrum) */
            rgba(255, 90, 95, 0.7) 40%,     /* Orange/Red (End of the spectrum) */
            rgba(0, 0, 0, 0.7) 70%,        /* Dark/Black fade area */
            rgba(0, 0, 0, 1) 100%           /* Fully Black/Solid at the very top */
          ), 
          
          /* Grid Overlay on top of the color gradient */
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0.5px, transparent 1px, transparent 70px), 
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0.5px, transparent 1px, transparent 60px)
        `,
            }}
          />

          {/* Content Container - Ensure content is visible above the background layers */}
          <div className="relative z-10 max-w-4/5 mx-auto py-20 gap-6 text-center px-4 md:mt-32 border-[0.5px] border-gray-300/20">
            <div className="w-full flex flex-col text-center items-center justify-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Build and deploy on the Dumcel.
              </h1>
              <h3 className="text-lg text-gray-300 md:max-w-4/5">
                Dumcel provides the tools and cloud infrastructure to develop and run web applications efficiently.
              </h3>

              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href='/' className="px-6 py-2 bg-white rounded-full text-black font-semibold flex items-center gap-2 group transition-all duration-150 ease-in-out text-sm hover:bg-gray-200">
                  <span className="text-sm">▲</span> Start Deploying
                </Link>

                <Link href='/' className="px-6 py-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-white font-semibold flex items-center gap-2 transition-all duration-150 ease-in-out text-sm hover:bg-black/70">
                  Get a Demo
                </Link>
              </div>
            </div>
          </div>

          {/* <Image src='/logo.png' alt="logo" width={100} height={100} className="w-40 h-auto object-cover mx-auto md:mt-20" /> */}
        </section>

        <section className="w-full max-w-7xl mx-auto border-[0.5px] border-gray-300/20 overflow-hidden py-20">
          <h1 className="text-3xl md:text-4xl font-normal text-white text-center mx-5">Develop with your favorite React Applications {">_"}
          </h1>
          <h1 className="text-3xl md:text-4xl font-normal text-white text-center mx-5 flex items-center justify-center gap-2">Launch globally <Globe size={20} />, instantly  Keep pushing code, we&apos;ll handle the rest. <Merge size={20} /></h1>
        </section>
      </main>
    </>
  )
}
