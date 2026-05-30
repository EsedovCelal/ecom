import { consumer } from "./kafka";
import { CreateStripeProduct } from "./stripeProduct";

export const runKafkaSubscriptions = async () => {
  consumer.subscribe("product.created", async (message) => {
    const product = message.value;
    console.log("Received message: product.created", product);

    await CreateStripeProduct(product);
  });
};
