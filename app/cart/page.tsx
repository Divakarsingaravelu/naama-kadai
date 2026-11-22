"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveProductImage } from "@/lib/product-image";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    images: Array<{ url: string }>;
    stock: number;
    vendor: { vendorProfile: { shopName: string } | null; name: string };
  };
}

function removeUrl(id: string): string {
  return "/api/cart?id=" + id;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<"stripe" | "razorpay">("stripe");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/auth/signin");
      return;
    }
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(id: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(removeUrl(id), { method: "DELETE" });
    load();
  }

  const totalCents = items.reduce((s, i) => s + i.product.priceCents * i.quantity, 0);

  async function checkout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Checkout failed");
      return;
    }
    if (data.url) window.location.href = data.url;
    if (data.razorpay) {
      // Razorpay flow handled via script
      const rzp = new (window as any).Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: "INR",
        name: "Naama Kadai",
        order_id: data.razorpay.orderId,
        handler: async (resp: any) => {
          const v = await fetch("/api/checkout/verify-razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...resp, orderId: data.orderId }),
          });
          if (v.ok) router.push(`/checkout/success?order=${data.orderId}`);
          else alert("Payment verification failed");
        },
      });
      rzp.open();
    }
  }

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-12">Loading cart…</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <Link href="/shop" className="text-leaf underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
      <h1 className="mb-5 text-2xl font-black tracking-[-.03em]">My cart</h1>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-[#E8ECF2] bg-white">
          <div className="border-b border-[#E8ECF2] px-5 py-4">
            <p className="text-sm font-bold">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
          </div>
          {items.map((i) => {
            const img = resolveProductImage(i.product.images?.[0]?.url, i.product.name);
            return (
              <div key={i.id} className="flex gap-4 border-b border-[#E8ECF2] px-4 py-4 last:border-0 sm:px-5">
                <div className="h-20 w-20 shrink-0 rounded-md bg-[#F4F6FA]">
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={i.product.name} className="h-full w-full rounded-md object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{i.product.name}</p>
                  <p className="mt-1 text-xs text-mute">{i.product.vendor.vendorProfile?.shopName}</p>
                  <button onClick={() => remove(i.id)} className="mt-3 text-xs font-bold text-[#2457C5]">
                    Remove
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-data font-bold">₹{(i.product.priceCents / 100).toFixed(2)}</p>
                  <input
                    type="number"
                    min={1}
                    max={i.product.stock}
                    value={i.quantity}
                    onChange={(e) => update(i.id, Math.min(i.product.stock, Math.max(1, Number(e.target.value))))}
                    className="mt-3 w-16 rounded-md border border-rule px-2 py-1.5 text-center text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg border border-[#E8ECF2] bg-white p-5">
          <h2 className="text-lg font-black">Price details</h2>
          <div className="mt-4 space-y-3 border-b border-[#E8ECF2] pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-mute">Subtotal</span>
              <span className="font-data font-bold">₹{(totalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Delivery</span>
              <span className="font-bold text-[#087E69]">Free</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider("stripe")}
              className={`rounded-md border py-2.5 text-sm font-bold ${provider === "stripe" ? "border-[#2457C5] bg-[#2457C5] text-white" : "border-rule"}`}>
              Stripe
            </button>
            <button
              type="button"
              onClick={() => setProvider("razorpay")}
              className={`rounded-md border py-2.5 text-sm font-bold ${provider === "razorpay" ? "border-[#2457C5] bg-[#2457C5] text-white" : "border-rule"}`}>
              Razorpay
            </button>
          </div>
          <button
            onClick={checkout}
            className="mt-4 w-full rounded-md bg-[#FFB21C] py-3 text-sm font-black text-[#172033] transition hover:bg-[#FFC24A]"
          >
            Place order
          </button>
          <p className="mt-3 text-xs text-mute">
            Pay securely with {provider === "stripe" ? "Stripe" : "Razorpay"}.
          </p>
        </aside>
      </div>
    </div>
  );
}