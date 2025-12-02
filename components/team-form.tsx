'use client';

import { useState } from 'react';
import { addTeam } from "@/app/teams/actions";

interface TeamFormProps {
  onSuccess?: () => void;
}


export default function TeamForm({ onSuccess }: TeamFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await addTeam(name);

    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage('Team created successfully!');
      setName('');
    }

    onSuccess?.();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <input
        type="text"
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="px-4 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Team'}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
