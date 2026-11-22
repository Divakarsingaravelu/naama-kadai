import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "VENDOR"]),
  shopName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const email = parsed.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email,
        passwordHash,
        role: parsed.role,
      },
    });
    if (parsed.role === "VENDOR") {
      const slug = parsed.shopName
        ?.toLowerCase()
        ?.replace(/\s+/g, "-")
        ?.replace(/[^\w-]/g, "") ||
        `${parsed.name.toLowerCase().replace(/\s+/g, "-")}-stall`;
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          shopName: parsed.shopName || `${parsed.name}'s stall`,
          slug,
        },
      });
    }
    return NextResponse.json({ ok: true, id: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid request" }, { status: 400 });
  }
}