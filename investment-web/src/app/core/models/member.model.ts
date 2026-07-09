// Backend returns MemberContainer wrapped in ApiResponse { status: "success", data: MemberContainer }
// MemberContainer has a nested `members_hdr` object whose fields are snake_case on the wire
// (the Java POJO `members_hdr` exposes fields like user_id, full_name, phone_number, address,
// group_id, family_id, member_type, join_date, is_family_head, share_count, status,
// created_by_subject_guid, updated_by_subject_guid, created_date, updated_date, revision,
// property_json — Jackson serializes them verbatim as snake_case).
//
// We expose camelCase fields on Member for ergonomic use in templates and add snake_case
// aliases so the unwrap() can pick whichever the backend sends.

export interface MemberHdr {
  guid: string;
  user_id?: string;
  userId?: string;
  full_name?: string;
  fullName?: string;
  phone_number?: string;
  phoneNumber?: string;
  address?: string;
  group_id?: string;
  groupId?: string;
  family_id?: string;
  familyId?: string;
  member_type?: 'FAMILY' | 'FRIEND' | string;
  memberType?: 'FAMILY' | 'FRIEND' | string;
  join_date?: string;
  joinDate?: string;
  is_family_head?: boolean;
  isFamilyHead?: boolean;
  share_count?: number;
  shareCount?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
  created_by_subject_guid?: string;
  updated_by_subject_guid?: string;
  created_date?: string;
  createdDate?: string;
  updated_date?: string;
  updatedDate?: string;
  revision?: string;
  property_json?: { [k: string]: any };
  members_dtl?: MemberDtl[];
}

export interface MemberDtl {
  guid?: string;
  memberGuid?: string;
  fullName?: string;
  relationship?: string;
  status?: string;
}

export interface MemberContainer {
  members_hdr: MemberHdr;
}

export interface Member {
  guid: string;
  userId?: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  groupId?: string;
  familyId?: string;
  memberType?: 'FAMILY' | 'FRIEND' | string;
  joinDate?: string;
  isFamilyHead?: boolean;
  shareCount?: number;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateMemberRequest {
  userId?: string;
  groupId?: string;
  familyId: string;
  fullName: string;
  memberType?: 'FAMILY' | 'FRIEND';
  isFamilyHead?: boolean;
  shareCount?: number;
  joinDate?: string;
  phoneNumber?: string;
  address?: string;
}
