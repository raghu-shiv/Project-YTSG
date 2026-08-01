import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about YT Scripts — the AI-powered YouTube script generation platform. Our mission, team, and story.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300 transition-shadow">
              <span className="text-white font-bold text-sm">YS</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              YouTube Script<span className="text-indigo-600">Generator</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-indigo-600 font-medium transition-colors">About</Link>
            <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Help Center</Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">YT Scripts</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              We're on a mission to empower YouTube creators with AI-powered tools that save time, boost creativity, and help channels grow.
            </p>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  YouTube content creation is harder than ever. Between scriptwriting, SEO optimization, thumbnail design, and audience research, creators spend more time on production than creativity. YT Scripts was built to change that — we provide AI-powered tools that handle the heavy lifting so you can focus on what matters most: creating great content.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: "AI Script Generation", desc: "Voiceover-ready scripts with hooks, sections, and CTAs tailored to your niche." },
                    { title: "SEO Optimization", desc: "Keyword, hashtag, and tag suggestions to help your videos rank higher." },
                    { title: "Thumbnail Generation", desc: "AI-generated thumbnail images and concept recommendations." },
                    { title: "Content Ideas", desc: "Niche-specific suggestions and differentiation strategies." },
                  ].map((item) => (
                    <div key={item.title} className="p-6 bg-white rounded-2xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-600 leading-relaxed">
                  Built by creators, for creators. We saw firsthand how much time goes into scriptwriting and production planning. By combining our experience in content creation with cutting-edge AI technology, we created a platform that helps anyone — from solo creators to production teams — produce better content faster.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">Roxxon Infotech Pvt. Ltd. &copy; {new Date().getFullYear()}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700">About</Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700">Help Center</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}