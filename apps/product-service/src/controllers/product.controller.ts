import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/product-db";
import { StripeProductType } from "@repo/types";
import { producer } from "../utils/kafka";

export const createProduct = async (req: Request, res: Response) => {
  const data: Prisma.ProductCreateInput = req.body;

  const { colors, images } = data;

  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({ message: "Colors array is required" });
  }

  if (!images || typeof images !== "object" || Array.isArray(images)) {
    return res.status(400).json({ message: "Images object  is required" });
  }

  const missingImages = colors.filter((color) => !(color in images));

  const extraImages = Object.keys(images).filter(
    (img) => !colors.includes(img),
  );

  if (missingImages.length > 0 || extraImages.length > 0) {
    return res.status(400).json({
      message: "Missing images for Colors!",
      missingImages,
      extraImages,
    });
  }

  const product = await prisma.product.create({ data });

  const stripeProduct: StripeProductType = {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
  };
  producer.send("product.created", { value: stripeProduct });

  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.ProductUpdateInput = req.body;

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data,
  });

  return res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleteProduct = await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });
  res.status(200).json(deleteProduct);
};

export const getProducts = async (req: Request, res: Response) => {
  const { sort, category, search, limit } = req.query;

  const orderBy = (() => {
    switch (sort) {
      case "asc":
        return { price: Prisma.SortOrder.asc };
        break;
      case "desc":
        return { price: Prisma.SortOrder.desc };
        break;
      case "oldest":
        return { createdAt: Prisma.SortOrder.asc };
        break;
      default:
        return { createdAt: Prisma.SortOrder.desc };
        break;
    }
  })();

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category as string,
      },
      name: {
        contains: search as string,
        mode: "insensitive",
      },
    },
    orderBy,
    take: limit ? Number(limit) : undefined,
  });

  res.status(200).json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  return res.status(200).json(product);
};
