"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Badge, LoadingSpinner, Button } from "@/components/ui";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { CheckoutModal } from "@/components/CheckoutModal";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLAN_ORDER = ["starter", "creator", "pro"];

export default function BillingPage() {
  useEffect(() => {
    document.title = "Billing & Credits | YT Scripts";
  }, []);
  const [pricing, setPricing] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient("/payments/pricing"),
      apiClient("/payments/subscriptions"),
    ])
      .then(([pricingData, subsData]) => {
        setPricing(pricingData);
        setSubscriptions(subsData || []);
        setPageLoading(false);
      })
      .catch(() => setPageLoading(false));
  }, []);

  // Determine the highest plan the user is subscribed to
  const highestSubscribedPlan = useMemo(() => {
    if (!subscriptions.length) return null;
    const subscribedPlans = new Set(subscriptions.map((s) => s.plan));
    for (let i = PLAN_ORDER.length - 1; i >= 0; i--) {
      if (subscribedPlans.has(PLAN_ORDER[i])) return PLAN_ORDER[i];
    }
    return null;
  }, [subscriptions]);

  const isHighestPlan = highestSubscribedPlan === PLAN_ORDER[PLAN_ORDER.length - 1];

  // Plans available for upgrade (higher than current)
  const upgradePlans = useMemo(() => {
    if (!highestSubscribedPlan || !pricing?.subscriptions) return [];
    const currentIdx = PLAN_ORDER.indexOf(highestSubscribedPlan);
    return pricing.subscriptions.filter((sub: any) => {
      const subIdx = PLAN_ORDER.indexOf(sub.plan);
      return subIdx > currentIdx;
    });
  }, [highestSubscribedPlan, pricing]);

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = (plan: string) => {
    const planInfo = pricing?.subscriptions?.find((p: any) => p.plan === plan);
    if (planInfo) {
      setSelectedPlan(planInfo);
      setShowCheckout(true);
    }
  };

  const handleCheckout = async (phone: string, autoRenew: boolean) => {
    if (!selectedPlan) return;
    setCheckoutLoading(true);

    try {
      if (!user?.phone) {
        try {
          await apiClient("/users/profile", {
            method: "PUT",
            body: { phone },
          });
          await fetchProfile();
        } catch {
          // Non-critical
        }
      }

      await loadRazorpayScript();

      if (autoRenew) {
        const result = await apiClient("/payments/create-recurring-subscription", {
          method: "POST",
          body: { plan: selectedPlan.plan },
        });

        const options = {
          key: result.keyId,
          subscription_id: result.subscriptionId,
          name: "YT Scripts",
          description: `${selectedPlan.name} - ${selectedPlan.scriptCredits} Script + ${selectedPlan.thumbnailCredits} Thumbnail Credits/mo (Auto-Renew)`,
          prefill: { contact: phone },
          handler: async (response: any) => {
            try {
              await apiClient("/payments/verify-recurring-subscription", {
                method: "POST",
                body: {
                  razorpaySubscriptionId: response.razorpay_subscription_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  plan: selectedPlan.plan,
                  scriptCredits: selectedPlan.scriptCredits,
                  thumbnailCredits: selectedPlan.thumbnailCredits,
                },
              });
              await fetchProfile();
              const subsData = await apiClient("/payments/subscriptions");
              setSubscriptions(subsData || []);
              setShowCheckout(false);
              setSelectedPlan(null);
            } catch (err: any) {
              alert(err.message || "Subscription verification failed");
            }
          },
          modal: { ondismiss: () => setCheckoutLoading(false) },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        const order = await apiClient("/payments/create-one-time-purchase", {
          method: "POST",
          body: { plan: selectedPlan.plan },
        });

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "YT Scripts",
          description: `${selectedPlan.name} - ${selectedPlan.scriptCredits} Script + ${selectedPlan.thumbnailCredits} Thumbnail Credits`,
          order_id: order.orderId,
          prefill: { contact: phone },
          handler: async (response: any) => {
            try {
              await apiClient("/payments/verify-one-time-purchase", {
                method: "POST",
                body: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  plan: selectedPlan.plan,
                  scriptCredits: selectedPlan.scriptCredits,
                  thumbnailCredits: selectedPlan.thumbnailCredits,
                },
              });
              await fetchProfile();
              const subsData = await apiClient("/payments/subscriptions");
              setSubscriptions(subsData || []);
              setShowCheckout(false);
              setSelectedPlan(null);
            } catch (err: any) {
              alert(err.message || "Purchase verification failed");
            }
          },
          modal: { ondismiss: () => setCheckoutLoading(false) },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (err: any) {
      alert(err.message || "Transaction failed");
      setCheckoutLoading(false);
    }
  };

  const scriptCredits = user?.scriptCredits ?? 0;
  const thumbnailCredits = user?.thumbnailCredits ?? 0;

  if (pageLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Script Credits</p>
              <p className="text-2xl font-bold text-gray-900">{scriptCredits}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Thumbnail Credits</p>
              <p className="text-2xl font-bold text-gray-900">{thumbnailCredits}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Subscriptions</h2>
          <div className="space-y-3">
            {subscriptions.map((sub: any) => {
              const planInfo = pricing?.subscriptions?.find((p: any) => p.plan === sub.plan);
              const canUpgrade = !isHighestPlan && sub.status === "active";
              return (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {planInfo?.name?.charAt(0) || sub.plan.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {planInfo?.name || sub.plan}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sub.scriptCredits} script + {sub.thumbnailCredits} thumbnail credits/mo
                        {sub.status === "active" ? " · Auto-renewal ON" : " · One-time purchase"}
                        {sub.currentPeriodEnd && ` · Ends ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={sub.status === "active" ? "success" : "default"}>
                      {sub.status === "active" ? "Active" : "Completed"}
                    </Badge>
                    {canUpgrade && upgradePlans.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubscribe(upgradePlans[0].plan)}
                      >
                        Upgrade to {upgradePlans[0].name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Subscription Plans — shown when user has no subscription */}
      {pricing?.subscriptions && !highestSubscribedPlan && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a plan and customize your purchase in the checkout popup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {pricing.subscriptions.map((sub: any) => (
              <SubscriptionCard
                key={sub.plan}
                plan={sub}
                onSubscribe={handleSubscribe}
                loading={checkoutLoading && selectedPlan?.plan === sub.plan}
                existingSubscription={null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upgrade section when user has a plan but not the highest */}
      {pricing?.subscriptions && highestSubscribedPlan && !isHighestPlan && upgradePlans.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a higher plan to upgrade your subscription.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {upgradePlans.map((sub: any) => (
              <SubscriptionCard
                key={sub.plan}
                plan={sub}
                onSubscribe={handleSubscribe}
                loading={checkoutLoading && selectedPlan?.plan === sub.plan}
                existingSubscription={null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onCheckout={handleCheckout}
        loading={checkoutLoading}
      />
    </div>
  );
}