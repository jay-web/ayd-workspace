"use client";

import { useState } from "react";

type CreateWorkspaceFormProps = {
  onCreate: (name: string) => Promise<void>;
  creating: boolean;
  error: string | null;
};

export function CreateWorkspaceForm({
  onCreate,
  creating,
  error,
}: CreateWorkspaceFormProps) {
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    await onCreate(trimmedName);
    setName("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Workspace name
          </label>

          <input
            id="workspaceName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            disabled={creating}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Workspace"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}