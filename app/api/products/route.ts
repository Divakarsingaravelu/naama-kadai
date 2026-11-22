import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resolveProductCategory } from "@/lib/product-category";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).default([]),
  category: z.string().trim().min(1).max(80).default("General"),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const vendorId = url.searchParams.get("vendorId");
  const products = await prisma.product.findMany({
    where: vendorId ? { vendorId } : {},
    include: {
      vendor: {
        select: {
          name: true,
          vendorProfile: { select: { shopName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const category = await resolveProductCategory(parsed.category);
    const product = await prisma.product.create({
      data: {
        vendorId: user.id,
        name: parsed.name,
        description: parsed.description || "",
        priceCents: parsed.priceCents,
        stock: parsed.stock,
        slug: parsed.name.toLowerCase().replace(/\s+/g, "-"),
        status: "DRAFT",
        images: {
          create: [{ url: parsed.images[0] || "", position: 0 }],
        },
        categoryId: category.id,
      },
    });
    return NextResponse.json(product);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid" }, { status: 400 });
  }
}