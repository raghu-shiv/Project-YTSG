import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Read the YT Scripts policy for purchases, credit purchases, cancellations, and refunds.",
  alternates: { canonical: "/cancellation-refund" },
};

export default function CancellationRefundPage() {
  return (
    <LegalPage
      title="Cancellation & Refund Policy"
      intro="Please review this policy carefully before purchasing credits or other paid services on YT Scripts."
      lastUpdated="October 25, 2026"
      sections={[
        {
          title: "1. General Policy",
          content: (
            <p>
              All purchases made on YT Scripts are considered final.
              Cancellation of a completed purchase and refunds are not permitted
              under our standard policy, except where a refund or other remedy
              is required by applicable law or expressly approved by us.
            </p>
          ),
        },
        {
          title: "2. Credit Purchases",
          content: (
            <p>
              Credits purchased on the platform are intended for use with the
              available script generation, SEO, thumbnail, and other eligible
              features. Please review the applicable pricing, credit quantity,
              and plan details before completing your payment. Unused credits
              are not ordinarily refundable or exchangeable for cash.
            </p>
          ),
        },
        {
          title: "3. Cancellation Requests",
          content: (
            <p>
              We do not ordinarily accept cancellation requests for completed
              purchases. If you believe a transaction was unauthorized,
              duplicated, incorrectly processed, or affected by a technical
              issue, contact support for investigation. Contacting support does
              not guarantee a cancellation or refund. Any applicable statutory
              rights remain unaffected.
            </p>
          ),
        },
        {
          title: "4. Failed or Duplicate Payments",
          content: (
            <p>
              If your payment appears to have failed but money was debited, or
              if you believe you were charged more than once for the same
              transaction, contact us with your payment reference and
              transaction details. We will investigate and coordinate with the
              payment provider where appropriate. Any reversal or refund will be
              handled in accordance with applicable law and the payment
              provider's procedures.
            </p>
          ),
        },
        {
          title: "5. Technical Issues",
          content: (
            <p>
              If a paid feature does not work as expected, contact support with
              a description of the issue and any relevant transaction or
              generation reference. We may investigate, correct the technical
              issue, or provide another appropriate remedy where required or
              considered appropriate. This does not create a general right to
              cancel a completed purchase.
            </p>
          ),
        },
        {
          title: "6. Contact Support",
          content: (
            <p>
              For payment-related questions, email info.roxxon@gmail.com or
              visit our Contact page. Include your registered email address and
              payment reference, but do not send full card numbers, passwords,
              or other authentication secrets.
            </p>
          ),
        },
        {
          title: "7. Policy Changes",
          content: (
            <p>
              We may update this policy by publishing a revised version on this
              page. Changes will not override rights that cannot legally be
              excluded.
            </p>
          ),
        },
      ]}
    />
  );
}
