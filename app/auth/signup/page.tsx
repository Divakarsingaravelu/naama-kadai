"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Suspense } from "react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "VENDOR"]),
  shopName: z.string().optional(),
});

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role")?.toLowerCase() === "vendor" ? "VENDOR" : "CUSTOMER";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole as "CUSTOMER" | "VENDOR",
    shopName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError("Please check your details.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      router.push("/auth/signin?registered=1");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Create your account</h1>
      <p className="text-mute mb-8">Join Naama Kadai in a minute.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {(["CUSTOMER", "VENDOR"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                className={`py-2 rounded-full border text-sm transition ${
                  form.role === r
                    ? "bg-marigold text-indigo border-marigold"
                    : "border-rule text-mute hover:border-indigo/30"
                }`}
              >
                {r === "CUSTOMER" ? "Customer" : "Vendor"}
              </button>
            ))}
          </div>
        </div>
        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        {form.role === "VENDOR" && (
          <Input label="Shop name" value={form.shopName} onChange={(v) => setForm({ ...form, shopName: v })} />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-marigold text-indigo font-medium py-3 rounded-full hover:bg-marigold/90 transition disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-mute mt-6">
        Already have an account? <Link href="/auth/signin" className="text-leaf underline">Sign in</Link>
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition"
        required
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-16">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}