import Link from "next/link";
import { ArrowRight, BadgePercent, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { resolveProductImage } from "@/lib/product-image";

export const dynamic = "force-dynamic";

const categories = [
  { name: "Handloom", slug: "textiles", icon: "S" },
  { name: "Spices", slug: "spices", icon: "M" },
  { name: "Fashion", slug: "apparel", icon: "A" },
  { name: "Home", slug: "home", icon: "H" },
  { name: "Food", slug: "food", icon: "F" },
  { name: "All products", slug: "", icon: "+" },
];

export default async function LandingPage() {
  const products = await prisma.product.findMany({
    include: {
      vendor: { include: { vendorProfile: true } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-around">
            {categories.map((category) => (
              <Link
                href={category.slug ? `/shop?category=${category.slug}` : "/shop"}
                key={category.name}
                className="group flex min-w-20 flex-col items-center gap-2 rounded-lg px-2 py-2 text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-[#DDE5F2] bg-[#EEF3FF] text-lg font-black text-[#2457C5] transition group-hover:border-[#2457C5] group-hover:bg-[#2457C5] group-hover:text-white">
                  {category.icon}
                </span>
                <span className="text-xs font-semibold sm:text-sm">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
        <section className="relative overflow-hidden rounded-xl bg-[#123F91] text-white">
          <div className="grid min-h-[330px] items-center md:grid-cols-[1.15fr_.85fr]">
            <div className="relative z-10 px-6 py-10 sm:px-10 md:px-14">
              <p className="mb-3 text-sm font-bold text-[#FFD166]">Special local market</p>
              <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Fresh finds from stalls near you
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#DDE8FF] sm:text-base">
                Shop handloom, spices, homeware and everyday essentials in one secure checkout.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/shop" className="inline-flex items-center gap-2 rounded-md bg-[#FFB21C] px-5 py-3 text-sm font-extrabold text-[#172033] transition hover:bg-[#FFC24A]">
                  Shop now <ArrowRight size={17} />
                </Link>
                <Link href="/auth/signup?role=vendor" className="rounded-md border border-white/50 px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-[#123F91]">
                  Sell on Naama Kadai
                </Link>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 h-full w-[48%] opacity-30 md:relative md:opacity-100" aria-hidden="true">
              <div className="absolute bottom-[-70px] right-[-50px] h-[380px] w-[380px] rotate-6 rounded-full bg-[#F5C35B]" />
              <div className="absolute bottom-9 right-12 h-56 w-72 rotate-[-4deg] rounded-lg bg-white p-5 shadow-2xl md:bottom-14 md:right-16">
                <div className="relative h-32 overflow-hidden rounded-md bg-[#F4A261]">
                  {products[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveProductImage(products[0].images[0]?.url, products[0].name)}
                      alt={products[0].name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-[#172033]">From local stalls</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#667085]">Market pick</p>
                    <p className="mt-1 text-lg font-extrabold text-[#172033]">Today&apos;s best</p>
                  </div>
                  <p className="text-xl font-black text-[#2457C5]">₹299</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Truck, title: "Free delivery", text: "On eligible orders" },
            { icon: BadgePercent, title: "Stall offers", text: "Fresh deals every day" },
            { icon: ShieldCheck, title: "Secure payments", text: "UPI, cards and netbanking" },
            { icon: PackageCheck, title: "Easy tracking", text: "Updates at every step" },
          ].map((feature) => (
            <div key={feature.title} className="flex items-center gap-3 rounded-lg border border-[#E8ECF2] bg-white px-3 py-4 sm:px-4">
              <feature.icon className="shrink-0 text-[#2457C5]" size={22} strokeWidth={1.8} />
              <div>
                <p className="text-xs font-bold sm:text-sm">{feature.title}</p>
                <p className="mt-0.5 text-[11px] text-mute sm:text-xs">{feature.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-[#087E69]">Fresh from the stalls</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Top picks for you</h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-bold text-[#2457C5] sm:flex">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, category: product.categoryId || "Uncategorized" }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-bold">No products listed yet</h3>
              <p className="mt-2 text-sm text-mute">Be the first to open a stall and add your collection.</p>
              <Link href="/auth/signup?role=vendor" className="mt-5 inline-flex rounded-md bg-[#2457C5] px-5 py-3 text-sm font-bold text-white">
                Open a stall
              </Link>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
