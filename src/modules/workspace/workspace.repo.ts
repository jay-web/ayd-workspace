import { db } from "@/lib/db/postgres";

export async function createWorkspaceWithMembership(params: {
  id: string;
  name: string;
  ownerUserId: string;
}) {
  const { id, name, ownerUserId } = params;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const workspaceResult = await client.query(
      `
      INSERT INTO workspaces (id, name, owner_user_id)
      VALUES ($1, $2, $3)
      RETURNING
        id AS "workspaceId",
        name,
        owner_user_id AS "ownerUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [id, name, ownerUserId]
    );

    const membershipResult = await client.query(
      `
      INSERT INTO workspace_memberships (workspace_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING
        workspace_id AS "workspaceId",
        user_id AS "userId",
        role,
        joined_at AS "joinedAt"
      `,
      [id, ownerUserId, "OWNER"]
    );

    await client.query("COMMIT");

    return {
      workspace: workspaceResult.rows[0],
      membership: membershipResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listWorkspacesForUser(userId: string) {
  const result = await db.query(
    `
    SELECT
      w.id AS "workspaceId",
      w.name,
      wm.role,
      wm.joined_at AS "joinedAt"
    FROM workspace_memberships wm
    JOIN workspaces w
      ON w.id = wm.workspace_id
    WHERE wm.user_id = $1
    ORDER BY wm.joined_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function getWorkspaceById(workspaceId: string) {
  const result = await db.query(
    `
    SELECT
      id AS "workspaceId",
      name,
      owner_user_id AS "ownerUserId",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM workspaces
    WHERE id = $1
    LIMIT 1
    `,
    [workspaceId]
  );

  return result.rows[0] ?? null;
}

export async function getWorkspaceForUser(params: {
  workspaceId: string;
  userId: string;
}) {
  const { workspaceId, userId } = params;

  const result = await db.query(
    `
    SELECT
      w.id AS "workspaceId",
      w.name,
      w.owner_user_id AS "ownerUserId",
      w.created_at AS "createdAt",
      w.updated_at AS "updatedAt",
      wm.role,
      wm.joined_at AS "joinedAt"
    FROM workspaces w
    JOIN workspace_memberships wm
      ON wm.workspace_id = w.id
    WHERE w.id = $1
      AND wm.user_id = $2
    LIMIT 1
    `,
    [workspaceId, userId]
  );

  return result.rows[0] ?? null;
}