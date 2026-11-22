import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const category = sp.category || "";
  const selectedCategory = category
    ? await prisma.category.findFirst({
        where: { OR: [{ id: category }, { slug: category }] },
        select: { id: true },
      })
    : null;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {},
        category ? { categoryId: selectedCategory?.id || "__none__" } : {},
      ],
    },
    include: {
      vendor: { include: { vendorProfile: true } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <section className="min-h-screen bg-[#F5F7FB] py-6">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="rounded-lg bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">All products</h1>
              <p className="mt-1 text-sm text-mute">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
            </div>
            <form
              className="grid grid-cols-[1fr_auto] gap-2 md:flex"
              action="/shop"
              method="get"
            >
              <div className="md:w-72">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search products"
                  className="h-11 w-full rounded-md border border-[#DDE3EC] px-3 text-sm outline-none focus:border-[#2457C5] focus:ring-2 focus:ring-[#2457C5]/10"
                />
              </div>
              <select
                name="category"
                defaultValue={selectedCategory?.id || ""}
                className="h-11 rounded-md border border-[#DDE3EC] bg-white px-3 text-sm outline-none focus:border-[#2457C5]">
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="col-span-2 h-11 rounded-md bg-[#2457C5] px-5 text-sm font-bold text-white transition hover:bg-[#163C91] md:col-span-1"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-muted text-lg mt-8">
            No products found. {q && "Try a different search."}
          </p>
        ) : (
          <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  category: p.categoryId || "Uncategorized",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}