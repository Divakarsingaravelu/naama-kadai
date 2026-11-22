import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import AddToCart from "./AddToCart";
import { resolveProductImage } from "@/lib/product-image";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: { include: { vendorProfile: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-xl text-muted">Product not found.</p>
    </div>;
  }

  const session = await getServerSession(authOptions);
  const shop = product.vendor.vendorProfile?.shopName || product.vendor.name;

  const images = product.images
    .map((image) => resolveProductImage(image.url, product.name))
    .filter(Boolean);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="rounded-3xl bg-surface overflow-hidden shadow-lg">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover transition-opacity duration-300"
                />
              ) : (
                <div
                  className="h-64 bg-surface/50 flex items-center justify-center rounded-30"
                >
                  <p className="text-muted">No image</p>
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-muted mb-2">
                Gallery
              </span>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 my-4">
                  {images.map((img) => (
                    <img
                      key={img}
                      src={img}
                      alt={product.name}
                      style={{ height: "60px", objectFit: "cover" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <span className="text-xs font-semibold text-muted mb-2">
              {shop}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-background/90 mb-3">
              {product.name}
            </h1>
            <p className="text-muted/60 mb-4">
              {product.description || "No description."}
            </p>

            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-3xl font-bold text-primary">
                ₹{(product.priceCents / 100).toFixed(2)}
              </p>
              {product.stock > 0 && (
                <span className="text-sm text-primary/90">
                  {product.stock} in stock
                </span>
              )}
            </div>

            {/* Category and Stock */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-sm text-muted">
                {product.categoryId || "Uncategorized"}
              </span>
              <span className="text-sm text-muted">
                {product.stock > 0 ? (
                  <span className="text-primary">In stock</span>
                ) : (
                  <span className="text-muted">Out of stock</span>
                )}
              </span>
            </div>

            {/* Add to Cart */}
            <div className="mt-6">
              <AddToCart
                productId={product.id}
                stock={product.stock}
                disabled={product.stock <= 0}
                loggedIn={!!session?.user}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}