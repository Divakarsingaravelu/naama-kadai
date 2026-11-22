"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setOrders(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-12">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <div>
          <p className="text-mute mb-4">No orders yet.</p>
          <Link href="/shop" className="text-leaf underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="border border-rule rounded-2xl p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-data text-sm">#{o.id.slice(0, 8)}</div>
                  <div className="text-sm text-mute">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-data text-lg">₹{(o.totalCents / 100).toFixed(2)}</div>
                  <span className={`text-xs ${o.status === "PAID" ? "text-leaf" : o.status === "FULFILLED" ? "text-indigo" : "text-mute"}`}>
                    {o.status}
                  </span>
                </div>
              </div>
              <ul className="text-sm text-mute">
                {o.items.map((i: any) => (
                  <li key={i.id}>
                    {i.product?.name} × {i.quantity} — ₹{(i.priceCents * i.quantity / 100).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}