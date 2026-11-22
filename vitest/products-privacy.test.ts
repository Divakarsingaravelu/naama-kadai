import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma";
import { GET } from "../app/api/products/route";

describe("GET /api/products", () => {
  let vendorId: string | undefined;

  afterEach(async () => {
    if (vendorId) {
      await prisma.user.delete({ where: { id: vendorId } });
      vendorId = undefined;
    }
  });

  it("returns public vendor details without account credentials", async () => {
    const suffix = crypto.randomUUID();
    const vendor = await prisma.user.create({
      data: {
        email: `products-api-${suffix}@example.test`,
        passwordHash: "test-only-hash",
        name: "Test Vendor",
        role: "VENDOR",
        vendorProfile: {
          create: {
            shopName: "Test Stall",
            slug: `products-api-${suffix}`,
          },
        },
      },
    });
    vendorId = vendor.id;
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: "Test item",
        slug: "test-item",
        priceCents: 100,
        stock: 1,
        status: "DRAFT",
      },
    });

    const response = await GET(new Request("http://localhost/api/products"));
    const products = await response.json();
    const result = products.find((entry: { id: string }) => entry.id === product.id);

    expect(response.status).toBe(200);
    expect(result.vendor).toMatchObject({
      name: "Test Vendor",
      vendorProfile: { shopName: "Test Stall" },
    });
    expect(result.vendor).not.toHaveProperty("passwordHash");
  });
});
