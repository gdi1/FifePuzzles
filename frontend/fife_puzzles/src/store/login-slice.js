import { createSlice } from "@reduxjs/toolkit";

const loginSlice = createSlice({
  name: "login",
  initialState: {
    user: undefined,
    isLoggedIn: undefined,
    token: undefined,
    isAnotherUser: undefined,
    banned: false,
    banSubject: undefined,
    banMessage: undefined,
    recentSearchedUsers: [],
    recentSearchedPuzzles: [],
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
    },

    setRecentSearchedUsers(state, action) {
      state.recentSearchedUsers = action.payload;
    },
    setRecentSearchedPuzzles(state, action) {
      state.recentSearchedPuzzles = action.payload;
    },
    setBanned(state, action) {
      state.banned = action.payload.banned;
      state.banSubject = action.payload.subject;
      state.banMessage = action.payload.message;
    },
    setIsAnotherUser(state, action) {
      state.isAnotherUser = action.payload;
    },
    setIsLoggedIn(state, action) {
      state.isLoggedIn = action.payload;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    updateMessages(state, action) {
      let firstSeen = state.user.messages.findIndex(
        (message) => message.seen === true
      );

      if (firstSeen === -1) firstSeen = state.user.messages.length;

      for (let i = 0; i < firstSeen; i++) {
        state.user.messages[i].seen = true;
      }
      state.user.numberOfNewMessages = 0;
    },
    addNewMessage(state, action) {
      const msgIndex = state.user.messages.findIndex(
        (msg) => msg.sentAt === action.payload.sentAt
      );
      if (msgIndex === -1) {
        state.user.messages.unshift(action.payload);
        state.user.numberOfNewMessages++;
      }
    },

    updateRole(state, action) {
      state.user.role = action.payload;
    },
  },
});

export const loginActions = loginSlice.actions;

export default loginSlice;
