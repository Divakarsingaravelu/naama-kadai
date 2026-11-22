"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-8">Admin overview</h1>
      {stats && (
        <div className="grid sm:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Users", value: stats.users },
            { label: "Vendors", value: stats.vendors },
            { label: "Products", value: stats.products },
            { label: "Orders", value: stats.orders },
            { label: "Revenue", value: `₹${(stats.revenueCents / 100).toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="border border-rule rounded-2xl p-5 bg-white">
              <div className="text-sm text-mute">{s.label}</div>
              <div className="font-data text-2xl font-semibold mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <p className="text-mute text-sm">
        User management via Clerk is optional; this dashboard shows platform aggregates.
      </p>
    </div>
  );
}