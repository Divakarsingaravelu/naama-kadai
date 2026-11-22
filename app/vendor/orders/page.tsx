"use client";
import { useEffect, useState } from "react";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/orders");
    setOrders(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function mark(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-8">Incoming orders</h1>
      <div className="space-y-4">
        {orders.map((o: any) => (
          <div key={o.id} className="border border-rule rounded-2xl p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-data text-sm">#{o.id.slice(0, 8)}</div>
                <div className="text-sm text-mute">{o.customer?.name} · {o.customer?.email}</div>
              </div>
              <div className="text-right">
                <div className="font-data text-lg">₹{(o.totalCents / 100).toFixed(2)}</div>
                <span className={`text-xs ${o.status === "PAID" ? "text-leaf" : "text-mute"}`}>{o.status}</span>
              </div>
            </div>
            <ul className="text-sm text-mute mb-3">
              {o.items.map((i: any) => (
                <li key={i.id}>
                  {i.product?.name} × {i.quantity}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              {o.status === "PAID" && (
                <button
                  onClick={() => mark(o.id, "FULFILLED")}
                  className="text-sm bg-leaf text-white px-4 py-1.5 rounded-full hover:bg-leaf/90 transition"
                >
                  Mark fulfilled
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-mute">No orders yet.</p>}
      </div>
    </div>
  );
}