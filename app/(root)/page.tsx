import Navbar from "@/components/Navbar"
import Link from "next/link"
import { CoinsIcon, Globe, Merge, TrendingUp } from "lucide-react"
import Footer from "@/components/Footer"
import DeployButtonMicrointeraction from '@/components/DeployButtonMicrointeraction'
import { LineChartLandingPage } from "@/components/LineChartLandingPage"

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-background border-b border-t border-gray-300/20 text-center py-3 text-white text-sm break-words">
        Im Working on this project, stay tuned for updates!
      </div>
      <main className="w-full min-h-screen scroll-smooth relative bg-background">
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
              background: `
                radial-gradient(
                    circle at bottom,
                    rgba(0, 200, 151, 0.7) 0%,    /* Teal/Green at the bottom */
                    rgba(47, 128, 237, 0.7) 10%,  /* Blue transition */
                    rgba(255, 215, 0, 0.7) 20%,   /* Yellow/Orange middle */
                    rgba(255, 0, 8, 0.8) 45%,   /* Red at the bottom right */
                    rgba(0, 0, 0, 0.7) 70%,       /* Dark fade */
                    rgba(0, 0, 0, 1) 100%         /* Solid black at the top */
                ),
                /* Grid Overlay */
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
        </section>

        <section className="w-full max-w-7xl mx-auto border-[0.5px] border-gray-300/20 overflow-hidden py-20 text-center">
          <h1 className="text-xl md:text-4xl font-normal text-white mx-5">
            Develop with your favorite React Applications {">_"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-white text-xl md:text-4xl font-normal">
            <span>Launch globally</span>
            <Globe size={24} />
            <span>, instantly. Keep pushing code, we&apos;ll handle the rest.</span>
            <Merge size={24} />
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto border-[0.5px] border-gray-300/20 overflow-hidden text-center grid grid-cols-1 md:grid-cols-2">
          <div className="border-[0.5px] border-gray-300/20 h-full w-full md:p-10">
            <h1 className="text-lg font-normal text-gray-500 text-left px-10 pt-10 md:p-0">
              {">_"} One Click Deployments
            </h1>

            <p className="text-white text-base md:text-lg leading-relaxed text-left mt-5 px-10 md:p-0">
              Deploy your React applications instantly with a single click.
              We handle the builds, scaling, and delivery so you can focus on building.
            </p>

            <div className="flex items-center justify-center md:mt-10">
              <DeployButtonMicrointeraction />
            </div>

          </div>

          <div className="border-[0.5px] border-gray-300/20 h-full w-full md:p-10 rounded-lg flex items-start justify-between flex-col">
            <div>
              <h1 className="text-lg font-normal text-gray-500 text-left px-10 pt-10 md:p-0">
                {">_"} Deployment & Credits
              </h1>
              <p className="text-white text-base md:text-lg leading-relaxed text-left mt-5 px-10 md:p-0">
                First login? You get <span className="font-semibold text-green-400">10 free credits</span> to deploy your React applications instantly. Buy more credits anytime and deploy with a single click. Build, scale, and launch your apps effortlessly.
              </p>
            </div>

            <div className="relative flex justify-center items-center w-full py-10">
              {/* Glow effect */}
              <div className="absolute w-64 h-64 rounded-full bg-yellow-400 opacity-20 blur-3xl" />

              {/* Icon on top */}
              <CoinsIcon size={200} className="text-amber-400 relative z-10" />
            </div>

            <div className="w-full space-y-10">
              <div className="w-full flex items-center justify-center md:mt-10">
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
                  <Link href='/' className="px-6 py-2 bg-white rounded-full text-black font-semibold flex items-center gap-2 group transition-all duration-150 ease-in-out text-sm hover:bg-gray-200">
                    <span className="text-sm">▲</span> Sign up and get credits
                  </Link>

                  <Link href='/' className="px-6 py-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full text-white font-semibold flex items-center gap-2 transition-all duration-150 ease-in-out text-sm hover:bg-black/70">
                    Buy Credits
                  </Link>
                </div>
              </div>

              <p className="text-gray-300 text-sm mt-3 p-10 bg-amber-500/10 border-[0.5px] rounded-md border-amber-500/20">
                ⚠️ Credits are non-refundable. Only purchase if you want to test my payment system; otherwise, please do not buy.
              </p>
            </div>
          </div>

        </section>

        <section className="w-full max-w-7xl mx-auto border-[0.5px] border-t-0 border-gray-300/20 overflow-hidden py-10 px-10">
          <h1 className="text-lg font-normal text-gray-500 text-left flex items-center gap-5">
            <TrendingUp /> Analytics
          </h1>
          <p className="text-white text-base md:text-lg max-w-3xl leading-relaxed text-left mt-3">
            Track deployments, user engagement, and performance metrics in real time.
            Gain insights that help you optimize and grow efficiently.
          </p>

          <div className="w-full flex items-center justify-center mt-10">
            <LineChartLandingPage />
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto border-[0.5px] border-t-0 border-gray-300/20 overflow-hidden py-20 px-10 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            This Project Was Developed by Me
          </h2>
          <p className="text-white mb-6 text-lg md:text-xl">
            Hi, I'm Nikhil. I'm currently looking for openings in full-stack development.
            Feel free to refer me or invite me for an interview!
          </p>
          <Link
            href="/portfolio"
            className="px-6 py-2 bg-white w-fit rounded-full text-black font-semibold flex items-center gap-2 group transition-all duration-150 ease-in-out text-sm hover:bg-gray-200 mx-auto"
          >
            <span className="rotate-90">▲</span> View Portfolio
          </Link>
        </section>

      </main>

      <Footer />
    </>
  )
}
