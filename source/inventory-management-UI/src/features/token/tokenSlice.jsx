import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token"),
};

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    updateToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export default tokenSlice.reducer;
export const { updateToken } = tokenSlice.actions;
