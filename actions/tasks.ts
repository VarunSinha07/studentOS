"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAgendaTasks(userId: string) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { isCompleted: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });
    return { success: true, tasks };
  } catch {
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function createTask(
  userId: string,
  title: string,
  dueDate?: Date | null,
  priority: "Low" | "Medium" | "High" = "Medium",
) {
  if (!userId || !title) throw new Error("Missing required fields");

  try {
    const task = await prisma.task.create({
      data: {
        title,
        dueDate: dueDate || null,
        priority,
        userId,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch {
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  taskId: string,
  priority?: "Low" | "Medium" | "High",
  dueDate?: Date | null,
) {
  if (!taskId) throw new Error("Missing task ID");

  try {
    const updateData: {
      priority?: "Low" | "Medium" | "High";
      dueDate?: Date | null;
    } = {};
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch {
    return { success: false, error: "Failed to update task" };
  }
}

export async function toggleTask(taskId: string, isCompleted: boolean) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted },
    });
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch {
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete task" };
  }
}
