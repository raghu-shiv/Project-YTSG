"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";

type Plan = {
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
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onCheckout: (phone: string, autoRenew: boolean) => Promise<void>;
  loading: boolean;
};

export function CheckoutModal({ isOpen, onClose, plan, onCheckout, loading }: Props) {
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState(user?.phone || "");
  const [autoRenew, setAutoRenew] = useState(true);
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const handleProceed = async () => {
    setPhoneError("");
    if (!phone || phone.length < 10) {
      setPhoneError("Please enter a valid phone number (10+ digits)");
      return;
    }
    await onCheckout(phone, autoRenew);
  };

  const totalCredits = plan.scriptCredits + plan.thumbnailCredits;
  const pricePerScriptCredit = Math.round(plan.monthlyPrice / plan.scriptCredits);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plan Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-xl font-bold text-gray-900">{plan.name}</p>
            </div>
            {plan.popular && (
              <span className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                Most Popular
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Script Credits</p>
              <p className="text-lg font-semibold text-gray-900">{plan.scriptCredits}/mo</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Thumbnail Credits</p>
              <p className="text-lg font-semibold text-gray-900">{plan.thumbnailCredits}/mo</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-100">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">₹{plan.monthlyPrice}</span>
              <span className="text-gray-500">/mo</span>
            </div>
            {autoRenew ? (
              <p className="text-sm text-emerald-600 font-medium mt-1">
                Billed annually at ₹{plan.annualPrice.toLocaleString()} — {plan.annualSavings}
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                One-time purchase — {totalCredits} total credits
              </p>
            )}
          </div>
        </div>

        {/* Auto-renewal Toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl mb-6">
          <div>
            <p className="text-sm font-medium text-gray-900">Auto-renewal</p>
            <p className="text-xs text-gray-500">
              {autoRenew
                ? "Billed annually, sets up mandate on your card"
                : "One-time purchase, no recurring charges"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoRenew}
            onClick={() => setAutoRenew(!autoRenew)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              autoRenew ? "bg-indigo-600" : "bg-gray-300"
            }`}
            aria-label="Toggle auto-renewal"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                autoRenew ? "translate-x-[22px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Phone Number */}
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError("");
          }}
          placeholder="+91 9876543210"
          error={phoneError}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />

        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleProceed}
            loading={loading}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Proceed to Checkout
          </Button>
          <p className="text-xs text-gray-400 text-center">
            You will be redirected to Razorpay to complete the payment
          </p>
        </div>
      </div>
    </div>
  );
}