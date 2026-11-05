import { api } from '@/services/api';

interface AttachmentRecord {
  kind: 'bills' | 'expenses';
  id: string;
}

interface AttachmentResponse {
  data: {
    attachment: { name: string; size: number } | null;
    canManage: boolean;
  };
}

export function attachmentPath({ kind, id }: AttachmentRecord) {
  return `/${kind}/${encodeURIComponent(id)}/attachment`;
}

const attachmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecordAttachment: builder.query<AttachmentResponse, AttachmentRecord>({
      query: attachmentPath,
    }),
    updateRecordAttachment: builder.mutation<
      AttachmentResponse,
      AttachmentRecord & { file: File | null }
    >({
      query: ({ file, ...record }) => {
        const url = attachmentPath(record);
        if (!file) return { url, method: 'DELETE' };
        const body = new FormData();
        body.set('attachment', file);
        return { url, method: 'PUT', body };
      },
      async onQueryStarted({ kind, id }, { dispatch, queryFulfilled }) {
        const response = await queryFulfilled.catch(() => null);
        if (response) {
          dispatch(
            attachmentApi.util.updateQueryData(
              'getRecordAttachment',
              { kind, id },
              () => response.data,
            ),
          );
        }
      },
    }),
  }),
});

export const { useGetRecordAttachmentQuery, useUpdateRecordAttachmentMutation } =
  attachmentApi;
