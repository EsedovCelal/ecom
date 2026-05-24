"use client";

import { ShippingFormInputs } from "@repo/types";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { ConfirmError } from "@stripe/stripe-js";
import { useState } from "react";

const CheckoutForm: React.FC<{ shippingForm: ShippingFormInputs }> = ({
  shippingForm,
}) => {
  const checkoutState = useCheckoutElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmError | null>(null);

  if (checkoutState.type === "loading") {
    return <div>Loading...</div>;
  } else if (checkoutState.type === "error") {
    return <div>Error: {checkoutState.error.message}</div>;
  }

  const handleClick = async () => {
    setLoading(true);
    await checkoutState.checkout.updateEmail(shippingForm.email);
    await checkoutState.checkout.updateShippingAddress({
      name: "shipping_address",
      address: {
        line1: shippingForm.address,
        city: shippingForm.city,
        country: "US",
      },
    });

    const res = await checkoutState.checkout.confirm();
    if (res.type === "error") {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <form>
      <PaymentElement options={{ layout: "accordion" }} />
      <button
        disabled={!checkoutState.checkout.canConfirm || loading}
        onClick={handleClick}
      >
        {loading ? "Loading..." : "Pay"}
      </button>
      {error && <div>{error.message}</div>}
    </form>
  );
};

export default CheckoutForm;
