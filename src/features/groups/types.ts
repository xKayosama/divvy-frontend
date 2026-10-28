export interface Group {
  id: string;
  name: string;
  currency: string;
  role: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  joinedAt: string;
}
export interface GroupsResponse {
  success: boolean;
  data: { groups: Group[] };
}
