import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json();
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
  if (items.length === 0) return NextResponse.json({ error: "Cart empty" }, { status: 400 });

  const totalCents = items.reduce((s, i) => s + i.product.priceCents * i.quantity, 0);

  const paymentProvider = provider === "razorpay" ? "RAZORPAY" : "STRIPE";

  // Compute fee split per item: platformFeeCents = round(unitPriceCents * quantity * commissionBps / 10000)
// vendorShareCents = unitPriceCents * quantity - platformFeeCents
const vendorProfiles = await prisma.vendorProfile.findMany({ where: { userId: { in: items.map(i => i.product.vendorId) } } });
const commissionMap = new Map();
vendorProfiles.forEach(vp => {
  commissionMap.set(vp.userId, vp.commissionBps);
});

const itemsForOrder = items.map((i) => {
  const commissionBps = commissionMap.get(i.product.vendorId) || 1000;
  const unitPrice = i.product.priceCents;
  const gross = unitPrice * i.quantity;
  const platformFeeCents = Math.round(gross * commissionBps / 10000);
  const vendorShareCents = gross - platformFeeCents;
  return {
    productId: i.productId,
    vendorId: i.product.vendorId,
    quantity: i.quantity,
    unitPriceCents: unitPrice,
    platformFeeCents,
    vendorShareCents,
    fulfillmentStatus: "UNFULFILLED",
  };
});

const order = await prisma.order.create({
    data: {
      customerId: userId,
      paymentProvider,
      status: "PENDING",
      totalCents,
      currency: "INR",
      shippingLine1: "",
      shippingLine2: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingPhone: "",
      items: {
        create: itemsForOrder,
      },
    },
  });

  if (provider === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay not configured. Add keys to .env.local" }, { status: 400 });
    }
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rzpOrder = await rzp.orders.create({
      amount: totalCents, // paise (INR smallest unit) — assume INR
      currency: "INR",
      receipt: order.id,
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: rzpOrder.id } as any });
    return NextResponse.json({
      razorpay: { keyId, orderId: rzpOrder.id, amount: totalCents },
      orderId: order.id,
    });
  }

  // Stripe
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Stripe not configured. Add keys to .env.local" }, { status: 400 });
  }
  const stripe = new Stripe(secret);
  const sessionCheckout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: items.map((i) => ({
      price_data: {
        currency: "inr",
        product_data: { name: i.product.name },
        unit_amount: i.product.priceCents,
      },
      quantity: i.quantity,
    })),
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    metadata: { orderId: order.id },
  });
  await prisma.order.update({ where: { id: order.id }, data: { paymentId: sessionCheckout.id } as any });
  return NextResponse.json({ url: sessionCheckout.url });
}