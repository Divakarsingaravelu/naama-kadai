import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.count({ where: { vendorId: user.id } });
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId: user.id } } } },
    include: { items: { include: { product: true } } },
  });
  const revenueCents = orders.reduce((s, o) => {
    const v = o.items
      .filter((i) => (i.product as any).vendorId === user.id)
      .reduce((a, i) => a + (i.product as any).priceCents * i.quantity, 0);
    return s + (o.status === "PAID" || o.status === "FULFILLED" ? v : 0);
  }, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  return NextResponse.json({ products, orders: orders.length, revenueCents, pending });
}