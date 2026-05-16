import express, { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const IMAGE_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const uploadProductImage = async (req, res, next) => {
  try {
    const ext = IMAGE_EXTENSIONS[req.headers["content-type"]];
    if (!ext) {
      return res.status(415).json({ error: "Unsupported image type" });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const uploadDir = path.resolve(process.cwd(), "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), req.body);

    res.status(201).json({ url: `/uploads/products/${filename}` });
  } catch (error) {
    next(error);
  }
};

export const createProductsRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.get("/", controller.getAllProducts);
  router.post(
    "/uploads",
    requireAuth,
    requireAuth.requireAdmin,
    express.raw({ type: Object.keys(IMAGE_EXTENSIONS), limit: "5mb" }),
    uploadProductImage
  );
  router.get("/:id", controller.getProductById);
  router.post("/", requireAuth, requireAuth.requireAdmin, controller.addProduct);
  router.post("/:id/reviews", requireAuth, controller.addProductReview);
  router.put("/:id", requireAuth, requireAuth.requireAdmin, controller.updateProduct);
  router.delete("/:id", requireAuth, requireAuth.requireAdmin, controller.deleteProduct);
  return router;
};
