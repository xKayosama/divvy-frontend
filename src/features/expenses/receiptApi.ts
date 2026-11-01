import { api } from '@/services/api';
import type { ScannedReceipt } from './receipt-types';
export const receiptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    scanReceipt: builder.mutation<
      {
        success: boolean;
        data: {
          groupId: string;
          requiresReview: true;
          receipt: ScannedReceipt;
        };
      },
      { groupId: string; file: File }
    >({
      query: ({ groupId, file }) => {
        const body = new FormData();
        body.append('receipt', file);
        return {
          url: `/groups/${groupId}/receipts/scan`,
          method: 'POST',
          body,
          timeout: 75000,
        };
      },
    }),
  }),
});
export const { useScanReceiptMutation } = receiptApi;
