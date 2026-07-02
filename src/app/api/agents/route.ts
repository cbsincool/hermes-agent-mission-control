import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const agents = await prisma.agentState.findMany({
      orderBy: {
        lastActive: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        emoji: agent.emoji,
        role: agent.role,
        status: agent.status,
        currentTask: agent.currentTask,
        tasksCompleted: agent.tasksCompleted,
        totalCost: agent.totalCost,
        lastActive: agent.lastActive,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
