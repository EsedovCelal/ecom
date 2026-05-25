"use client";

import { ShippingFormInputs } from "@repo/types";
import {
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
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
      <div>
        <button
          type="button"
          /*           disabled={!checkoutState.checkout.canConfirm || loading} */
          onClick={handleClick}
          className="ring-1 ring-gray-200 shadow-lg rounded-md px-2 py-1 text-sm cursor-pointer hover:text-white hover:bg-black transition-all duration-300 flex items-center gap-2"
        >
          {loading ? "Loading..." : "Pay"}
        </button>
      </div>

      {error && <div>{error.message}</div>}
    </form>
  );
};

export default CheckoutForm;
