"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Get all tasks
    const allTasks = await prisma.task.findMany({
      where: { userId },
    });

    // Tasks due today
    const todayTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });

    // Tasks due in next 7 days (excluding today)
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: endOfToday,
          lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Calculate productivity (completed last 7 days / total due or created last 7 days)
    const tasksInLastSevenDays = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const completedInLastSevenDays = tasksInLastSevenDays.filter(
      (t) => t.isCompleted,
    ).length;
    const productivity =
      tasksInLastSevenDays.length > 0
        ? Math.round((completedInLastSevenDays / tasksInLastSevenDays.length) * 100)
        : 0;

    // Calculate streak (consecutive days with at least one completed task)
    let streak = 0;
    let currentDate = new Date(startOfToday);

    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

      const completedOnDay = await prisma.task.findFirst({
        where: {
          userId,
          isCompleted: true,
          updatedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      if (completedOnDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      success: true,
      stats: {
        streak,
        productivity,
        todayTasks: todayTasks.length,
        upcomingDeadlines: upcomingDeadlines.length,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats",
      stats: { streak: 0, productivity: 0, todayTasks: 0, upcomingDeadlines: 0 },
    };
  }
}

export async function getWeeklyProgress(userId: string) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const data: Array<{ date: string; completed: number; pending: number }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          createdAt: {
            lt: dayEnd,
          },
          dueDate: {
            gte: dayStart,
          },
        },
      });

      const completed = tasks.filter((t) => t.isCompleted).length;
      const pending = tasks.filter((t) => !t.isCompleted).length;

      data.push({
        date: dayStart.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        completed,
        pending,
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch weekly progress:", error);
    return {
      success: false,
      error: "Failed to fetch weekly progress",
      data: [],
    };
  }
}