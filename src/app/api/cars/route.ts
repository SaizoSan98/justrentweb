import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const cars = await prisma.car.findMany({
    select: { id: true, make: true, model: true, licensePlate: true },
    orderBy: { make: "asc" },
  })
  return NextResponse.json(cars)
}
