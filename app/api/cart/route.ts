import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function userId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id as string | undefined;
}

export async function GET() {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.cartItem.findMany({
    where: { userId: uid },
    include: {
      product: {
        include: {
          vendor: { include: { vendorProfile: true } },
          images: { orderBy: { position: "asc" } },
        },
      },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, quantity } = await req.json();
  if (!productId || quantity < 1) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.stock < quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
  }
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: uid, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: uid, productId, quantity },
  });
  return NextResponse.json(item);
}

export async function PUT(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, quantity } = await req.json();
  if (quantity < 1) {
    await prisma.cartItem.deleteMany({ where: { id, userId: uid } });
    return NextResponse.json({ ok: true });
  }
  const updated = await prisma.cartItem.updateMany({
    where: { id, userId: uid },
    data: { quantity },
  });
  return NextResponse.json({ ok: true, count: updated.count });
}

export async function DELETE(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    await prisma.cartItem.deleteMany({ where: { id, userId: uid } });
  } else {
    await prisma.cartItem.deleteMany({ where: { userId: uid } });
  }
  return NextResponse.json({ ok: true });
}