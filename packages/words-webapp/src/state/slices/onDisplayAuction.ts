import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnDisplayAuctionState {
  lastAuctionWordId: number | undefined;
  onDisplayAuctionWordId: number | undefined;
}

const initialState: OnDisplayAuctionState = {
  lastAuctionWordId: undefined,
  onDisplayAuctionWordId: undefined,
};

const onDisplayAuction = createSlice({
  name: 'onDisplayAuction',
  initialState: initialState,
  reducers: {
    setLastAuctionWordId: (state, action: PayloadAction<number>) => {
      state.lastAuctionWordId = action.payload;
    },
    setOnDisplayAuctionWordId: (state, action: PayloadAction<number>) => {
      state.onDisplayAuctionWordId = action.payload;
    },
    setPrevOnDisplayAuctionWordId: state => {
      if (!state.onDisplayAuctionWordId) return;
      if (state.onDisplayAuctionWordId === 0) return;
      state.onDisplayAuctionWordId = state.onDisplayAuctionWordId - 1;
    },
    setNextOnDisplayAuctionWordId: state => {
      if (state.onDisplayAuctionWordId === undefined) return;
      if (state.lastAuctionWordId === state.onDisplayAuctionWordId) return;
      state.onDisplayAuctionWordId = state.onDisplayAuctionWordId + 1;
    },
  },
});

export const {
  setLastAuctionWordId,
  setOnDisplayAuctionWordId,
  setPrevOnDisplayAuctionWordId,
  setNextOnDisplayAuctionWordId,
} = onDisplayAuction.actions;

export default onDisplayAuction.reducer;
