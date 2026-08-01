"use client";

import { Button, Badge } from "@/components/ui";

type SubscriptionPlan = {
  plan: string;
  name: string;
  scriptCredits: number;
  thumbnailCredits: number;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: string;
  popular: boolean;
};

type Props = {
  plan: SubscriptionPlan;
  onSubscribe: (plan: string) => void;
  loading: boolean;
  existingSubscription?: {
    id: string;
    status: string;
    scriptCredits: number;
    thumbnailCredits: number;
  } | null;
};

export function SubscriptionCard({ plan, onSubscribe, loading, existingSubscription }: Props) {
  const isSubscribed = !!existingSubscription;
  const pricePerCredit = Math.round(plan.monthlyPrice / (plan.scriptCredits + plan.thumbnailCredits));
  const pricePerScriptCredit = Math.round(plan.monthlyPrice / plan.scriptCredits);

  return (
    <div
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

      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
        {isSubscribed && existingSubscription?.status === "active" && (
          <Badge variant="success">Active</Badge>
        )}
        {isSubscribed && existingSubscription?.status === "cancelled" && (
          <Badge variant="default">One-Time</Badge>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {plan.scriptCredits} Script + {plan.thumbnailCredits} Thumbnail credits/mo
      </p>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">₹{plan.monthlyPrice}</span>
          <span className="text-gray-500">/mo</span>
        </div>
        <p className="text-sm text-emerald-600 font-medium mt-1">
          ₹{plan.annualPrice.toLocaleString()}/yr — {plan.annualSavings}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">₹{pricePerCredit}/total credit</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {[
          `${plan.scriptCredits} Script Credits/month`,
          `${plan.thumbnailCredits} Thumbnail Credits/month`,
          `₹${pricePerScriptCredit}/script credit`,
          "Auto-renewal or one-time",
          plan.popular ? "Priority support" : null,
        ]
          .filter(Boolean)
          .map((feat) => (
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

      <Button
        variant={plan.popular ? "primary" : "outline"}
        className="w-full"
        onClick={() => onSubscribe(plan.plan)}
        disabled={loading || isSubscribed}
        loading={loading}
      >
        {isSubscribed
          ? existingSubscription?.status === "active"
            ? "Subscribed"
            : "Purchased"
          : "Buy Now"}
      </Button>
    </div>
  );
}