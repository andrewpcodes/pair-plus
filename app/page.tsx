import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

async function AuthCheck() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/teams');
  }

  return null;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthCheck />
      </Suspense>
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <nav className="w-full border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pair+</h1>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Better Pair Programming
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Manage your development teams, track pair rotations, and collaborate more effectively.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto text-center"
              >
                Get Started
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto text-center"
              >
                Sign In
              </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 pt-16">
              <div className="space-y-2">
                <div className="text-4xl">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize your developers into teams and track membership easily.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rotation Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep track of pair rotations and ensure everyone collaborates.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View team statistics and improve your pairing practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
