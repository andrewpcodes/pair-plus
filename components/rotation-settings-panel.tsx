'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { rotatePairsAction, updateRotationSettings } from '@/app/teams/[id]/actions';
import { Button } from './ui/button';
import { RefreshCw, Settings2, Clock } from 'lucide-react';

type ScheduleOption = 'manual' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface RotationSettingsData {
  schedule: ScheduleOption;
  group_size: number;
  last_rotated_at: string | null;
  next_rotation_at: string | null;
  enabled: boolean;
}

interface RotationSettingsPanelProps {
  teamId: string;
  initialSettings: RotationSettingsData;
}

const SCHEDULE_LABELS: Record<ScheduleOption, string> = {
  manual: 'Manual only',
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
};

function formatDate(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function RotationSettingsPanel({
  teamId,
  initialSettings,
}: RotationSettingsPanelProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<RotationSettingsData>(initialSettings);
  const [isRotating, setIsRotating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const handleRotate = async () => {
    setIsRotating(true);
    setRotateError(null);
    try {
      const result = await rotatePairsAction(teamId, settings.group_size);
      if ('error' in result && result.error) {
        setRotateError(result.error);
      } else {
        setSettings((prev) => ({ ...prev, last_rotated_at: new Date().toISOString() }));
        router.refresh();
      }
    } finally {
      setIsRotating(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateRotationSettings(teamId, settings);
      setShowSettings(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Rotation</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${
              showSettings
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Rotation settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <Button
            size="sm"
            onClick={handleRotate}
            disabled={isRotating}
            className="text-xs h-8"
          >
            {isRotating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                Rotating…
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Rotate Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {rotateError && (
        <div className="px-5 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/40">
          <p className="text-xs text-red-600 dark:text-red-400">{rotateError}</p>
        </div>
      )}

      {/* Info row */}
      <div className="grid grid-cols-2 gap-4 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Last rotated
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatDate(settings.last_rotated_at)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Schedule
          </p>
          <div className="flex items-center gap-1.5">
            {settings.enabled && settings.schedule !== 'manual' && (
              <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
            )}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {SCHEDULE_LABELS[settings.schedule] ?? settings.schedule}
            </p>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {/* Group size */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
              Group size
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, group_size: Math.max(1, s.group_size - 1) }))
                }
                disabled={settings.group_size <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-gray-100">
                {settings.group_size}
              </span>
              <button
                onClick={() =>
                  setSettings((s) => ({ ...s, group_size: Math.min(10, s.group_size + 1) }))
                }
                disabled={settings.group_size >= 10}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2">
              Auto-rotate schedule
            </label>
            <select
              value={settings.schedule}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  schedule: e.target.value as ScheduleOption,
                  enabled: e.target.value === 'manual' ? false : s.enabled,
                }))
              }
              className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            >
              {(Object.entries(SCHEDULE_LABELS) as [ScheduleOption, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Enable auto-rotate toggle */}
          {settings.schedule !== 'manual' && (
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Enable auto-rotate
              </label>
              <button
                onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
                role="switch"
                aria-checked={settings.enabled}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  settings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <Button
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full text-xs h-8"
          >
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      )}
    </div>
  );
}
