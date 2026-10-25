import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how YT Scripts collects, uses, stores, and protects personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This Privacy Policy explains how Roxxon Infotech Pvt. Ltd. ("we", "us", or "our") handles information when you use YT Scripts at yt-scripts.online.`}
      lastUpdated="October 25, 2026"
      sections={[
        {
          title: "1. Information We Collect",
          content: (
            <>
              <p>Depending on how you use the platform, we may collect:</p>
              <ul>
                <li>
                  Account information, such as your name, email address,
                  password hash, and account preferences.
                </li>
                <li>
                  Authentication information, including Google sign-in
                  identifiers where you choose Google authentication.
                </li>
                <li>
                  Profile and verification information, such as a phone number
                  or verification status when you provide it.
                </li>
                <li>
                  Content you submit, including prompts, script inputs, edits,
                  and information needed to generate outputs.
                </li>
                <li>
                  Usage and transaction records, such as credit balances, credit
                  transactions, feature usage, and payment status.
                </li>
                <li>
                  Technical and diagnostic information, such as IP address,
                  device or browser details, logs, and error reports, where
                  collected by our systems or providers.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "2. How We Use Information",
          content: (
            <>
              <p>We use information as reasonably necessary to:</p>
              <ul>
                <li>Create and manage accounts and authenticate users.</li>
                <li>
                  Generate scripts, SEO suggestions, and thumbnails requested by
                  you.
                </li>
                <li>
                  Manage credits, payments, receipts, and transaction history.
                </li>
                <li>Operate, secure, troubleshoot, and improve the service.</li>
                <li>
                  Send service-related communications and respond to support
                  requests.
                </li>
                <li>
                  Detect fraud, abuse, security incidents, and violations of our
                  terms.
                </li>
                <li>
                  Meet legal, regulatory, accounting, and dispute-resolution
                  obligations.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "3. AI Processing and Service Providers",
          content: (
            <p>
              Content you submit for generation may be processed by third-party
              AI providers, including providers accessed through OpenRouter, to
              deliver the requested features. Payment information is handled
              through Razorpay or the payment provider shown at checkout.
              Hosting, database, email, authentication, and infrastructure
              providers may also process information on our behalf. Their
              processing is subject to the applicable service arrangements and
              privacy terms. Review the settings and terms of relevant providers
              before submitting confidential or sensitive material.
            </p>
          ),
        },
        {
          title: "4. Payments",
          content: (
            <p>
              Payments are processed by third-party payment providers. We may
              receive transaction identifiers, payment status, amounts, and
              other information needed to reconcile purchases and manage
              credits. We do not intend to store full payment-card details on
              our own application database when these are handled by the payment
              provider.
            </p>
          ),
        },
        {
          title: "5. Cookies and Local Storage",
          content: (
            <p>
              The application may use browser storage and similar technologies
              to maintain authentication state, preferences, and service
              functionality. Hosting, security, or third-party integrations may
              use cookies or related technologies. Configure your browser to
              manage storage where available; restricting essential storage may
              affect functionality.
            </p>
          ),
        },
        {
          title: "6. Sharing and Disclosure",
          content: (
            <>
              <p>We may disclose information to:</p>
              <ul>
                <li>Service providers needed to operate the platform.</li>
                <li>Payment providers for transaction processing.</li>
                <li>
                  Authorities or other parties where legally required or
                  necessary to protect rights and safety.
                </li>
                <li>
                  A successor or transaction partner in connection with a lawful
                  business reorganization, subject to applicable safeguards.
                </li>
              </ul>
              <p>
                We do not describe this list as a guarantee that no other
                disclosure will ever occur; disclosures will be handled in
                accordance with applicable law.
              </p>
            </>
          ),
        },
        {
          title: "7. Data Retention and Security",
          content: (
            <p>
              We retain information for as long as reasonably necessary for
              account operation, providing the service, maintaining financial
              records, resolving disputes, enforcing agreements, and meeting
              legal obligations. Retention periods depend on the type of
              information and its purpose. We use reasonable technical and
              organizational safeguards, but no internet transmission or storage
              system can be guaranteed completely secure.
            </p>
          ),
        },
        {
          title: "8. Your Choices and Rights",
          content: (
            <p>
              Depending on applicable law, you may have rights to request access
              to, correction of, deletion of, or other actions concerning your
              personal information. You may also contact us with privacy
              questions or complaints. We may need to verify your identity and
              may retain certain records where legally required or where a
              lawful exception applies.
            </p>
          ),
        },
        {
          title: "9. International Processing",
          content: (
            <p>
              Our providers may process information in countries other than your
              own. Where required, we will use appropriate safeguards for
              international transfers in accordance with applicable law.
            </p>
          ),
        },
        {
          title: "10. Children's Privacy",
          content: (
            <p>
              The platform is not intended for children who are not legally
              permitted to use the service under applicable law. If you believe
              a child has provided personal information in violation of
              applicable requirements, contact us so we can review the matter.
            </p>
          ),
        },
        {
          title: "11. Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy as our services or legal
              obligations change. We will publish the revised policy here and
              provide additional notice when required by law.
            </p>
          ),
        },
        {
          title: "12. Contact Us",
          content: (
            <p>
              For privacy requests or questions, email info.roxxon@gmail.com or
              visit our <a href="/contact">Contact page</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
