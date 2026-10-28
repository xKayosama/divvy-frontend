import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Group } from './types';
import { getStoredGroup } from './lib/group-storage';
interface GroupState {
  selectedGroup: Group | null;
}
const initialState: GroupState = { selectedGroup: getStoredGroup() };
const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setSelectedGroup: (state, action: PayloadAction<Group>) => {
      state.selectedGroup = action.payload;
    },
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
  },
});
export const { setSelectedGroup, clearSelectedGroup } = groupSlice.actions;
export default groupSlice.reducer;
