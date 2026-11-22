"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LayoutDashboard, Menu, X, Search, Package } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(23,32,51,.08)]">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <span className="block font-display text-xl font-extrabold leading-none tracking-[-.04em] text-[#2457C5]">Naama Kadai</span>
          <span className="mt-1 block text-[10px] font-semibold text-[#087E69]">நம்ம கடை</span>
        </Link>
        <form action="/shop" method="get" className="hidden flex-1 md:block">
          <label className="sr-only" htmlFor="global-search">Search products</label>
          <div className="flex h-11 max-w-2xl items-center rounded-lg border border-[#DDE3EC] bg-[#F7F9FC] focus-within:border-[#2457C5] focus-within:ring-2 focus-within:ring-[#2457C5]/10">
            <Search className="ml-3 text-[#667085]" size={18} />
            <input id="global-search" name="q" placeholder="Search sarees, spices, lamps and more" className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#98A2B3]" />
          </div>
        </form>
        <button
          type="button"
          className="ml-auto rounded-lg border border-rule p-2 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-[72px] flex-col gap-1 border-b border-rule bg-white px-4 py-4 text-sm md:static md:flex md:w-auto md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0`}>
          <Link href="/shop" className="rounded-lg px-3 py-2 font-semibold hover:bg-[#F2F5FA]">Shop</Link>
          {role === "VENDOR" || role === "ADMIN" ? (
            <Link href="/vendor" className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold hover:bg-[#F2F5FA]">
              <LayoutDashboard size={17} /> Dashboard
            </Link>
          ) : null}
          {session?.user ? (
            <>
              <Link href="/cart" className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold hover:bg-[#F2F5FA]">
                <ShoppingCart size={17} /> Cart
              </Link>
              <Link href="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold hover:bg-[#F2F5FA]">
                <Package size={17} /> Orders
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg px-3 py-2 text-left font-semibold text-mute hover:bg-[#F2F5FA]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-lg px-3 py-2 font-semibold hover:bg-[#F2F5FA]">Sign in</Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-[#2457C5] px-4 py-2.5 font-semibold text-white transition hover:bg-[#163C91]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}