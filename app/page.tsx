import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
    const session = await getAuthSession();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700">
            {/* Navigation */}
            <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Query Mentor</h1>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/auth/login"
                            className="text-white hover:text-gray-200 px-4 py-2 rounded-lg transition"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/register"
                            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Clear Your Doubts,<br />Build Your Knowledge
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Connect with expert instructors, get your questions answered, and access a growing knowledge base of resolved doubts.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/auth/register"
                            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
                        >
                            Start Learning
                        </Link>
                        <Link
                            href="/auth/login"
                            className="bg-purple-500/20 backdrop-blur-md text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-500/30 transition border border-white/30"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-3xl">❓</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ask Doubts</h3>
                        <p className="text-white/80">
                            Post your questions with detailed descriptions and get expert answers from experienced instructors.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-3xl">💡</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Get Answers</h3>
                        <p className="text-white/80">
                            Receive clear, detailed explanations from qualified instructors who care about your learning.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-3xl">📚</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Knowledge Base</h3>
                        <p className="text-white/80">
                            Search through resolved doubts and learn from questions asked by other students.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}