"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

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
  const [allDoubts, setAllDoubts] = useState<Doubt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingDoubt, setEditingDoubt] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [errors, setErrors] = useState({ title: "", content: "" });

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
      setAllDoubts(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch doubts");
    } finally {
      setFetchLoading(false);
    }
  }

  // Real-time search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDoubts(allDoubts);
      return;
    }

    const filtered = allDoubts.filter(
      (doubt) =>
        doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doubt.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDoubts(filtered);
  }, [searchQuery, allDoubts]);

  function validateForm() {
    const newErrors = { title: "", content: "" };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
      isValid = false;
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    } else if (content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters";
      isValid = false;
    } else if (content.trim().length > 1000) {
      newErrors.content = "Content must not exceed 1000 characters";
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit doubt");
      }

      toast.success("Doubt submitted successfully!", { id: loadingToast });
      setTitle("");
      setContent("");
      setErrors({ title: "", content: "" });
      await fetchDoubts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit doubt",
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  }

  function validateEdit() {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content cannot be empty");
      return false;
    }

    if (editTitle.trim().length < 5) {
      toast.error("Title must be at least 5 characters");
      return false;
    }

    if (editTitle.trim().length > 100) {
      toast.error("Title must not exceed 100 characters");
      return false;
    }

    if (editContent.trim().length < 10) {
      toast.error("Content must be at least 10 characters");
      return false;
    }

    if (editContent.trim().length > 1000) {
      toast.error("Content must not exceed 1000 characters");
      return false;
    }

    return true;
  }

  async function handleEdit(doubtId: string) {
    if (!validateEdit()) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating doubt...");

    try {
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update doubt");
      }

      toast.success("Doubt updated successfully!", { id: loadingToast });
      setEditingDoubt(null);
      setEditTitle("");
      setEditContent("");
      await fetchDoubts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update doubt",
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(doubtId: string, doubtTitle: string) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${doubtTitle}"? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const loadingToast = toast.loading("Deleting doubt...");

    try {
      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete doubt");
      }

      toast.success("Doubt deleted successfully!", { id: loadingToast });
      
      Swal.fire({
        title: "Deleted!",
        text: "Your doubt has been deleted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchDoubts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete doubt",
        { id: loadingToast }
      );
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
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="text-sm text-gray-600">Ask your doubts</p>
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
        {/* Ask Doubt Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ❓ Ask a New Doubt
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Brief summary of your doubt"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: "" });
                }}
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title ? (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Minimum 5 characters required
                  </p>
                )}
                <p className="text-gray-400 text-xs">{title.length}/100</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your doubt in detail..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors({ ...errors, content: "" });
                }}
                maxLength={1000}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-32 resize-none ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content ? (
                  <p className="text-red-500 text-sm">{errors.content}</p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Minimum 10 characters required
                  </p>
                )}
                <p className="text-gray-400 text-xs">{content.length}/1000</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Doubt"
              )}
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Search My Doubts
          </h2>
          <input
            type="text"
            placeholder="Start typing to search by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Found {doubts.length} result{doubts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* My Doubts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📝 My Doubts
          </h2>

          {fetchLoading ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your doubts...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
              <div className="text-6xl mb-4">
                {searchQuery ? "🔍" : "📭"}
              </div>
              <p className="text-gray-600 text-lg">
                {searchQuery ? "No doubts match your search." : "No doubts found."}
              </p>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try different keywords."
                  : "Ask your first doubt above!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
                >
                  {editingDoubt === doubt.id ? (
                    // Edit Mode
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 font-semibold focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-gray-400 text-xs mb-3 text-right">
                        {editTitle.length}/100
                      </p>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        maxLength={1000}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 h-32 resize-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-gray-400 text-xs mb-3 text-right">
                        {editContent.length}/1000
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(doubt.id)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                              Saving...
                            </span>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDoubt(null);
                            setEditTitle("");
                            setEditContent("");
                          }}
                          disabled={loading}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {doubt.title}
                        </h3>
                        <div className="flex gap-2 items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                              doubt.status === "RESOLVED"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {doubt.status === "RESOLVED"
                              ? "✓ Resolved"
                              : "⏳ Open"}
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
                                onClick={() =>
                                  handleDelete(doubt.id, doubt.title)
                                }
                                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                        {doubt.content}
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 Asked on{" "}
                        {new Date(doubt.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                  {answer.content}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                  👨‍🏫 {answer.author.name} •{" "}
                                  {new Date(answer.createdAt).toLocaleDateString(
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