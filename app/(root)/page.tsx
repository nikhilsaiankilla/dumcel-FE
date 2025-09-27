import Image from "next/image"
import Btn from "@/components/Btn"
import { bitcountSingle } from "@/fonts/font"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen scroll-smooth relative bg-white">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-24 md:py-40 px-4">
          <h1 className={`text-4xl md:text-6xl font-bold tracking-tight mb-6 text-black ${bitcountSingle.className}`}>
            Deploy Smarter, Build Faster
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-8">
            Dumcel makes deployment effortless log in with GitHub, select your repository, and go live in one click.
          </p>
          <Btn link="/dashboard" label="Get Started" />
        </section>

        {/* Dashboard Preview */}
        <section className="py-20 md:py-32 flex flex-col items-center text-center gap-10 px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-black">
            Your Dashboard, Simplified
          </h2>
          <p className="max-w-2xl text-gray-600 text-lg">
            Manage projects, monitor deployments, and gain insights with a clean dashboard designed for speed and clarity.
          </p>
          <div className="w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden border border-gray-800">
            <Image
              src="/dashboard-preview.png"
              alt="Dumcel Dashboard Preview"
              width={1200}
              height={700}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16 text-black">
            Everything You Need to Ship
          </h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl border border-gray-800 text-black/40 hover:text-black/60 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-black">One-Click Deployment</h3>
              <p className="text-gray-600">
                Connect your GitHub repo and deploy instantly. No complex configs, just speed.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-800 text-black/40 hover:text-black/60 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-black">Built-in Analytics</h3>
              <p className="text-gray-600">
                Track performance, monitor traffic, and gain insights with built-in analytics.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-800 text-black/40 hover:text-black/60 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-black">Easy Management</h3>
              <p className="text-gray-600">
                Manage all your projects from a single dashboard, built for developers.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 flex flex-col items-center text-center gap-8 px-4">
          <h2 className="text-3xl md:text-4xl font-semibold max-w-2xl text-black">
            Ready to launch your next project?
          </h2>
          <Btn link="/dashboard" label="Start Deployment" />
        </section>
      </main>
    </>
  )
}
