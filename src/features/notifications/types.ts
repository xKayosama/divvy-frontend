export interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  groupId?: string;
  billId?: string;
}
export interface InboxResponse {
  success: boolean;
  data: {
    notifications: InboxNotification[];
    unreadCount: number;
    pagination: { page: number; total: number; totalPages: number };
  };
}
