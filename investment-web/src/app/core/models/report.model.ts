/**
 * Family-wise summary report.
 *
 * Returned by GET /api/reports/family-summary. Mirrors the backend
 * `FamilyReportResponse` envelope.
 */
export interface FamilyReportMemberRow {
  memberId: string;
  fullName: string;
  memberType?: string;
  isFamilyHead?: boolean;
  shareCount?: number;
  depositCount: number;
  totalAmount: number | string;
}

export interface FamilyReportRow {
  familyId: string;
  familyName: string;
  groupId: string;
  groupName: string;
  totalShares?: number;
  memberCount: number;
  totalDepositCount: number;
  totalAmount: number | string;
  members: FamilyReportMemberRow[];
}

export interface FamilyReportResponse {
  /** Echoes the year filter that was applied (null = all years). */
  year: number | null;
  /** Echoes the familyId filter that was applied (null = all families). */
  familyIdFilter: string | null;
  rows: FamilyReportRow[];
  totalDepositCount: number;
  totalAmount: number | string;
}

export interface FamilyReportQuery {
  year?: number | null;
  familyId?: string | null;
  groupId?: string | null;
}
