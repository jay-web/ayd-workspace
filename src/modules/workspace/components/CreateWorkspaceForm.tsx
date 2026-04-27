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
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
    <div className="relative p-4">
        <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-16 h-36 w-36 rounded-full bg-emerald-50 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
       <div className="flex items-start gap-3 lg:w-[300px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700 shadow-sm ring-1 ring-emerald-100">
              +
            </div>

            <div>
              <h2 className="text-base font-semibold tracking-tight text-[#061226]">
                Create Workspace
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-slate-500">
                Create a new intelligent workspace to organize and collaborate
                on documents.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="workspaceName" className="sr-only">
                Workspace name
              </label>

              <input
                id="workspaceName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                disabled={creating}
                className="h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#061226] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <span className="text-base leading-none">+</span>
              {creating ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="relative mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </form>
  );
}