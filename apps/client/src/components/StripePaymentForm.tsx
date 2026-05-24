"use client";

import { useAuth } from "@clerk/nextjs";
import { CartItemType, ShippingFormInputs } from "@repo/types";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import useCartStore from "@/stores/cartStore";

const stripe = loadStripe(
  "pk_test_51TaSYCDiYoAvrGX6R9x5KwkpQYzOHwKpMwX0ziTjfKQUB7KZ56NVQNtxL15WYHt2MqMzfxzjX0oKTtV7lPmZi6ap00eWPGh3Cb",
);

const fetchClientSecret = async (
  cart: CartItemType,
  token: string,
): Promise<string> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
    {
      method: "POST",
      body: JSON.stringify({
        cart,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const json = await response.json();
  return json.client_secret;
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
  });

  if (!token || !clientSecret) {
    return <div>Loading...</div>;
  }

  console.log(process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL);

  return (
    <CheckoutElementsProvider stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutElementsProvider>
  );
};

export default StripePaymentForm;
