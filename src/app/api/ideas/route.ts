import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    })
    
    return NextResponse.json({
      ok: true,
      data: ideas,
      total: ideas.length
    })
  } catch (error) {
    console.error('Failed to fetch ideas:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}
