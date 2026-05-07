"use client";

import { useEffect, useState, type SyntheticEvent } from "react";

type WorkspaceMembersDialogProps = {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
};

type WorkspaceMember = {
  workspaceId: string;
  userId: string;
  email?: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  joinedAt: string;
};

export function WorkspaceMembersDialog({
  workspaceId,
  isOpen,
  onClose,
}: WorkspaceMembersDialogProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"EDITOR" | "VIEWER">(
    "EDITOR"
  );
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchMembers() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/workspaces/${workspaceId}/members`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load members");
        }

        setMembers(data.members ?? []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load members"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [isOpen, workspaceId]);

  async function handleAddMember(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    // simple validation
    if (newMemberEmail.trim() === "") {
      setAddMemberError("Email is required.");
      return;
    }

    try {
      setIsAddingMember(true);
      setAddMemberError(null);

      const res = await fetch(`/api/v1/workspaces/${workspaceId}/members`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMemberEmail.trim(),
          role: newMemberRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setAddMemberError(data.error ?? "Member already exists.");
        } else {
          setAddMemberError(data.error ?? "Failed to add member.");
        }
        return;
      }

      // success: append and reset
      setMembers((currentMembers) => [...currentMembers, data.member]);
      setNewMemberEmail("");
      setNewMemberRole("EDITOR");
      setShowAddForm(false);
      setAddMemberError(null);
    } catch (error) {
      setAddMemberError(
        error instanceof Error ? error.message : "Failed to add member"
      );
    } finally {
      setIsAddingMember(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Workspace Access
            </div>

            <h3 className="mt-3 text-lg font-semibold text-gray-950">
              Manage Members
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              View and manage users who can access this workspace.
            </p>

            <p className="mt-2 text-xs text-gray-500">Showing {members.length} member{members.length===1?"":"s"}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close members dialog"
          >
            ✕
          </button>
        </div>
        {/* Member list - scrollable */}
        <div className="mt-5 flex-1 min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing {members.length} member{members.length===1?"":"s"}</div>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                + Add member
              </button>
            )}
          </div>

          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 260px)' }}>
            {isLoading && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Loading members...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {!isLoading && !error && members.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                No members found.
              </div>
            )}

            {!isLoading && !error && members.slice().sort((a,b)=>{
              const order = { OWNER: 0, EDITOR: 1, VIEWER: 2 } as any;
              if(a.role !== b.role) return order[a.role] - order[b.role];
              return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
            }).map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {member.email ?? member.userId}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 truncate">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>

                <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: member.role === 'OWNER' ? 'rgba(16,185,129,0.12)' : member.role === 'EDITOR' ? 'rgba(56,189,248,0.08)' : 'rgba(107,114,128,0.08)',
                    color: member.role === 'VIEWER' ? '#374151' : member.role === 'EDITOR' ? '#0369A1' : '#065F46'
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / form - stable at bottom */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <form onSubmit={handleAddMember} className="rounded-xl bg-transparent">
            {showAddForm ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-900">Add member</p>
                  <p className="mt-0.5 text-xs text-gray-500">Enter the email of an AYD user to add them to this workspace.</p>
                </div>

                {addMemberError && (
                  <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {addMemberError}
                  </div>
                )}

                <div className="grid gap-3">
                  <input
                    value={newMemberEmail}
                    onChange={(event) => setNewMemberEmail(event.target.value)}
                    placeholder="Email"
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />

                  <select
                    value={newMemberRole}
                    onChange={(event) => setNewMemberRole(event.target.value as "EDITOR" | "VIEWER")}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // cancel and clear
                      setShowAddForm(false);
                      setNewMemberEmail("");
                      setNewMemberRole("EDITOR");
                      setAddMemberError(null);
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-950"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0E5B48] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0b4d3d] hover:shadow-md disabled:opacity-60"
                  >
                    {isAddingMember ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-950"
                >
                  Close
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}