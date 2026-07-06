export interface FamilyHdr {
  guid: string;
  groupGuid?: string;
  familyName: string;
  familyHeadGuid?: string;
  totalShares?: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdDate?: string;
  updatedDate?: string;
}

export interface FamilyContainer {
  families_hdr: FamilyHdr;
}

export interface Family {
  guid: string;
  groupGuid?: string;
  familyName: string;
  familyHeadGuid?: string;
  totalShares?: number;
  description?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateFamilyRequest {
  groupGuid?: string;
  familyName: string;
  familyHeadGuid?: string;
  description?: string;
}
