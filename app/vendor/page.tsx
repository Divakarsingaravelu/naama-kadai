"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenueCents: 0,
    pending: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/vendor/stats").then((r) => r.json()).then(setStats);
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }, []);

  // Initialize recent orders state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      setRecentOrders(orders.slice(0, 8));
    } else {
      setRecentOrders([]);
    }
  }, [orders]);

  // Map orders to JSX
  const orderElements = recentOrders.map((o: any) => (
    <div
      key={o.id}
      className="border border-rule rounded-xl p-4 flex items-center justify-between bg-white transition-shadow hover:bg-ivory/50"
    >
      <div className="font-data text-sm">#{o.id.slice(0, 8)}</div>
      <div className="text-sm text-mute">
        {o.customer?.name} · {o.items.length} items
      </div>
    </div>
  ));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="border border-rule rounded-2xl p-6 bg-white shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl">Vendor dashboard</h1>
          <Link
            href="/vendor/products/new"
            className="bg-marigold text-indigo font-medium px-5 py-2.5 rounded-full hover:bg-marigold/90 transition"
          >
            Add product
          </Link>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="border border-rule rounded-2xl p-6 bg-ivory">
            <div className="text-sm text-mute mb-2">Products</div>
            <div className="font-data text-3xl font-semibold">{stats.products}</div>
          </div>
          <div className="border border-rule rounded-2xl p-6 bg-ivory">
            <div className="text-sm text-mute mb-2">Orders</div>
            <div className="font-data text-3xl font-semibold">{stats.orders}</div>
          </div>
          <div className="border border-rule rounded-2xl p-6 bg-ivory">
            <div className="text-sm text-mute mb-2">Revenue</div>
            <div className="font-data text-3xl font-semibold">
              ₹{(stats.revenueCents / 100).toFixed(2)}
            </div>
          </div>
          <div className="border border-rule rounded-2xl p-6 bg-ivory">
            <div className="text-sm text-mute mb-2">Pending</div>
            <div className="font-data text-3xl font-semibold">{stats.pending}</div>
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl mb-6">Recent orders</h2>
      <div className="space-y-3">
        {recentOrders.length === 0 ? (
          <p className="text-mute text-sm mt-2">No orders yet.</p>
        ) : (
          <div>{orderElements}</div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/vendor/products"
          className="flex-1 bg-ivory text-indigo font-medium rounded-full py-3 px-6 hover:bg-ivory/80 transition text-center"
        >
          Manage products
        </Link>
        <Link
          href="/vendor/orders"
          className="flex-1 bg-ivory text-indigo font-medium rounded-full py-3 px-6 hover:bg-ivory/80 transition text-center"
        >
          All orders
        </Link>
      </div>
    </div>
  );
}