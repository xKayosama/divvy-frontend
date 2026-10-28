import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { storeToken, removeStoredToken } from '@/services/session';
import { logout, setCredentials } from '@/features/auth/authSlice';
import {
  setSelectedGroup,
  clearSelectedGroup,
} from '@/features/groups/groupSlice';
import {
  storeGroup,
  removeStoredGroup,
} from '@/features/groups/lib/group-storage';
export const appListeners = createListenerMiddleware();
appListeners.startListening({
  matcher: isAnyOf(logout, setCredentials),
  effect: (action, listener) => {
    if (setCredentials.match(action)) storeToken(action.payload.token);
    else removeStoredToken();
    listener.dispatch(clearSelectedGroup());
    listener.dispatch(api.util.resetApiState());
  },
});
appListeners.startListening({
  matcher: isAnyOf(setSelectedGroup, clearSelectedGroup),
  effect: (action) => {
    if (setSelectedGroup.match(action)) storeGroup(action.payload);
    else removeStoredGroup();
  },
});
