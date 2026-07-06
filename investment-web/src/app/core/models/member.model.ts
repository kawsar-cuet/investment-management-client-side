// Backend returns MemberContainer wrapped in ApiResponse { success, data: MemberContainer }
// MemberContainer has a nested `members_hdr` object and (often) a `members_dtl` array.

export interface MemberDtl {
  guid?: string;
  memberGuid?: string;
  fullName?: string;
  relationship?: string;
  status?: string;
}

export interface MemberHdr {
  guid: string;
  userGuid?: string;
  groupGuid?: string;
  familyGuid?: string;
  fullName: string;
  memberType?: 'FRIEND' | 'FAMILY';
  isFamilyHead?: boolean;
  shareCount?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdDate?: string;
  updatedDate?: string;
  members_dtl?: MemberDtl[];
}

export interface MemberContainer {
  members_hdr: MemberHdr;
}

export interface Member {
  guid: string;
  userGuid?: string;
  groupGuid?: string;
  familyGuid?: string;
  fullName: string;
  memberType?: 'FRIEND' | 'FAMILY';
  isFamilyHead?: boolean;
  shareCount?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateMemberRequest {
  userGuid?: string;
  groupGuid?: string;
  familyGuid?: string;
  fullName: string;
  memberType?: 'FRIEND' | 'FAMILY';
  isFamilyHead?: boolean;
  shareCount?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
}
