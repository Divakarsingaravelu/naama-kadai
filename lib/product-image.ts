const demoImages = [
  {
    pattern: /saree|dupatta|kurta|handloom|textile/i,
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    pattern: /masala|turmeric|chilli|spice/i,
    url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
  },
  {
    pattern: /lamp|brass|home/i,
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  },
  {
    pattern: /coffee|food/i,
    url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
  },
];

export function resolveProductImage(imageUrl: string | undefined, productName: string) {
  if (imageUrl && !imageUrl.includes("picsum.photos")) return imageUrl;
  return demoImages.find(({ pattern }) => pattern.test(productName))?.url || imageUrl || "";
}
