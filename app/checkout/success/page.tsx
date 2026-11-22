import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="font-display text-5xl mb-4">Thank you!</div>
      <p className="text-mute mb-8">Your order has been placed. {sp.order && `Order #${sp.order.slice(0, 8)}`}</p>
      <div className="flex gap-3 justify-center">
        <Link href="/orders" className="bg-marigold text-indigo font-medium px-6 py-3 rounded-full hover:bg-marigold/90 transition">
          View orders
        </Link>
        <Link href="/shop" className="border border-indigo/20 text-indigo font-medium px-6 py-3 rounded-full hover:bg-indigo/5 transition">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}