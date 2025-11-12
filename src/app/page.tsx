import Link from 'next/link';
import { JSX } from "react";

export default function Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-md flex items-center justify-center font-bold">
            P+
          </div>
          <span className="text-xl font-semibold">Pair+</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Pair+ — smarter pairings, better collaboration
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Randomly group users and improve teamwork. Fast setup, configurable groups, and seamless sign-in.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-6 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-md border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Log in
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold">Random Grouping</h3>
            <p className="mt-2 text-sm text-slate-600">Quickly split participants into random groups.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold">Configurable Sizes</h3>
            <p className="mt-2 text-sm text-slate-600">Control how many people are in each group.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold">Export & Share</h3>
            <p className="mt-2 text-sm text-slate-600">Download or share group lists with a click.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
