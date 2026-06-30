import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const agents = await prisma.agentState.findMany({
      orderBy: {
        lastSeen: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        currentTask: agent.currentTask,
        tasksCompleted: agent.tasksCompleted,
        totalCost: agent.totalCost,
        lastSeen: agent.lastSeen,
        hostname: agent.hostname,
      })),
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
