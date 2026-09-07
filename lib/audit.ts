import { neon } from "@neondatabase/serverless";

export interface AuditLogInput {
  actorUserId?: string | null;
  actorName?: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function logAuditEvent(entry: AuditLogInput): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await sql`
      INSERT INTO audit_logs (
        id, actor_user_id, actor_name, action, entity, entity_id,
        old_data, new_data, ip_address, created_at
      ) VALUES (
        ${id},
        ${entry.actorUserId || null},
        ${entry.actorName || "System"},
        ${entry.action},
        ${entry.entity},
        ${entry.entityId},
        ${entry.oldData ? JSON.stringify(entry.oldData) : null},
        ${entry.newData ? JSON.stringify(entry.newData) : null},
        ${entry.ipAddress || null},
        NOW()
      );
    `;
  } catch (err) {
    console.error("Failed to write audit log entry:", err);
  }
}
