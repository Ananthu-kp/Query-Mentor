"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface Doubt {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    author: {
        name: string;
        email: string;
    };
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

export default function InstructorDashboard() {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoubt, setSelectedDoubt] = useState<string | null>(null);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
    const [answerError, setAnswerError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        fetchDoubts();
    }, []);

    async function fetchDoubts() {
        setFetchLoading(true);
        try {
            const res = await fetch("/api/doubts");

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to fetch doubts");
            }

            const data = await res.json();
            setDoubts(data);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to fetch doubts"
            );
        } finally {
            setFetchLoading(false);
        }
    }

    function validateAnswer() {
        if (!answer.trim()) {
            setAnswerError("Answer cannot be empty");
            return false;
        }
        if (answer.trim().length < 10) {
            setAnswerError("Answer must be at least 10 characters");
            return false;
        }
        if (answer.trim().length > 2000) {
            setAnswerError("Answer must not exceed 2000 characters");
            return false;
        }
        setAnswerError("");
        return true;
    }

    async function getAISuggestion(doubt: Doubt) {
        setAiLoading(true);
        const loadingToast = toast.loading("AI is generating a suggestion...");

        try {
            const res = await fetch("/api/ai/suggest-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: doubt.title,
                    content: doubt.content,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to generate AI suggestion");
            }

            const data = await res.json();
            setAnswer(data.suggestion);
            toast.success("AI suggestion generated! You can edit it before submitting.", {
                id: loadingToast,
                duration: 4000,
            });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate AI suggestion",
                { id: loadingToast }
            );
        } finally {
            setAiLoading(false);
        }
    }

    async function handleAnswerSubmit(doubtId: string) {
        if (!validateAnswer()) {
            toast.error("Please provide a valid answer");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Submitting answer...");

        try {
            const res = await fetch(`/api/doubts/${doubtId}/answers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: answer.trim() }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to submit answer");
            }

            toast.success("Answer submitted successfully!", { id: loadingToast });
            setAnswer("");
            setAnswerError("");
            setSelectedDoubt(null);
            await fetchDoubts();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to submit answer",
                { id: loadingToast }
            );
        } finally {
            setLoading(false);
        }
    }

    async function markResolved(id: string) {
        const loadingToast = toast.loading("Marking as resolved...");

        try {
            const res = await fetch(`/api/doubts/${id}/resolve`, {
                method: "PATCH",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to mark as resolved");
            }

            toast.success("Doubt marked as resolved!", { id: loadingToast });
            await fetchDoubts();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to mark as resolved",
                { id: loadingToast }
            );
        }
    }

    async function searchDoubts() {
        if (!searchQuery.trim()) {
            fetchDoubts();
            return;
        }

        try {
            const res = await fetch(
                `/api/doubts/search?q=${encodeURIComponent(searchQuery)}&status=${filter}`
            );

            if (!res.ok) {
                throw new Error("Search failed");
            }

            const data = await res.json();
            setDoubts(data);
        } catch (error) {
            toast.error("Search failed. Please try again.");
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            searchDoubts();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, filter]);

    const filteredDoubts = doubts.filter((doubt) => {
        if (filter === "ALL") return true;
        return doubt.status === filter;
    });

    const stats = {
        total: doubts.length,
        open: doubts.filter((d) => d.status === "OPEN").length,
        resolved: doubts.filter((d) => d.status === "RESOLVED").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl">👨‍🏫</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Instructor Dashboard
                            </h1>
                            <p className="text-sm text-gray-600">Answer student doubts</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-linear-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-blue-100 text-sm font-medium">Total Doubts</p>
                            <span className="text-3xl">📊</span>
                        </div>
                        <p className="text-4xl font-bold">{stats.total}</p>
                    </div>

                    <div className="bg-linear-to-br from-yellow-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-yellow-100 text-sm font-medium">
                                Open Doubts
                            </p>
                            <span className="text-3xl">⏳</span>
                        </div>
                        <p className="text-4xl font-bold">{stats.open}</p>
                    </div>

                    <div className="bg-linear-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-green-100 text-sm font-medium">Resolved</p>
                            <span className="text-3xl">✅</span>
                        </div>
                        <p className="text-4xl font-bold">{stats.resolved}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        🔍 Search & Filter
                    </h2>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Search doubts by title or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter("ALL")}
                                className={`px-6 py-3 rounded-lg font-medium transition ${filter === "ALL"
                                        ? "bg-linear-to-r from-blue-600 to-purple-600 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("OPEN")}
                                className={`px-6 py-3 rounded-lg font-medium transition ${filter === "OPEN"
                                        ? "bg-linear-to-r from-yellow-500 to-orange-500 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                Open
                            </button>
                            <button
                                onClick={() => setFilter("RESOLVED")}
                                className={`px-6 py-3 rounded-lg font-medium transition ${filter === "RESOLVED"
                                        ? "bg-linear-to-r from-green-500 to-green-600 text-white"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>
                </div>

                {/* Doubts List */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {filter === "ALL"
                            ? "All Doubts"
                            : filter === "OPEN"
                                ? "Open Doubts"
                                : "Resolved Doubts"}
                    </h2>

                    {fetchLoading ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading doubts...</p>
                        </div>
                    ) : filteredDoubts.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
                            <div className="text-6xl mb-4">
                                {filter === "OPEN" ? "🎉" : "📭"}
                            </div>
                            <p className="text-gray-600 text-lg">
                                {filter === "OPEN"
                                    ? "Great! No open doubts at the moment."
                                    : "No doubts found."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDoubts.map((doubt) => (
                                <div
                                    key={doubt.id}
                                    className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {doubt.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center gap-1">
                                                    👤{" "}
                                                    <span className="font-medium">
                                                        {doubt.author.name}
                                                    </span>
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1">
                                                    📧 {doubt.author.email}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="flex items-center gap-1">
                                                    📅{" "}
                                                    {new Date(doubt.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${doubt.status === "RESOLVED"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {doubt.status === "RESOLVED" ? "✓ Resolved" : "⏳ Open"}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {doubt.content}
                                        </p>
                                    </div>

                                    {/* Existing Answers */}
                                    {doubt.answers.length > 0 && (
                                        <div className="border-t pt-4 mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                💬 Answers ({doubt.answers.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {doubt.answers.map((ans) => (
                                                    <div
                                                        key={ans.id}
                                                        className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                                                    >
                                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                            {ans.content}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            👨‍🏫 {ans.author.name} •{" "}
                                                            {new Date(ans.createdAt).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Answer Form */}
                                    {selectedDoubt === doubt.id ? (
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Write your answer
                                                </label>
                                                <button
                                                    onClick={() => getAISuggestion(doubt)}
                                                    disabled={aiLoading}
                                                    className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                >
                                                    {aiLoading ? (
                                                        <>
                                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>✨</span>
                                                            AI Suggest Answer
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <textarea
                                                value={answer}
                                                onChange={(e) => {
                                                    setAnswer(e.target.value);
                                                    setAnswerError("");
                                                }}
                                                placeholder="Provide a clear and helpful answer..."
                                                maxLength={2000}
                                                className={`w-full px-4 py-3 border rounded-lg h-40 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${answerError ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            />
                                            <div className="flex justify-between items-center mt-1 mb-3">
                                                {answerError ? (
                                                    <p className="text-red-500 text-sm">{answerError}</p>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">
                                                        Minimum 10 characters required
                                                    </p>
                                                )}
                                                <p className="text-gray-400 text-xs">
                                                    {answer.length}/2000
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAnswerSubmit(doubt.id)}
                                                    disabled={loading || aiLoading}
                                                    className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                            Submitting...
                                                        </span>
                                                    ) : (
                                                        "Submit Answer"
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDoubt(null);
                                                        setAnswer("");
                                                        setAnswerError("");
                                                    }}
                                                    disabled={loading || aiLoading}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 pt-4 border-t">
                                            <button
                                                onClick={() => setSelectedDoubt(doubt.id)}
                                                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
                                            >
                                                💬 Answer This Doubt
                                            </button>
                                            {doubt.status === "OPEN" && doubt.answers.length > 0 && (
                                                <button
                                                    onClick={() => markResolved(doubt.id)}
                                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                                >
                                                    ✓ Mark as Resolved
                                                </button>
                                            )}
                                        </div>
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