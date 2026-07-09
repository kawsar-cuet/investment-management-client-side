export interface FamilyHdr {
  guid: string;
  family_name?: string;
  familyName?: string;
  group_id?: string;
  groupId?: string;
  family_head_id?: string;
  familyHeadId?: string;
  total_shares?: number;
  totalShares?: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
  created_by_subject_guid?: string;
  updated_by_subject_guid?: string;
  created_date?: string;
  createdDate?: string;
  updated_date?: string;
  updatedDate?: string;
  revision?: string;
  property_json?: { [k: string]: any };
}

export interface FamilyContainer {
  families_hdr: FamilyHdr;
}

export interface Family {
  guid: string;
  familyName: string;
  groupId?: string;
  familyHeadId?: string;
  totalShares?: number;
  description?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateFamilyRequest {
  groupId?: string;
  familyName: string;
  description?: string;
}
