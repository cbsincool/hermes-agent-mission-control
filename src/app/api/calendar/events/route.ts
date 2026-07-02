import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Calendar events endpoint.
 * 
 *   GET  /api/calendar/events  -> list all scheduled events
 *   POST /api/calendar/events  -> create/update an event
 */

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const status = searchParams.get("status") || "scheduled";
    
    const where: any = { status };
    if (agentId) where.agentId = agentId;
    
    // 获取未来 30 天的事件
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    where.startTime = {
      gte: now,
      lte: thirtyDaysLater
    };
    
    const events = await prisma.scheduledEvent.findMany({
      where,
      orderBy: { startTime: "asc" },
      take: 100
    });
    
    return NextResponse.json({ 
      success: true, 
      count: events.length,
      events 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json().catch(() => ({}));
    const {
      id,
      title,
      description,
      agentId,
      startTime,
      endTime,
      recurrence,
      source,
      externalId,
      status,
    } = body || {};
    
    if (!title || !startTime) {
      return NextResponse.json({ 
        error: "title and startTime required" 
      }, { status: 400 });
    }
    
    const event = await prisma.scheduledEvent.upsert({
      where: { id: id || externalId || `event_${Date.now()}` },
      create: {
        id: id || externalId || `event_${Date.now()}`,
        title: String(title),
        description: description ? String(description) : null,
        agentId: agentId ? String(agentId) : null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        recurrence: recurrence ? String(recurrence) : null,
        source: source ? String(source) : null,
        externalId: externalId ? String(externalId) : null,
        status: status ? String(status) : "scheduled",
      },
      update: {
        ...(title !== undefined && { title: String(title) }),
        ...(description !== undefined && { description: String(description) }),
        ...(agentId !== undefined && { agentId: String(agentId) }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(recurrence !== undefined && { recurrence: String(recurrence) }),
        ...(status !== undefined && { status: String(status) }),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
