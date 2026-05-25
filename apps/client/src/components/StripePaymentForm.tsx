"use client";

import { useAuth } from "@clerk/nextjs";
import { CartItemType, ShippingFormInputs } from "@repo/types";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import useCartStore from "@/stores/cartStore";

const stripe = loadStripe(
  "pk_test_51TOiLDIK0MiHEuwXYd8H66pH7LRoyoKcuQUF6SnHlehOvp45W0pOw3Hb3k5he0Cog2qMSJUCmVEgFKfjwPrGaqR400yAIlNnEd",
);

const fetchClientSecret = async (
  cart: CartItemType[],
  token: string,
): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL;
  const response = await fetch(`${baseUrl}/sessions/create-checkout-session`, {
    method: "POST",
    body: JSON.stringify({
      cart,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  return json.checkoutSessionClientSecret;
};

const StripePaymentForm: React.FC<{ shippingForm: ShippingFormInputs }> = ({
  shippingForm,
}) => {
  const { cart } = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    getToken().then((t) => setToken(t));
  }, [getToken]);

  useEffect(() => {
    if (!token) return;
    fetchClientSecret(cart, token).then((secret) => setClientSecret(secret));
  }, [token, cart]);

  if (!token || !clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <CheckoutElementsProvider stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutElementsProvider>
  );
};

export default StripePaymentForm;
