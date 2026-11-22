import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  categoryUpsert: vi.fn(),
  productCreate: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { upsert: mocks.categoryUpsert },
    product: {
      create: mocks.productCreate,
      findMany: mocks.productFindMany,
    },
  },
}));

import { POST } from "../app/api/products/route";

describe("POST /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue({
      user: { id: "vendor-1", role: "VENDOR" },
    });
    mocks.categoryUpsert.mockResolvedValue({
      id: "general-category-id",
      name: "General",
      slug: "general",
    });
    mocks.productCreate.mockImplementation(async ({ data }) => {
      if (data.categoryId !== "general-category-id") {
        throw new Error("Foreign key constraint violated");
      }
      return { id: "product-1", categoryId: data.categoryId };
    });
  });

  it("uses the category record ID when the request contains a category name", async () => {
    const response = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Blue ballpoint pen",
          priceCents: 125,
          stock: 2,
          category: "General",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "product-1",
      categoryId: "general-category-id",
    });
  });
});
