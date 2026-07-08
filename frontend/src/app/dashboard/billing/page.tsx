"use client";

import { useState, useEffect } from "react";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { apiClient } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const [pricing, setPricing] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient("/payments/pricing"), apiClient("/credits/balance")])
      .then(([pricingData, balanceData]) => {
        setPricing(pricingData);
        setBalance(balanceData.balance);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePurchase = async (amount: number, credits: number) => {
    try {
      const order = await apiClient("/payments/create-order", {
        method: "POST",
        body: { amount, credits },
      });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "YouTube Script Generator",
        description: `${credits} Credits`,
        order_id: order.orderId,
        handler: async (response: any) => {
          await apiClient("/payments/verify", {
            method: "POST",
            body: {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          });
          const balanceData = await apiClient("/credits/balance");
          setBalance(balanceData.balance);
          alert("Credits added successfully!");
        },
        modal: {
          ondismiss: () => console.log("Payment cancelled"),
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      alert(err.message || "Payment failed");
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">
          Manage your credits and subscriptions
        </p>
      </div>

      {/* Balance Card */}
      <Card
        variant="bordered"
        padding="lg"
        className="bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available Credits
              </p>
              <p className="text-3xl font-bold text-gray-900">{balance}</p>
            </div>
          </div>
          <Badge variant="info">
            {balance === 0
              ? "No credits left"
              : `${balance} script${balance !== 1 ? "s" : ""} available`}
          </Badge>
        </div>
      </Card>

      {/* Pay Per Credit */}
      {pricing?.payPerCredit && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pay Per Credit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricing.payPerCredit.map((pkg: any) => (
              <Card
                key={pkg.credits}
                variant="default"
                padding="lg"
                className="flex flex-col"
              >
                <div className="flex-1">
                  <div className="text-4xl mb-2">
                    {pkg.credits <= 10 ? "⭐" : pkg.credits <= 50 ? "🚀" : "💎"}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pkg.credits} Credits
                  </h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{pkg.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    ₹{pkg.pricePerCredit}/script
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handlePurchase(pkg.price, pkg.credits)}
                >
                  Buy Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions */}
      {pricing?.subscriptions && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Monthly Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricing.subscriptions.map((sub: any) => (
              <Card
                key={sub.plan}
                variant="bordered"
                padding="lg"
                className="flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sub.name}
                    </h3>
                    <Badge variant="info">Best Value</Badge>
                  </div>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{sub.price}
                    </span>
                    <span className="text-gray-500 ml-1">/mo</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {sub.credits} credits per month
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Auto-renewal
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Cancel anytime
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handlePurchase(sub.price, sub.credits)}
                >
                  Subscribe
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
