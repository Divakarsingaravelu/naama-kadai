import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@naamakadai.com" },
    update: {},
    create: { email: "admin@naamakadai.com", passwordHash, name: "Admin", role: "ADMIN" },
  });

  const vendor1 = await prisma.user.upsert({
    where: { email: "priya@naamakadai.com" },
    update: {},
    create: { email: "priya@naamakadai.com", passwordHash, name: "Priya", role: "VENDOR" },
  });
  await prisma.vendorProfile.upsert({
    where: { userId: vendor1.id },
    update: {},
    create: { userId: vendor1.id, shopName: "Priya's Handloom", slug: "priya-handloom", status: "PENDING", description: "Handwoven textiles from Kanchipuram." },
  });

  const vendor2 = await prisma.user.upsert({
    where: { email: "rahul@naamakadai.com" },
    update: {},
    create: { email: "rahul@naamakadai.com", passwordHash, name: "Rahul", role: "VENDOR" },
  });
  await prisma.vendorProfile.upsert({
    where: { userId: vendor2.id },
    update: {},
    create: { userId: vendor2.id, shopName: "Rahul's Spices", slug: "rahul-spices", status: "PENDING", description: "Fresh ground spices and masalas." },
  });

  await prisma.user.upsert({
    where: { email: "customer@naamakadai.com" },
    update: {},
    create: { email: "customer@naamakadai.com", passwordHash, name: "Anita", role: "CUSTOMER" },
  });

  const textiles = await prisma.category.upsert({ where: { slug: "textiles" }, update: {}, create: { name: "Textiles", slug: "textiles" } });
  const spices = await prisma.category.upsert({ where: { slug: "spices" }, update: {}, create: { name: "Spices", slug: "spices" } });
  const apparel = await prisma.category.upsert({ where: { slug: "apparel" }, update: {}, create: { name: "Apparel", slug: "apparel" } });
  const home = await prisma.category.upsert({ where: { slug: "home" }, update: {}, create: { name: "Home", slug: "home" } });
  const food = await prisma.category.upsert({ where: { slug: "food" }, update: {}, create: { name: "Food", slug: "food" } });

  const productsData = [
    { vendorId: vendor1.id, categoryId: textiles.id, name: "Kanchipuram Silk Saree", priceCents: 499900, stock: 12, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor1.id, categoryId: textiles.id, name: "Cotton Dupatta", priceCents: 89900, stock: 40, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor1.id, categoryId: apparel.id, name: "Handloom Kurta", priceCents: 159900, stock: 25, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor2.id, categoryId: spices.id, name: "Garam Masala Blend", priceCents: 24900, stock: 100, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor2.id, categoryId: spices.id, name: "Turmeric Powder 500g", priceCents: 12900, stock: 200, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor2.id, categoryId: spices.id, name: "Red Chilli Powder", priceCents: 14900, stock: 150, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor1.id, categoryId: home.id, name: "Brass Lamp", priceCents: 189900, stock: 8, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
    { vendorId: vendor2.id, categoryId: food.id, name: "Filter Coffee Powder", priceCents: 34900, stock: 60, image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80" },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { vendorId_slug: { vendorId: p.vendorId, slug: p.name.toLowerCase().replace(/\s+/g, "-") } },
      update: {},
      create: {
        vendorId: p.vendorId,
        categoryId: p.categoryId,
        name: p.name,
        description: `Quality ${p.name} sourced with care.`,
        priceCents: p.priceCents,
        stock: p.stock,
        slug: p.name.toLowerCase().replace(/\s+/g, "-"),
        status: "DRAFT",
        images: { create: [{ url: p.image, position: 0 }] },
      },
    });
    console.log(`Created product: ${product.name}`);
  }

  console.log("Seeded. Admin:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
