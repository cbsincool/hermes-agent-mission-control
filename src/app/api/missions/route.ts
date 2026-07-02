import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    return NextResponse.json({
      ok: true,
      data: missions,
      total: missions.length
    })
  } catch (error) {
    console.error('Failed to fetch missions:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch missions' },
      { status: 500 }
    )
  }
}
