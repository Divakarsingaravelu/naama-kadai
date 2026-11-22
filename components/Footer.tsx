import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rule bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="grid gap-8 text-sm md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg font-extrabold text-[#2457C5]">Naama Kadai</p>
            <p className="mt-2 max-w-md leading-6 text-mute">Independent stalls, one secure shopping experience.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold">Shop</p>
            <Link href="/shop" className="text-mute hover:text-[#2457C5]">All products</Link>
            <Link href="/orders" className="text-mute hover:text-[#2457C5]">Track order</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold">Selling</p>
            <Link href="/auth/signup?role=vendor" className="text-mute hover:text-[#2457C5]">Open a stall</Link>
            <Link href="/vendor" className="text-mute hover:text-[#2457C5]">Vendor dashboard</Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-rule pt-5 text-xs text-mute sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Naama Kadai</p>
          <p>Privacy · Terms</p>
        </div>
      </div>
    </footer>
  );
}