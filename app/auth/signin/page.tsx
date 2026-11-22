"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Suspense } from "react";

function SigninForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const registered = params.get("registered");

  useEffect(() => {
    if (registered) setError("");
  }, [registered]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/shop");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Welcome back</h1>
      <p className="text-mute mb-8">Sign in to your Naama Kadai account.</p>
      {registered && (
        <p className="text-sm text-leaf mb-4">Account created. Please sign in.</p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-rule rounded-xl px-4 py-2.5 bg-white focus:border-marigold outline-none transition"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-marigold text-indigo font-medium py-3 rounded-full hover:bg-marigold/90 transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-mute mt-6">
        New here? <Link href="/auth/signup" className="text-leaf underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-16">Loading…</div>}>
      <SigninForm />
    </Suspense>
  );
}