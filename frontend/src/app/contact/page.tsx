import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the YT Scripts team. Support, feedback, partnerships, and general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
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
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
              className="text-sm text-indigo-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Us
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Have a question, feedback, or partnership idea? We'd love to hear
              from you. Choose the option that best fits your needs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-8 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Email Support
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  For support inquiries and bug reports.
                </p>
                <a
                  href="mailto:info.roxxon@gmail.com"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  info.roxxon@gmail.com
                </a>
              </div>

              <div className="p-8 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Partnerships
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  For partnership and business inquiries.
                </p>
                <a
                  href="mailto:info.roxxon@gmail.com"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  info.roxxon@gmail.com
                </a>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 mb-6">
                Check out our{" "}
                <Link
                  href="/help"
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  Help Center
                </Link>{" "}
                for quick answers to common questions, or reach out to us on
                social media.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              Roxxon Infotech Pvt. Ltd. &copy; {new Date().getFullYear()}. All
              rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                About
              </Link>
              <Link
                href="/help"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
