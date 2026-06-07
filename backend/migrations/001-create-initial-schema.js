// Migration: Create initial schema with indexes

export const up = async (db) => {
  // ── Users collection ──
  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { bsonType: "string" },
          lastName: { bsonType: "string" },
          email: { bsonType: "string" },
          password: { bsonType: "string" },
          admin: { bsonType: "bool" },
          picture: { bsonType: "string" },
          phone: { bsonType: "string" },
          address: { bsonType: "string" },
          city: { bsonType: "string" },
          country: { bsonType: "string" },
          state: { bsonType: "string" },
          postalCode: { bsonType: "int" },
          favorites: { bsonType: "array" },
          cart: { bsonType: "array" },
        },
      },
    },
  });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ admin: 1 });

  // ── Categories collection ──
  await db.createCollection("categories", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name"],
        properties: {
          name: { bsonType: "string" },
          description: { bsonType: "string" },
        },
      },
    },
  });
  await db.collection("categories").createIndex({ name: 1 }, { unique: true });

  // ── Products collection ──
  await db.createCollection("products", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "price", "category"],
        properties: {
          name: { bsonType: "string" },
          description: { bsonType: "string" },
          price: { bsonType: "double" },
          currency: { bsonType: "string" },
          category: { bsonType: "objectId" },
          stock: { bsonType: "int" },
          images: { bsonType: "array", items: { bsonType: "string" } },
          status: { bsonType: "string" },
          reviews: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                userId: { bsonType: "string" },
                name: { bsonType: "string" },
                rating: { bsonType: "int" },
                comment: { bsonType: "string" },
              },
            },
          },
        },
      },
    },
  });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ status: 1, createdAt: 1 });
  await db.collection("products").createIndex({ name: "text", description: "text" });

  // ── Orders collection ──
  await db.createCollection("orders", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["orderItems", "shippingAddress", "paymentMethod", "totalPrice", "ownerId"],
        properties: {
          orderItems: { bsonType: "array" },
          shippingAddress: { bsonType: "object" },
          paymentMethod: { bsonType: "string" },
          itemsPrice: { bsonType: "double" },
          taxPrice: { bsonType: "double" },
          shippingPrice: { bsonType: "double" },
          totalPrice: { bsonType: "double" },
          isPaid: { bsonType: "bool" },
          paidAt: { bsonType: "date" },
          isDelivered: { bsonType: "bool" },
          deliveredAt: { bsonType: "date" },
          ownerId: { bsonType: "objectId" },
          status: { bsonType: "string" },
        },
      },
    },
  });
  await db.collection("orders").createIndex({ ownerId: 1, createdAt: -1 });

  // ── Payments collection ──
  await db.createCollection("payments", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["orderId", "provider", "status"],
        properties: {
          orderId: { bsonType: "objectId" },
          provider: { bsonType: "string" },
          status: { bsonType: "string" },
          sessionId: { bsonType: "string" },
          paymentIntentId: { bsonType: "string" },
          amount: { bsonType: "double" },
          currency: { bsonType: "string" },
          metadata: { bsonType: "object" },
        },
      },
    },
  });
  await db.collection("payments").createIndex({ orderId: 1 }, { unique: true });
  await db.collection("payments").createIndex({ sessionId: 1 });
  await db.collection("payments").createIndex({ status: 1 });

  console.log("  ✓ Created collections and indexes");
};

export const down = async (db) => {
  const collections = ["users", "categories", "products", "orders", "payments"];
  for (const name of collections) {
    await db
      .collection(name)
      .drop()
      .catch(() => {});
  }
  console.log("  ✓ Dropped collections");
};
