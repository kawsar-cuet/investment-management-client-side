export interface DepositHdr {
  guid: string;
  memberGuid?: string;
  familyGuid?: string;
  depositedByGuid?: string;
  amount: number | string; // BigDecimal arrives as number or string from Jackson
  sharesCovered?: number;
  depositMonth?: number;
  depositYear?: number;
  depositDate?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdDate?: string;
  updatedDate?: string;
}

export interface DepositContainer {
  deposits_hdr: DepositHdr;
}

export interface Deposit {
  guid: string;
  memberGuid?: string;
  familyGuid?: string;
  depositedByGuid?: string;
  amount: number | string;
  sharesCovered?: number;
  depositMonth?: number;
  depositYear?: number;
  depositDate?: string;
  notes?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
  /**
   * Backend revision UUID. Required for PUT /api/deposits/{guid}.
   * Populated by getById(); search-result rows do not include it.
   */
  revision?: string;
}

export interface CreateDepositRequest {
  memberGuid?: string;
  familyGuid?: string;
  depositedByGuid?: string;
  amount: number | string;
  sharesCovered?: number;
  depositMonth?: number;
  depositYear?: number;
  depositDate?: string;
  notes?: string;
}

export interface FamilyBulkDepositRequest {
  groupId?: string;
  familyId: string;
  depositedById: string;
  totalAmount: number;
  depositMonth: number;
  depositYear: number;
  depositDate: string;       // YYYY-MM-DD
  notes?: string;
  createdBySubjectGuid?: string;
}

export interface FamilyBulkDepositPreviewRow {
  memberId: string;
  fullName: string;
  shareCount: number;
  isFamilyHead: boolean;
  amount: number;
}

export interface FamilyBulkDepositPreview {
  familyId: string;
  totalAmount: number;
  sumOfShares: number;
  perShare: number;
  rows: FamilyBulkDepositPreviewRow[];
}

/**
 * Flat row returned by GET /api/deposits/search.
 * Member and family names are denormalized on the server so the UI can
 * render directly without an extra round-trip per row.
 */
export interface DepositSearchResult {
  guid: string;
  memberId: string;
  memberName: string;
  familyId: string;
  familyName: string;
  depositedById: string;
  depositedByName: string;
  amount: number | string;
  sharesCovered?: number;
  depositMonth?: number;
  depositYear?: number;
  depositDate?: string;
  notes?: string;
  status?: string;
}

export interface DepositSearchQuery {
  keyword?: string;
  memberId?: string;
  familyId?: string;
  month?: number;
  year?: number;
  status?: string;
}
