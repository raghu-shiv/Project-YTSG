import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms governing the use of YT Scripts, its AI content generation tools, credits, and payment services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="These Terms & Conditions govern your access to and use of YT Scripts, an AI-powered platform for generating YouTube scripts, SEO suggestions, content ideas, and thumbnail images. By accessing the platform or purchasing credits, you agree to these terms."
      lastUpdated="October 25, 2026"
      sections={[
        {
          title: "1. About YT Scripts",
          content: (
            <p>
              YT Scripts is operated by Roxxon Infotech Pvt. Ltd. ("we", "us",
              or "our"). The platform provides AI-assisted tools for content
              creation and related creator workflows through yt-scripts.online.
            </p>
          ),
        },
        {
          title: "2. Eligibility and Accounts",
          content: (
            <>
              <p>
                You must be legally capable of entering into a binding agreement
                under applicable law to use paid services.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for activity conducted through your
                account. Provide accurate registration information and notify us
                if you suspect unauthorized access.
              </p>
              <p>
                Do not share, sell, or transfer account access in a way that
                violates these terms or compromises platform security.
              </p>
            </>
          ),
        },
        {
          title: "3. Platform Services",
          content: (
            <>
              <p>
                Depending on availability and your account balance, the platform
                may provide AI script generation, script editing, content ideas,
                SEO suggestions, thumbnail generation, and downloadable content.
              </p>
              <p>
                Features, AI models, usage limits, credit requirements, and
                pricing may change. We will communicate material changes where
                required by applicable law.
              </p>
            </>
          ),
        },
        {
          title: "4. AI-Generated Content",
          content: (
            <>
              <p>
                AI-generated outputs may be inaccurate, incomplete, repetitive,
                similar to other outputs, or unsuitable for your intended
                purpose. We do not guarantee originality, factual accuracy,
                audience engagement, search rankings, monetization, or business
                results.
              </p>
              <p>
                You are responsible for reviewing and verifying generated
                scripts, claims, citations, recommendations, and images before
                publishing or using them commercially.
              </p>
              <p>
                You must ensure that your use of generated content complies with
                applicable law, YouTube policies, copyright rules, publicity
                rights, and other third-party rights.
              </p>
            </>
          ),
        },
        {
          title: "5. Credits and Payments",
          content: (
            <>
              <p>
                Certain features consume credits. The number of credits required
                will be displayed by the platform where applicable. Credits may
                be provided through promotional offers or purchased using
                supported payment methods.
              </p>
              <p>
                Payments are processed through Razorpay or another payment
                provider displayed at checkout. Your payment may also be subject
                to that provider's terms.
              </p>
              <p>
                Credits, plan benefits, and any expiry or renewal conditions
                will be governed by the offer or plan shown when you purchase.
                Do not assume that unused credits can be converted to cash.
              </p>
              <p>
                Our cancellation and refund rules are described in the{" "}
                <a href="/cancellation-refund">Cancellation & Refund Policy</a>,
                subject to rights that cannot legally be excluded.
              </p>
            </>
          ),
        },
        {
          title: "6. Acceptable Use",
          content: (
            <>
              <p>You must not use YT Scripts to:</p>
              <ul>
                <li>Violate applicable laws or third-party rights.</li>
                <li>
                  Generate or distribute unlawful, fraudulent, or harmful
                  content.
                </li>
                <li>
                  Attempt to bypass credit limits, security controls, or access
                  restrictions.
                </li>
                <li>
                  Interfere with the platform, its infrastructure, or other
                  users.
                </li>
                <li>
                  Reverse engineer or exploit the service except where
                  applicable law permits it.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "7. Intellectual Property and Your Content",
          content: (
            <>
              <p>
                We retain our rights in the platform, software, branding,
                interface, and associated materials.
              </p>
              <p>
                As between you and us, you retain rights you hold in the
                material you submit. Subject to third-party rights, applicable
                law, and these terms, you may use generated outputs for your
                intended purposes. AI-generated material may not qualify for
                copyright protection in every jurisdiction, and we do not
                promise that an output is exclusive to you.
              </p>
              <p>
                You must have the rights and permissions needed to submit
                content for processing.
              </p>
            </>
          ),
        },
        {
          title: "8. Third-Party Services",
          content: (
            <p>
              The platform may rely on third-party services for AI processing,
              payments, authentication, hosting, or infrastructure. Their
              availability and processing may be governed by their own terms and
              policies. We are not responsible for independent services outside
              our reasonable control.
            </p>
          ),
        },
        {
          title: "9. Availability and Disclaimers",
          content: (
            <p>
              We aim to maintain a reliable service but do not guarantee
              uninterrupted or error-free availability. To the extent permitted
              by law, the service is provided on an "as available" basis,
              without warranties not expressly required by law.
            </p>
          ),
        },
        {
          title: "10. Limitation of Liability",
          content: (
            <p>
              To the extent permitted by applicable law, we are not liable for
              indirect, incidental, special, or consequential losses arising
              from use of the platform, including loss of revenue, audience,
              data, or business opportunities. Nothing in these terms excludes
              liability that cannot legally be excluded or limited.
            </p>
          ),
        },
        {
          title: "11. Suspension and Termination",
          content: (
            <p>
              We may restrict or suspend access where reasonably necessary to
              address security risks, suspected fraud, unlawful activity,
              material breaches of these terms, or operational risks, subject to
              applicable law. You may stop using the service at any time.
            </p>
          ),
        },
        {
          title: "12. Changes to These Terms",
          content: (
            <p>
              We may update these terms from time to time. The updated version
              will be published on this page with a revised update date. Where
              required by law, we will provide additional notice or obtain
              consent.
            </p>
          ),
        },
        {
          title: "13. Governing Law and Contact",
          content: (
            <>
              <p>
                These terms are subject to applicable laws. Any governing-law,
                jurisdiction, or dispute-resolution provisions must be
                interpreted consistently with mandatory consumer protections and
                other applicable legal requirements.
              </p>
              <p>
                For questions, contact info.roxxon@gmail.com or visit our{" "}
                <a href="/contact">Contact page</a>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
