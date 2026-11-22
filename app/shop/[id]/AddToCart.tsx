"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCart({
  productId,
  stock,
  disabled,
  loggedIn,
}: {
  productId: string;
  stock: number;
  disabled: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function add() {
    if (!loggedIn) {
      router.push("/auth/signin");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("Added to cart");
      router.refresh();
    } else {
      const d = await res.json();
      setMsg(d.error || "Failed");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={stock}
        value={qty}
        onChange={(e) => setQty(Math.min(stock, Math.max(1, Number(e.target.value))))}
        className="w-16 border border-rule rounded-xl px-3 py-2 bg-white"
      />
      <button
        onClick={add}
        disabled={disabled || loading}
        className="bg-marigold text-indigo font-medium px-6 py-2.5 rounded-full hover:bg-marigold/90 transition disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add to cart"}
      </button>
      {msg && <span className="text-sm text-mute">{msg}</span>}
    </div>
  );
}