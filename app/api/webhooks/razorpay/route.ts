import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 400 });
  const sig = req.headers.get("x-razorpay-signature");
  const body = await req.text();
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected !== sig) return new NextResponse("Invalid signature", { status: 400 });

  const event = JSON.parse(body);
  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.notes?.orderId || payment?.receipt;
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order && order.status !== "PAID") {
        await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", paymentId: payment.id } as any });
        await prisma.cartItem.deleteMany({ where: { userId: order.customerId } });
      }
    }
  }
  return NextResponse.json({ received: true });
}