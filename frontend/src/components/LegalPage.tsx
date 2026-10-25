import type { ReactNode } from "react";
import Link from "next/link";

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  intro,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white">
              YS
            </span>
            <span className="text-lg font-semibold text-gray-900">
              YT<span className="text-indigo-600">Scripts</span>
            </span>
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
          >
            Contact Support
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 md:py-20">
        <article className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm md:px-12 md:py-12">
          <div className="mb-10 border-b border-gray-100 pb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              YT Scripts · Legal
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {title}
            </h1>

            <p className="mt-5 leading-7 text-gray-600">{intro}</p>

            <p className="mt-4 text-sm text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="space-y-9">
            {sections.map((section, index) => (
              <section key={`${section.title}-${index}`}>
                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>

                <div className="space-y-3 text-[15px] leading-7 text-gray-600 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2 [&_a]:text-indigo-600 [&_a]:underline">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 border-t border-gray-100 pt-6">
            <p className="text-sm leading-6 text-gray-500">
              Questions about these policies? Contact us at{" "}
              <a
                href="mailto:info.roxxon@gmail.com"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                info.roxxon@gmail.com
              </a>
              .
            </p>

            <nav
              aria-label="Legal pages"
              className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm"
            >
              <Link
                href="/terms"
                className="text-gray-500 hover:text-indigo-600"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-indigo-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cancellation-refund"
                className="text-gray-500 hover:text-indigo-600"
              >
                Cancellation & Refund
              </Link>
            </nav>
          </div>
        </article>
      </main>

      <footer className="border-t border-gray-200 bg-white px-6 py-6">
        <p className="text-center text-sm text-gray-400">
          Roxxon Infotech Pvt. Ltd. © {new Date().getFullYear()}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
