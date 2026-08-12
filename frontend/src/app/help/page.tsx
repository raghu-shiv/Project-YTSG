import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers to common questions about YT Scripts. Guides on script generation, credits, SEO, thumbnails, and troubleshooting.",
};

export default function HelpPage() {
  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          q: "What is YT Scripts?",
          a: "YT Scripts is an AI-powered platform that helps YouTube creators generate voiceover-ready scripts, SEO suggestions, and thumbnail concepts in seconds.",
        },
        {
          q: "How do I get started?",
          a: "Sign up for a free account — you'll receive 5 free credits to try the platform. No credit card required.",
        },
        {
          q: "What types of videos can I create scripts for?",
          a: "YT Scripts supports all video types: educational, tech reviews, faceless channels, tutorials, vlogs, listicles, and more.",
        },
      ],
    },
    {
      category: "Credits & Billing",
      items: [
        {
          q: "What are credits?",
          a: "Credits are our pay-per-use unit. Each script generation costs 1 credit. Thumbnail generation also costs 1 credit. SEO suggestions are included free with each script.",
        },
        {
          q: "What happens if I run out of credits?",
          a: "You can purchase more credits anytime from the Billing page. We offer monthly subscription plans for the best value.",
        },
        {
          q: "Do unused credits expire?",
          a: "Subscription credits reset at the end of each billing cycle. One-time purchased credits never expire.",
        },
      ],
    },
    {
      category: "Script Generation",
      items: [
        {
          q: "How does the AI generate scripts?",
          a: "Our AI uses advanced language models (GPT-4o-mini, Gemini Flash, and more) to generate structured scripts with hooks, main content, and CTAs based on your topic and video type.",
        },
        {
          q: "Can I edit a generated script?",
          a: "Yes! Our Inline Editor lets you edit scripts with debounced auto-save. You can also regenerate scripts or access previous versions.",
        },
        {
          q: "Can I download my scripts?",
          a: "Yes, you can download scripts as .txt or .docx files from the script detail page.",
        },
      ],
    },
    {
      category: "SEO & Thumbnails",
      items: [
        {
          q: "What SEO suggestions do you provide?",
          a: "We generate keywords, hashtags, tags, and title suggestions optimized for YouTube search rankings.",
        },
        {
          q: "How do thumbnail concepts work?",
          a: "Our AI analyzes your script content to suggest visual layout, colors, elements, and text overlays for eye-catching thumbnails. We also generate the actual thumbnail image using AI image models.",
        },
      ],
    },
    {
      category: "Technical",
      items: [
        {
          q: "Is my data secure?",
          a: "Yes. All data is encrypted in transit (HTTPS) and at rest. We use JWT authentication, rate limiting, and follow security best practices.",
        },
        {
          q: "Which browsers are supported?",
          a: "YT Scripts works on all modern browsers: Chrome, Firefox, Safari, and Edge.",
        },
      ],
    },
  ];

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
              className="text-sm text-indigo-600 font-medium transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Help{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Center
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Everything you need to know about using YT Scripts. Can't find
              what you're looking for?{" "}
              <Link
                href="/contact"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                Contact us
              </Link>
              .
            </p>

            <div className="space-y-12">
              {faqs.map((section) => (
                <div key={section.category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {section.category}
                  </h2>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <details
                        key={item.q}
                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden"
                      >
                        <summary className="cursor-pointer px-6 py-5 text-base font-medium text-gray-900 list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                          {item.q}
                          <svg
                            className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div className="px-6 pb-5 pt-0">
                          <p className="text-gray-600 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
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
