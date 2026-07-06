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
  familyId: string;
  depositedById: string;
  amountPerShare: number;
  depositMonth: number;
  depositYear: number;
  depositDate: string;       // YYYY-MM-DD
  createdBySubjectGuid: string;
}
