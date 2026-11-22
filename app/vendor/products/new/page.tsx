"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "10",
    category: "General",
    image: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      router.push("/vendor/products");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6">Add product</h1>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        <Field label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
        <Field label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
        <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
        <Field label="Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-marigold text-indigo font-medium px-6 py-3 rounded-full hover:bg-marigold/90 transition disabled:opacity-60"
        >
          {loading ? "Saving…" : "Create product"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  const cls = "w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition";
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={cls} rows={3} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} required={label === "Name" || label === "Price (₹)"} />
      )}
    </div>
  );
}