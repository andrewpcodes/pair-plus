'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  renamePair,
  deletePair,
  reorderPairs,
  moveMemberToPair,
  addPair,
} from '@/app/teams/[id]/actions';
import { GripVertical, Pencil, Check, X, Trash2, Plus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
}

interface PairData {
  id: string;
  name: string;
  sort_order: number;
  members: TeamMember[];
}

interface PairsGridProps {
  teamId: string;
  initialPairs: PairData[];
  unassignedMembers: TeamMember[];
}

type DragItem =
  | { type: 'pair'; pairId: string }
  | { type: 'member'; memberId: string; fromPairId: string | null };

function MemberChip({
  member,
  draggable: isDraggable,
  onDragStart,
}: {
  member: TeamMember;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const initial = member.name.charAt(0).toUpperCase();
  return (
    <div
      draggable={isDraggable}
      onDragStart={
        isDraggable
          ? (e) => {
              e.stopPropagation();
              onDragStart?.(e);
            }
          : undefined
      }
      className={`flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs select-none transition-colors ${
        isDraggable ? 'cursor-grab hover:bg-gray-100 dark:hover:bg-gray-700 active:cursor-grabbing' : ''
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {initial}
      </span>
      <span className="text-gray-800 dark:text-gray-200">{member.name}</span>
    </div>
  );
}

export function PairsGrid({
  teamId,
  initialPairs,
  unassignedMembers: initialUnassigned,
}: PairsGridProps) {
  const [pairs, setPairs] = useState<PairData[]>(initialPairs);
  const [unassigned, setUnassigned] = useState<TeamMember[]>(initialUnassigned);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverUnassigned, setDragOverUnassigned] = useState(false);
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<DragItem | null>(null);

  // Sync with server data after refreshes (e.g. after rotation)
  useEffect(() => {
    setPairs(initialPairs);
  }, [initialPairs]);

  useEffect(() => {
    setUnassigned(initialUnassigned);
  }, [initialUnassigned]);

  useEffect(() => {
    if (editingPairId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingPairId]);

  const handlePairDragStart = useCallback((e: React.DragEvent, pairId: string) => {
    dragItem.current = { type: 'pair', pairId };
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(id);
    setDragOverUnassigned(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragItem.current = null;
    setDragOverId(null);
    setDragOverUnassigned(false);
  }, []);

  const handleDropOnPair = useCallback(
    (e: React.DragEvent, targetPairId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverId(null);

      const item = dragItem.current;
      if (!item) return;

      if (item.type === 'pair') {
        const { pairId: sourcePairId } = item;
        if (sourcePairId === targetPairId) return;

        setPairs((prev) => {
          const next = [...prev];
          const srcIdx = next.findIndex((p) => p.id === sourcePairId);
          const tgtIdx = next.findIndex((p) => p.id === targetPairId);
          if (srcIdx === -1 || tgtIdx === -1) return prev;
          const [removed] = next.splice(srcIdx, 1);
          next.splice(tgtIdx, 0, removed);
          const updated = next.map((p, i) => ({ ...p, sort_order: i }));
          reorderPairs(teamId, updated.map((p) => p.id));
          return updated;
        });
      } else if (item.type === 'member') {
        const { memberId, fromPairId } = item;
        if (fromPairId === targetPairId) return;

        let member: TeamMember | undefined;
        if (fromPairId === null) {
          member = unassigned.find((m) => m.id === memberId);
        } else {
          member = pairs
            .find((p) => p.id === fromPairId)
            ?.members.find((m) => m.id === memberId);
        }
        if (!member) return;

        const memberSnapshot = member;
        setPairs((prev) =>
          prev.map((pair) => {
            if (pair.id === fromPairId) {
              return { ...pair, members: pair.members.filter((m) => m.id !== memberId) };
            }
            if (pair.id === targetPairId) {
              return { ...pair, members: [...pair.members, memberSnapshot] };
            }
            return pair;
          })
        );

        if (fromPairId === null) {
          setUnassigned((prev) => prev.filter((m) => m.id !== memberId));
        }

        moveMemberToPair(memberId, fromPairId, targetPairId);
      }

      dragItem.current = null;
    },
    [pairs, unassigned, teamId]
  );

  const handleDropOnUnassigned = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverUnassigned(false);

      const item = dragItem.current;
      if (!item || item.type !== 'member') return;

      const { memberId, fromPairId } = item;
      if (fromPairId === null) return;

      const member = pairs
        .find((p) => p.id === fromPairId)
        ?.members.find((m) => m.id === memberId);
      if (!member) return;

      const memberSnapshot = member;
      setPairs((prev) =>
        prev.map((pair) =>
          pair.id === fromPairId
            ? { ...pair, members: pair.members.filter((m) => m.id !== memberId) }
            : pair
        )
      );
      setUnassigned((prev) => [...prev, memberSnapshot]);
      moveMemberToPair(memberId, fromPairId, null);
      dragItem.current = null;
    },
    [pairs]
  );

  const handleStartEdit = useCallback((pair: PairData) => {
    setEditingPairId(pair.id);
    setEditName(pair.name);
  }, []);

  const handleSaveEdit = useCallback(
    async (pairId: string) => {
      const trimmed = editName.trim();
      if (!trimmed) {
        setEditingPairId(null);
        return;
      }
      setPairs((prev) =>
        prev.map((p) => (p.id === pairId ? { ...p, name: trimmed } : p))
      );
      setEditingPairId(null);
      await renamePair(pairId, trimmed);
    },
    [editName]
  );

  const handleDeletePair = useCallback(
    async (pairId: string) => {
      const pair = pairs.find((p) => p.id === pairId);
      if (!pair) return;
      setUnassigned((prev) => [...prev, ...pair.members]);
      setPairs((prev) => prev.filter((p) => p.id !== pairId));
      await deletePair(pairId, teamId);
    },
    [pairs, teamId]
  );

  const handleAddPair = useCallback(async () => {
    const result = await addPair(teamId);
    if (result.data) {
      setPairs((prev) => [...prev, { ...result.data!, members: [] }]);
    }
  }, [teamId]);

  const isEmpty = pairs.length === 0 && unassigned.length === 0;

  return (
    <div className="space-y-5">
      {/* Unassigned members pool */}
      {unassigned.length > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverUnassigned(true);
            setDragOverId(null);
          }}
          onDragLeave={() => setDragOverUnassigned(false)}
          onDrop={handleDropOnUnassigned}
          className={`rounded-xl border-2 border-dashed p-4 transition-all ${
            dragOverUnassigned
              ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Unassigned ({unassigned.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((member) => (
              <MemberChip
                key={member.id}
                member={member}
                draggable
                onDragStart={() =>
                  (dragItem.current = { type: 'member', memberId: member.id, fromPairId: null })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No pairs yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add team members and click <strong>Rotate Now</strong> to create groups
          </p>
        </div>
      )}

      {/* Pairs grid */}
      {(pairs.length > 0 || !isEmpty) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pairs.map((pair) => (
            <div
              key={pair.id}
              draggable
              onDragStart={(e) => handlePairDragStart(e, pair.id)}
              onDragOver={(e) => handleDragOver(e, pair.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleDropOnPair(e, pair.id)}
              onDragEnd={handleDragEnd}
              className={`group relative flex flex-col bg-white dark:bg-gray-900 rounded-xl p-5 gap-4 min-h-[160px] transition-all duration-150 cursor-grab active:cursor-grabbing border-2 ${
                dragOverId === pair.id
                  ? 'border-blue-400 dark:border-blue-500 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/40'
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />

                {editingPairId === pair.id ? (
                  <div
                    className="flex items-center gap-1 flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(pair.id);
                        if (e.key === 'Escape') setEditingPairId(null);
                      }}
                      className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b-2 border-blue-400 focus:outline-none text-gray-900 dark:text-gray-100 py-0.5"
                    />
                    <button
                      onClick={() => handleSaveEdit(pair.id)}
                      className="p-1 text-green-600 hover:text-green-700 rounded"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingPairId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
                      {pair.name}
                    </h3>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(pair);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Rename pair"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePair(pair.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete pair"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Members */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {pair.members.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic self-start">
                    Drop members here
                  </p>
                ) : (
                  pair.members.map((member) => (
                    <MemberChip
                      key={member.id}
                      member={member}
                      draggable
                      onDragStart={() =>
                        (dragItem.current = {
                          type: 'member',
                          memberId: member.id,
                          fromPairId: pair.id,
                        })
                      }
                    />
                  ))
                )}
              </div>

              {/* Member count */}
            </div>
          ))}

          {/* Add pair button */}
          <button
            onClick={handleAddPair}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 gap-2 min-h-[160px] hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add Pair</span>
          </button>
        </div>
      )}
    </div>
  );
}
