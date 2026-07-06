// Backend returns FriendGroupContainer with nested friend_groups_hdr
export interface FriendGroupHdr {
  guid: string;
  groupName: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdDate?: string;
  updatedDate?: string;
}

export interface FriendGroupContainer {
  friend_groups_hdr: FriendGroupHdr;
}

export interface FriendGroup {
  guid: string;
  groupName: string;
  description?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateFriendGroupRequest {
  groupName: string;
  description?: string;
}
