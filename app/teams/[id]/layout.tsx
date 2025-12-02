import Link from "next/link";

export default function TeamLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/teams"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Teams
      </Link>
      {children}
    </div>
  );
}
