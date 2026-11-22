"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        let images: string[] = [];
        try {
          images = JSON.parse(p.images);
        } catch {}
        setForm({
          name: p.name,
          description: p.description || "",
          price: (p.priceCents / 100).toString(),
          stock: p.stock.toString(),
          category: p.category,
          image: images[0] || "",
        });
      });
  }, [id]);

  function set(k: string, v: string) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        priceCents: Math.round(Number(form.price) * 100),
        stock: Number(form.stock),
        images: form.image ? [form.image] : [],
        category: form.category,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed");
      return;
    }
    router.push("/vendor/products");
  }

  if (!form) return <div className="max-w-2xl mx-auto px-6 py-12">Loading…</div>;

  const fields: { key: string; label: string; type?: string; textarea?: boolean }[] = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description", textarea: true },
    { key: "price", label: "Price (₹)", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
    { key: "category", label: "Category" },
    { key: "image", label: "Image URL" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6">Edit product</h1>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm mb-1">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition"
                rows={3}
              />
            ) : (
              <input
                type={f.type || "text"}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition"
              />
            )}
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-marigold text-indigo font-medium px-6 py-3 rounded-full hover:bg-marigold/90 transition disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}