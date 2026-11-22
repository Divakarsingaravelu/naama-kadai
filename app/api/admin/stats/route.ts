import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [users, vendors, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.product.count(),
    prisma.order.count(),
  ]);
  const revenue = await prisma.order.aggregate({
    _sum: { totalCents: true },
    where: { status: { in: ["PAID", "FULFILLED"] } },
  });
  return NextResponse.json({ users, vendors, products, orders, revenueCents: revenue._sum.totalCents || 0 });
}