"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Minus,
  Square,
  Plus,
  Trash2,
  Loader2,
  FileText,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { createNote, getNotes, updateNote, deleteNote } from "@/actions/notes";
import { getSubjects, createSubject, deleteSubject } from "@/actions/subjects";
import { authClient } from "@/lib/auth-client";
import { summarizeNote } from "@/actions/ai";
type Subject = {
  id: string;
  name: string;
};

type Note = {
  id: string;
  title: string | null;
  content: string | null;
  subjectId: string | null;
  updatedAt: Date | string | null;
};

// Mac OS Window Control Buttons
function MacDots({
  onClose,
  onMinimize,
  onMaximize,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group shrink-0">
      <button
        onClick={onClose}
        className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-red-500"
      >
        <X className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <button
        onClick={onMinimize}
        className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-yellow-500"
      >
        <Minus className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <button
        onClick={onMaximize}
        className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-green-500"
      >
        <Square className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}

export function NotesApp({
  onClose,
  zIndex,
  onFocus,
}: {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<string, boolean>
  >({});
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start typing your notes here..." }),
    ],
    content: selectedNote?.content || "",
    onUpdate: ({ editor }) => {
      if (selectedNote && session?.user?.id) {
        setSaving(true);
        const content = editor.getHTML();
        updateNote(selectedNote.id, undefined, content).then(() => {
          setSaving(false);
          setSelectedNote((prev) => (prev ? { ...prev, content } : prev));
          setNotes((prev) =>
            prev.map((n) => (n.id === selectedNote.id ? { ...n, content } : n)),
          );
        });
      }
    },
  });

  // Window Controls State
  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  // Un-minimize when focused from dock
  useEffect(() => {
    if (zIndex > prevZIndex.current && isMinimizedRef.current) {
      isMinimizedRef.current = false;
      gsap.to(windowRef.current, {
        scale: 1,
        opacity: 1,
        y: isMaximized ? 0 : 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
    prevZIndex.current = zIndex;
  }, [zIndex, isMaximized]);

  const handleMinimize = () => {
    isMinimizedRef.current = true;
    gsap.to(windowRef.current, {
      scale: 0.8,
      opacity: 0,
      y: "+=300",
      duration: 0.4,
      ease: "power3.inOut",
    });
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      gsap.to(windowRef.current, {
        top: "6rem",
        left: "6rem",
        width: "100%",
        maxWidth: "850px",
        height: "75vh",
        maxHeight: "750px",
        borderRadius: "1rem",
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
    } else {
      setIsMaximized(true);
      gsap.to(windowRef.current, {
        top: "32px",
        left: 0,
        width: "100vw",
        maxWidth: "100vw",
        height: "calc(100vh - 32px)",
        maxHeight: "none",
        borderRadius: 0,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  };

  // Entrance Animation
  useEffect(() => {
    let cancelled = false;

    gsap.fromTo(
      windowRef.current,
      { opacity: 0, scale: 0.85, rotateX: 10, y: 50 },
      {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        transformPerspective: 1200,
      },
    );

    const loadData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [subRes, noteRes] = await Promise.all([
        getSubjects(session.user.id),
        getNotes(session.user.id),
      ]);

      if (cancelled) return;

      if (subRes?.success && subRes.subjects) {
        setSubjects(subRes.subjects);
        // Auto-expand all subjects initially
        const expandMap: Record<string, boolean> = {};
        subRes.subjects.forEach((s: Subject) => (expandMap[s.id] = true));
        setExpandedSubjects(expandMap);
      }

      if (noteRes?.success) {
        setNotes(noteRes.notes || []);
        if (noteRes.notes && noteRes.notes.length > 0) {
          setSelectedNote(noteRes.notes[0]);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    void loadData();

    const handleNotesUpdated = () => {
      if (!cancelled) {
        void loadData();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("notes-updated", handleNotesUpdated);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("notes-updated", handleNotesUpdated);
      }
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (
      editor &&
      selectedNote &&
      editor.getHTML() !== (selectedNote.content || "")
    ) {
      editor.commands.setContent(selectedNote.content || "");
    }
  }, [selectedNote, editor]);

  // Handlers
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !session?.user?.id) return;
    const res = await createSubject(session.user.id, newSubjectName);
    if (res?.success && res.subject) {
      setSubjects([...subjects, res.subject]);
      setExpandedSubjects((prev) => ({ ...prev, [res.subject!.id]: true }));
      setNewSubjectName("");
      setIsCreatingSubject(false);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSubject(id);
    setSubjects(subjects.filter((s) => s.id !== id));
    setNotes(notes.filter((n) => n.subjectId !== id));
    if (selectedNote?.subjectId === id) setSelectedNote(null);
  };

  const handleCreateNote = async (subjectId: string | null) => {
    if (!session?.user?.id) return;
    const res = await createNote(session.user.id, subjectId);
    if (res?.success && res.note) {
      setNotes([res.note, ...notes]);
      setSelectedNote(res.note);
      if (subjectId) {
        setExpandedSubjects((prev) => ({ ...prev, [subjectId]: true }));
      }
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNote(id);
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, title: newTitle });
    setNotes(
      notes.map((n) =>
        n.id === selectedNote.id ? { ...n, title: newTitle } : n,
      ),
    );
    setSaving(true);
    await updateNote(selectedNote.id, newTitle, undefined);
    setSaving(false);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSummarize = async () => {
    if (!editor || !selectedNote || summarizing) return;
    const content = editor.getHTML();
    if (!content || content.trim() === "<p></p>") return;

    setSummarizing(true);
    try {
      const plainText = editor.getText();
      const res = await summarizeNote(plainText);
      if (res.success && res.summary) {
        editor.commands.insertContent(
          `<br><br><strong>🧠 AI Summary:</strong><br>${res.summary}`,
        );
      } else {
        console.error(res.error);
        alert(res.error || "Failed to summarize.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
      dragConstraints={{
        top: 0,
        left: 0,
        right: Math.max(0, window.innerWidth - 850),
        bottom: Math.max(0, window.innerHeight - 550),
      }}
      // @ts-expect-error dragHandle string works internally or we ignore it
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-24 left-24 w-full max-w-[850px] bg-[#111116]/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[75vh] max-h-[750px] min-h-[500px]"
    >
      {/* Title Bar */}
      <div className="title-bar h-12 bg-[#1a1a24]/60 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> ~/knowledge_base
        </div>
        <div className="flex justify-end pr-2 overflow-visible">
          <button
            onClick={handleSummarize}
            disabled={summarizing || !selectedNote}
            className="text-indigo-400 hover:text-indigo-300 transition-colors hidden sm:flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 px-2.5 py-1.5 rounded-md border border-indigo-500/20 pointer-events-auto disabled:opacity-50 whitespace-nowrap"
          >
            {summarizing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {summarizing ? "Summarizing..." : "Summarize"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Mac Finder-style Sidebar */}
        <div className="w-60 bg-black/20 border-r border-white/5 flex flex-col z-10 shrink-0 select-none">
          <div className="p-3">
            <h2 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-2 px-2">
              Folders
            </h2>

            {/* Subjects List */}
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {/* Uncategorized Notes Folder */}
              <div className="mb-2">
                <div
                  onClick={() => toggleSubject("uncategorized")}
                  className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    {expandedSubjects["uncategorized"] ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <Folder className="w-4 h-4 text-indigo-400/70" />
                    <span className="text-xs font-medium">Uncategorized</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNote(null);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                  >
                    <Plus className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Notes in Uncategorized */}
                {expandedSubjects["uncategorized"] && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5">
                    {notes
                      .filter((n) => !n.subjectId)
                      .map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className={`flex items-center justify-between group/note p-1.5 rounded-md cursor-pointer text-xs transition-colors ${selectedNote?.id === note.id ? "bg-indigo-500/20 text-indigo-200" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            <span className="truncate">
                              {note.title || "Untitled"}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNote(e, note.id)}
                            className="opacity-0 group-hover/note:opacity-100 text-slate-500 hover:text-red-400 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Dynamic Subject Folders */}
              {subjects.map((subject) => (
                <div key={subject.id}>
                  <div
                    onClick={() => toggleSubject(subject.id)}
                    className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {expandedSubjects[subject.id] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-medium truncate">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => handleDeleteSubject(e, subject.id)}
                        className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateNote(subject.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded text-slate-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Notes in Subject */}
                  {expandedSubjects[subject.id] && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5">
                      {notes.filter((n) => n.subjectId === subject.id)
                        .length === 0 && (
                        <div className="text-[10px] text-slate-600 pl-2 py-1 italic">
                          Empty folder
                        </div>
                      )}
                      {notes
                        .filter((n) => n.subjectId === subject.id)
                        .map((note) => (
                          <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`flex items-center justify-between group/note p-1.5 rounded-md cursor-pointer text-xs transition-colors ${selectedNote?.id === note.id ? "bg-indigo-500/20 text-indigo-200" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 opacity-60 shrink-0" />
                              <span className="truncate">
                                {note.title || "Untitled"}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteNote(e, note.id)}
                              className="opacity-0 group-hover/note:opacity-100 text-slate-500 hover:text-red-400 shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Subject Input */}
              {isCreatingSubject ? (
                <form
                  onSubmit={handleCreateSubject}
                  className="mt-2 flex items-center gap-2 pl-2"
                >
                  <div className="w-3.5 h-3.5 shrink-0" />{" "}
                  {/* Spacing spacer */}
                  <input
                    autoFocus
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onBlur={() => {
                      if (!newSubjectName.trim()) setIsCreatingSubject(false);
                    }}
                    placeholder="Subject Name..."
                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingSubject(true)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg border border-dashed border-white/10 text-slate-500 hover:text-indigo-400 hover:border-indigo-400/30 hover:bg-indigo-500/5 transition-colors text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> New Subject
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editor Area (Right Pane) */}
        <div className="flex-1 flex flex-col z-10 min-w-0 bg-[#15151a]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-indigo-500">
              <Loader2 className="w-6 h-6 animate-spin opacity-50" />
            </div>
          ) : selectedNote ? (
            <>
              {/* Editor Header */}
              <div className="px-8 py-6 pb-4 border-b border-white/5 flex flex-col gap-2">
                <input
                  type="text"
                  value={selectedNote.title ?? ""}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="w-full bg-transparent text-3xl font-extrabold text-white outline-none placeholder:text-slate-600 font-serif"
                  placeholder="Note Title..."
                />
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>Last edited {formatDate(selectedNote.updatedAt)}</span>
                  {saving && (
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving
                    </span>
                  )}
                </div>
              </div>

              {/* TipTap Editor */}
              <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                <EditorContent
                  editor={editor}
                  className="prose prose-invert prose-indigo prose-sm max-w-none 
                    [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:outline-none 
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-600 
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] 
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left 
                    [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
                />
              </div>
            </>
          ) : notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3"
            >
              <FileText className="w-10 h-10 stroke-[1.5px] opacity-50" />
              <p className="text-sm font-medium">
                You haven't created any notes yet.
              </p>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                  <BookOpen className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">
                  Select or create a note to begin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
