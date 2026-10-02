import { db, AuditEventRecord } from '../../infra/database/client.js';

export class AuditService {
  static listLogs(): AuditEventRecord[] {
    return [...db.auditEvents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static record(data: Omit<AuditEventRecord, 'id' | 'createdAt'>): AuditEventRecord {
    return db.recordAuditEvent(data);
  }
}
