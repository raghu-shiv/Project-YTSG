"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import LazySection from "@/components/LazySection";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized && user) {
      router.push("/dashboard");
    }
  }, [isInitialized, user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - always render immediately */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Home"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300 transition-shadow">
              <span className="text-white font-bold text-sm">YS</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              YT<span className="text-indigo-600">Scripts</span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="text-sm text-indigo-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/help"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          <AuthNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - above the fold, render immediately */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-100/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm text-indigo-700 font-medium mb-8">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                AI-Powered Content Creation
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
                Generate YouTube Scripts
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Powered by AI
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
                Create engaging, voiceover-ready scripts in seconds. Perfect for
                educational content, tech reviews, faceless channels, and more.
                Save hours of writing time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
                >
                  Start Creating Free
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - lazy loaded */}
        <LazySection>
          <section className="border-y border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "10K+", label: "Scripts Generated" },
                  { value: "5K+", label: "Active Creators" },
                  { value: "99%", label: "Satisfaction Rate" },
                  { value: "10x", label: "Faster Writing" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </LazySection>

        {/* Features Section - lazy loaded */}
        <LazySection rootMargin="100px">
          <section id="features" className="py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Create Better Videos
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  From script generation to SEO optimization, we've got you
                  covered.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                    title: "Script Generation",
                    desc: "Full voiceover-ready scripts with hooks, sections, and CTAs tailored to your niche.",
                  },
                  {
                    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
                    title: "SEO Optimization",
                    desc: "Keyword, hashtag, and tag suggestions to help your videos rank higher on YouTube.",
                  },
                  {
                    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                    title: "Thumbnail Ideas",
                    desc: "AI-generated thumbnail concepts with text overlay suggestions for higher CTR.",
                  },
                  {
                    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
                    title: "Content Ideas",
                    desc: "Niche-specific content suggestions and differentiation strategies for your channel.",
                  },
                  {
                    icon: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
                    title: "Voiceover Ready",
                    desc: "Scripts optimized for natural speech delivery. Perfect for faceless channels.",
                  },
                  {
                    icon: "M13 10V3L4 14h7v7l9-11h-7z",
                    title: "Fast Generation",
                    desc: "Get your script in seconds, not hours. Edit and regenerate as needed.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d={feature.icon}
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </LazySection>

        {/* Pricing Section - lazy loaded */}
        <LazySection rootMargin="100px">
          <section
            id="pricing"
            className="py-24 bg-gradient-to-b from-white to-gray-50"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-gray-600">
                  Pay per script or subscribe for the best value.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    name: "Starter",
                    desc: "10 script + 5 thumbnail credits/mo",
                    monthlyPrice: "₹299",
                    annualPrice: "₹2,999/yr",
                    annualNote: "Save 2 months",
                    features: [
                      "10 Script + 5 Thumbnail credits/mo",
                      "₹19.93/script credit",
                      "Auto-renewal or one-time",
                    ],
                    popular: false,
                    href: "/auth",
                  },
                  {
                    name: "Pro",
                    desc: "30 script + 15 thumbnail credits/mo",
                    monthlyPrice: "₹799",
                    annualPrice: "₹7,999/yr",
                    annualNote: "Save 2 months",
                    features: [
                      "30 Script + 15 Thumbnail credits/mo",
                      "₹17.76/script credit",
                      "Auto-renewal or one-time",
                      "Priority support",
                    ],
                    popular: true,
                    href: "/auth",
                  },
                  {
                    name: "Premium",
                    desc: "50 script + 20 thumbnail credits/mo",
                    monthlyPrice: "₹1,199",
                    annualPrice: "₹11,999/yr",
                    annualNote: "Save 2 months",
                    features: [
                      "50 Script + 20 Thumbnail credits/mo",
                      "₹17.13/script credit",
                      "Auto-renewal or one-time",
                      "Priority support",
                    ],
                    popular: false,
                    href: "/auth",
                  },
                ].map((plan: any) => (
                  <div
                    key={plan.name}
                    className={`relative p-8 bg-white rounded-2xl border ${
                      plan.popular
                        ? "border-2 border-indigo-500 shadow-lg shadow-indigo-100 scale-105"
                        : "border border-gray-200 shadow-sm hover:shadow-lg"
                    } transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex px-4 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.monthlyPrice}
                      </span>
                      <span className="text-gray-500 ml-1">/mo</span>
                    </div>
                    <p className="text-sm text-emerald-600 font-medium mb-6">
                      {plan.annualPrice} — {plan.annualNote}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feat: string) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={`block w-full text-center py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        plan.popular
                          ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                          : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                      }`}
                    >
                      {plan.popular ? "Subscribe Now" : "Get Started"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </LazySection>

        {/* CTA Section - lazy loaded */}
        <LazySection rootMargin="100px">
          <section className="py-24">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="p-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-200">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Create Your First Script?
                </h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto">
                  Get 2 free script + 1 free thumbnail credits when you sign up.
                  No credit card required.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center px-8 py-4 text-base font-semibold text-indigo-700 bg-white rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-lg"
                >
                  Create Free Account
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </LazySection>
      </main>

      {/* Footer - lazy loaded */}
      <LazySection rootMargin="100px">
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">YS</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    YT Scripts
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  AI-powered script generation for YouTube creators.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                  Product
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                  Company
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/help"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
              Roxxon Infotech Pvt. Ltd. &copy; {new Date().getFullYear()}. All
              rights reserved.
            </div>
          </div>
        </footer>
      </LazySection>
    </div>
  );
}
