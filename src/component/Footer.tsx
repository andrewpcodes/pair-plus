import Link from 'next/link';
import { JSX } from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-slate-500">
        <span>© {new Date().getFullYear()} Pair+. All rights reserved.</span>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
