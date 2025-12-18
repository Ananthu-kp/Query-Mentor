"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Doubt {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    answers: Answer[];
}

interface Answer {
    id: string;
    content: string;
    createdAt: string;
    author: {
        name: string;
    };
}

export default function StudentDashboard() {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingDoubt, setEditingDoubt] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [errors, setErrors] = useState({ title: "", content: "" });

    useEffect(() => {
        fetchDoubts();
    }, []);

    async function fetchDoubts() {
        try {
            const res = await fetch("/api/doubts");
            const data = await res.json();
            setDoubts(data);
        } catch (error) {
            toast.error("Failed to fetch doubts");
        }
    }

    function validateForm() {
        const newErrors = { title: "", content: "" };
        let isValid = true;

        if (!title.trim()) {
            newErrors.title = "Title is required";
            isValid = false;
        } else if (title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters";
            isValid = false;
        }

        if (!content.trim()) {
            newErrors.content = "Content is required";
            isValid = false;
        } else if (content.trim().length < 10) {
            newErrors.content = "Content must be at least 10 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Submitting your doubt...");

        try {
            const res = await fetch("/api/doubts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), content: content.trim() }),
            });

            if (!res.ok) throw new Error();

            toast.success("Doubt submitted successfully!", { id: loadingToast });
            setTitle("");
            setContent("");
            setErrors({ title: "", content: "" });
            fetchDoubts();
        } catch (error) {
            toast.error("Failed to submit doubt", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    }

    async function handleEdit(doubtId: string) {
        if (!editTitle.trim() || !editContent.trim()) {
            toast.error("Title and content cannot be empty");
            return;
        }

        if (editTitle.trim().length < 5) {
            toast.error("Title must be at least 5 characters");
            return;
        }

        if (editContent.trim().length < 10) {
            toast.error("Content must be at least 10 characters");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Updating doubt...");

        try {
            const res = await fetch(`/api/doubts/${doubtId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
            });

            if (!res.ok) throw new Error();

            toast.success("Doubt updated successfully!", { id: loadingToast });
            setEditingDoubt(null);
            setEditTitle("");
            setEditContent("");
            fetchDoubts();
        } catch (error) {
            toast.error("Failed to update doubt", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(doubtId: string) {
        if (!confirm("Are you sure you want to delete this doubt?")) return;

        const loadingToast = toast.loading("Deleting doubt...");

        try {
            const res = await fetch(`/api/doubts/${doubtId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error();

            toast.success("Doubt deleted successfully!", { id: loadingToast });
            fetchDoubts();
        } catch (error) {
            toast.error("Failed to delete doubt", { id: loadingToast });
        }
    }

    async function markResolved(id: string) {
        const loadingToast = toast.loading("Marking as resolved...");

        try {
            const res = await fetch(`/api/doubts/${id}/resolve`, { method: "PATCH" });
            if (!res.ok) throw new Error();

            toast.success("Doubt marked as resolved!", { id: loadingToast });
            fetchDoubts();
        } catch (error) {
            toast.error("Failed to mark as resolved", { id: loadingToast });
        }
    }

    async function searchDoubts() {
        if (!searchQuery.trim()) {
            fetchDoubts();
            return;
        }

        try {
            const res = await fetch(
                `/api/doubts/search?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}`
            );
            const data = await res.json();
            setDoubts(data);
        } catch (error) {
            toast.error("Search failed");
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            searchDoubts();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter]);

    function startEdit(doubt: Doubt) {
        setEditingDoubt(doubt.id);
        setEditTitle(doubt.title);
        setEditContent(doubt.content);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎓</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                            <p className="text-sm text-gray-600">Ask your doubts</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Ask Doubt Form */}
                <div className="bg-white p-8 rounded-xl shadow-sm border mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ Ask a New Doubt</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                placeholder="Brief summary of your doubt"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors({ ...errors, title: "" });
                                }}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${errors.title ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Describe your doubt in detail..."
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    setErrors({ ...errors, content: "" });
                                }}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-32 resize-none ${errors.content ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Submit Doubt"}
                        </button>
                    </form>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Search Doubts</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by title or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        >
                            <option value="ALL">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>
                </div>

                {/* My Doubts */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 My Doubts</h2>
                    {doubts.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-600 text-lg">No doubts found.</p>
                            <p className="text-gray-500">Ask your first doubt above!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {doubts.map((doubt) => (
                                <div key={doubt.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                                    {editingDoubt === doubt.id ? (
                                        // Edit Mode
                                        <div>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 font-semibold focus:ring-2 focus:ring-purple-500"
                                            />
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 h-32 resize-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(doubt.id)}
                                                    disabled={loading}
                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                                >
                                                    {loading ? "Saving..." : "Save Changes"}
                                                </button>
                                                <button
                                                    onClick={() => setEditingDoubt(null)}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-gray-900">{doubt.title}</h3>
                                                <div className="flex gap-2 items-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${doubt.status === "RESOLVED"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {doubt.status === "RESOLVED" ? "✓ Resolved" : "⏳ Open"}
                                                    </span>
                                                    {doubt.status === "OPEN" && (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(doubt)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(doubt.id)}
                                                                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-4 leading-relaxed">{doubt.content}</p>
                                            <p className="text-sm text-gray-500">
                                                📅 Asked on {new Date(doubt.createdAt).toLocaleDateString()}
                                            </p>

                                            {/* Answers */}
                                            {doubt.answers.length > 0 && (
                                                <div className="border-t mt-6 pt-6">
                                                    <h4 className="font-semibold text-gray-900 mb-4">
                                                        💬 Answers ({doubt.answers.length})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {doubt.answers.map((answer) => (
                                                            <div
                                                                key={answer.id}
                                                                className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                                                            >
                                                                <p className="text-gray-800 leading-relaxed">{answer.content}</p>
                                                                <p className="text-sm text-gray-600 mt-2">
                                                                    👨‍🏫 {answer.author.name} •{" "}
                                                                    {new Date(answer.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {doubt.status === "OPEN" && doubt.answers.length > 0 && (
                                                <button
                                                    onClick={() => markResolved(doubt.id)}
                                                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                                >
                                                    ✓ Mark as Resolved
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}