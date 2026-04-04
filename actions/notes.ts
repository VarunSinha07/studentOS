"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotes(userId: string, subjectId?: string | null) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(subjectId
          ? { subjectId }
          : subjectId === null
            ? { subjectId: null }
            : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, notes };
  } catch {
    return { success: false, error: "Failed to fetch notes" };
  }
}

export async function getNoteById(noteId: string) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });
    return { success: true, note };
  } catch {
    return { success: false, error: "Failed to fetch note" };
  }
}

export async function createNote(userId: string, subjectId?: string | null) {
  if (!userId) throw new Error("Unauthorized");

  try {
    const note = await prisma.note.create({
      data: {
        title: "Untitled Note",
        content: "", // Will be populated by Tiptap
        userId,
        subjectId: subjectId || null,
      },
    });
    // revalidatePath("/dashboard");
    return { success: true, note };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create note" };
  }
}

export async function updateNote(
  noteId: string,
  title?: string,
  content?: string,
  subjectId?: string | null,
) {
  try {
    const data: Parameters<typeof prisma.note.update>[0]["data"] = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (subjectId !== undefined) data.subjectId = subjectId;

    const note = await prisma.note.update({
      where: { id: noteId },
      data,
    });
    // revalidatePath("/dashboard");
    return { success: true, note };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update note" };
  }
}

export async function deleteNote(noteId: string) {
  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    // revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete note" };
  }
}
