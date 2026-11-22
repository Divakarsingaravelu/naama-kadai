import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveProductCategory } from "@/lib/product-category";
import { z } from "zod";

async function ownerOrAdmin(productId: string, userId: string, role: string) {
  if (role === "ADMIN") return true;
  const p = await prisma.product.findUnique({ where: { id: productId } });
  return p?.vendorId === userId;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { vendor: { include: { vendorProfile: true } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await ownerOrAdmin(id, user.id, user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const categoryName = z.string().trim().min(1).max(80).optional().parse(body.category);
  const category = categoryName ? await resolveProductCategory(categoryName) : null;
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      priceCents: body.priceCents,
      stock: body.stock,
      ...(category ? { categoryId: category.id } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await ownerOrAdmin(id, user.id, user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}