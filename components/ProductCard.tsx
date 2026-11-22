import Link from "next/link";
import { resolveProductImage } from "@/lib/product-image";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  images: Array<{ url: string }>;
  category: string;
  stock: number;
  vendor: { vendorProfile: { shopName: string } | null; name: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const img = resolveProductImage(product.images?.[0]?.url, product.name);
  const shop = product.vendor.vendorProfile?.shopName || product.vendor.name;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-[#E8ECF2] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#C7D2E5] hover:shadow-[0_10px_28px_rgba(23,32,51,.10)]"
    >
      <div className="relative aspect-[1/1.08] overflow-hidden bg-[#F4F6FA]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-mute">Image unavailable</div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute left-2 top-2 rounded bg-[#FFF4E5] px-2 py-1 text-[11px] font-bold text-[#A15C00]">Only {product.stock} left</span>
        )}
      </div>
      <div className="p-3.5">
        <p className="mb-1 truncate text-xs font-medium text-mute">{shop}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#172033]">{product.name}</h3>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-data text-lg font-bold">₹{(product.priceCents / 100).toFixed(0)}</span>
          <span className="mb-0.5 text-xs text-[#087E69]">Free delivery</span>
        </div>
      </div>
    </Link>
  );
}