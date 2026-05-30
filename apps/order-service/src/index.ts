import Fastify from "fastify";
import { clerkPlugin, getAuth } from "@clerk/fastify";
import { shouldBeUser } from "./middleware/authMiddleware";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order";
import { consumer, producer } from "./utils/kafka";

const fastify = Fastify();

fastify.register(clerkPlugin);

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

fastify.register(orderRoute);

const start = async () => {
  try {
    await Promise.all([
      await connectOrderDB(),
      producer.connect(),
      consumer.connect(),
    ]);
    await fastify.listen({ port: 8001 });
    console.log("Order service is running on port 8001");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
start();
