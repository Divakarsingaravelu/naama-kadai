import { prisma } from "@/lib/prisma";

function categorySlug(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `category-${Buffer.from(name, "utf8").toString("hex")}`;
}

export async function resolveProductCategory(name: string) {
  const normalizedName = name.trim() || "General";
  return prisma.category.upsert({
    where: { slug: categorySlug(normalizedName) },
    update: {},
    create: { name: normalizedName, slug: categorySlug(normalizedName) },
  });
}
