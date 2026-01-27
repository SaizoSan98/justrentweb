import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const carId = url.searchParams.get("carId") || undefined
  const items = await prisma.availability.findMany({
    where: carId ? { carId } : {},
    orderBy: { startDate: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { carId, startDate, endDate, status } = body || {}
  if (!carId || !startDate || !endDate || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const created = await prisma.availability.create({
    data: {
      carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
    },
  })
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }
  await prisma.availability.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
