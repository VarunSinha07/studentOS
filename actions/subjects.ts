"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubjects(userId: string) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, subjects };
  } catch {
    return { success: false, error: "Failed to fetch subjects" };
  }
}

export async function createSubject(userId: string, name: string) {
  if (!userId || !name) throw new Error("Missing required fields");

  try {
    const subject = await prisma.subject.create({
      data: {
        name,
        userId,
      },
    });
    // revalidatePath("/dashboard");
    return { success: true, subject };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create subject" };
  }
}

export async function deleteSubject(subjectId: string) {
  try {
    await prisma.subject.delete({
      where: { id: subjectId },
    });
    // revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete subject" };
  }
}
