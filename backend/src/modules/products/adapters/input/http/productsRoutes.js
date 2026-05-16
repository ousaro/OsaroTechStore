import express, { Router } from "express";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

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

    const filename = `${randomUUID()}${ext}`;
    const uploadBaseUrl = process.env.PRODUCT_IMAGE_UPLOAD_URL;
    const publicBaseUrl = process.env.PRODUCT_IMAGE_PUBLIC_URL;

    if (uploadBaseUrl && publicBaseUrl) {
      const uploadToken = process.env.PRODUCT_IMAGE_UPLOAD_TOKEN;
      const uploadUrl = new URL(
        filename,
        uploadBaseUrl.endsWith("/") ? uploadBaseUrl : `${uploadBaseUrl}/`
      );
      const publicUrl = new URL(
        filename,
        publicBaseUrl.endsWith("/") ? publicBaseUrl : `${publicBaseUrl}/`
      );

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": req.headers["content-type"],
          ...(uploadToken ? { Authorization: `Bearer ${uploadToken}` } : {}),
        },
        body: req.body,
      });

      if (!uploadResponse.ok) {
        return res.status(502).json({ error: "Product image storage upload failed" });
      }

      return res.status(201).json({ url: publicUrl.toString() });
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads", "products");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), req.body);
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
