'use client';

import { useState } from "react";
import { addTeamMember } from "@/app/teams/[id]/actions";

interface TeamMemberFormProps {
  teamId: string;
  userId: string;
}

export default function TeamMemberForm({ teamId, userId }: TeamMemberFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const result = await addTeamMember(teamId, userId, name);

    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage('Team member added successfully!');
      setName('');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h3 className="font-semibold text-lg">Add Team Member</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="px-3 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add Member'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
