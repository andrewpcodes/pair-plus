'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface Team {
  id: string;
  name: string;
  user_id: string;
  membersCount?: number;
  lastPairDate?: string | null;
  rotation?: string | null;
}

interface TeamListProps {
  teams: Team[];
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function TeamList({ teams }: TeamListProps) {
  const router = useRouter();

  if (!teams || teams.length === 0) {
    return <p className="text-sm text-gray-500">No teams yet.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2 w-full">
      {teams.map((team) => (
        <button
          key={team.id}
          onClick={() => router.push(`/teams/${team.id}`)}
          className="text-left bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow rounded-xl p-8 border border-gray-200 dark:border-gray-700 flex flex-col gap-8 min-h-[16rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Open team ${team.name}`}
        >
          <div className="flex items-start justify-between gap-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight flex-1">{team.name}</h3>

            <span className="inline-flex items-center px-4 py-2 text-base font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 whitespace-nowrap flex-shrink-0">
              {typeof team.membersCount === 'number' ? `${team.membersCount}` : '0'} {team.membersCount === 1 ? 'member' : 'members'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-auto">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Last Pair</div>
              <div className="text-base font-medium text-gray-700 dark:text-gray-300">{formatDate(team.lastPairDate)}</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Rotation</div>
              <div className="text-base font-medium text-gray-700 dark:text-gray-300">{team.rotation ?? 'None'}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
