"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const session = await fetch("/api/auth/session").then((r) => r.json());
    const uid = session?.user?.id;
    const res = await fetch(`/api/products?vendorId=${uid}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Products</h1>
        <Link href="/vendor/products/new" className="bg-marigold text-indigo font-medium px-5 py-2.5 rounded-full hover:bg-marigold/90 transition">
          Add product
        </Link>
      </div>
      {loading ? (
        <p className="text-mute">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-mute">No products yet. Add your first product.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className="border border-rule rounded-2xl p-4 bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-mute">{p.category} · stock {p.stock}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-data">₹{(p.priceCents / 100).toFixed(2)}</div>
                <Link href={`/vendor/products/${p.id}/edit`} className="text-leaf text-sm underline">
                  Edit
                </Link>
                <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}