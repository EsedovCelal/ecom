import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { shouldBeUser } from "./middleware/authMiddleware";
import stripe from "./utils/stripe";

const app = new Hono();
app.use("*", clerkMiddleware());

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/* app.post("/create-stripe-product", async (c) => {
  const res = await stripe.products.create({
    id: "123w",
    name: "Test product",
    default_price_data: {
      currency: "usd",
      unit_amount: 10 * 100,
    },
  });

  return c.json(res);
});

app.get("/stripe-product-price", async (c) => {
  const res = await stripe.prices.list({
    product: "123",
  });

  return c.json(res);
}); */

const start = async () => {
  try {
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log(`Payment service is running on port 8002`);
      },
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
start();
