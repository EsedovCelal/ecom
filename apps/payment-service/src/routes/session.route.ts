import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { GetStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = await GetStripeProductPrice(item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount as number,
        },
        quantity: item.quantity,
      };
    }),
  );

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      return_url:
        "http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}",
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json(error);
  }
});

sessionRoute.get("/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const session = await stripe.checkout.sessions.retrieve(sessionId as string);

  return c.json({
    status: session.status,
    payment_status: session.payment_status,
  });
});

export default sessionRoute;
