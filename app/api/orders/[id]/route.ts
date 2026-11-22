import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = await req.json();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "ADMIN" && order.customerId !== user.id) {
    const owns = await prisma.orderItem.findFirst({
      where: { orderId: id, product: { vendorId: user.id } },
    });
    if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const updated = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}