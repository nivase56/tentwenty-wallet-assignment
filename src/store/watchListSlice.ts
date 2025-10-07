import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Token {
  id: number;
  coingeckoId: string;
  holdings: number;
}

interface WatchlistState {
  tokens: Token[];
  nextId: number;
}

const initialState: WatchlistState = {
  tokens: [
    { id: 1, coingeckoId: "bitcoin", holdings: 1.5 },
    { id: 2, coingeckoId: "ethereum", holdings: 1.5 },
    { id: 3, coingeckoId: "solana", holdings: 1.5 },
    { id: 4, coingeckoId: "dogecoin", holdings: 1.5 },
    { id: 5, coingeckoId: "usd-coin", holdings: 1.5 },
    { id: 6, coingeckoId: "stellar", holdings: 1.5 },
  ],
  nextId: 7,
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    addToken: (
      state,
      action: PayloadAction<{ coingeckoId: string; holdings: number }>
    ) => {
      const { coingeckoId, holdings } = action.payload;
      state.tokens.push({
        id: state.nextId,
        coingeckoId,
        holdings,
      });
      state.nextId += 1;
    },
    addTokens: (
      state,
      action: PayloadAction<{ coingeckoId: string; holdings: number }[]>
    ) => {
      action.payload.forEach(({ coingeckoId, holdings }) => {
        state.tokens.push({
          id: state.nextId,
          coingeckoId,
          holdings,
        });
        state.nextId += 1;
      });
    },
    updateHoldings: (
      state,
      action: PayloadAction<{ id: number; holdings: number }>
    ) => {
      state.tokens = state.tokens.map((t) =>
        t.id === action.payload.id
          ? { ...t, holdings: action.payload.holdings }
          : t
      );
    },
    removeToken: (state, action: PayloadAction<number>) => {
      state.tokens = state.tokens.filter(
        (token) => token.id !== action.payload
      );
    },
    clearWatchlist: (state) => {
      state.tokens = [];
      state.nextId = 1;
    },
  },
});

export const {
  addToken,
  addTokens,
  updateHoldings,
  removeToken,
  clearWatchlist,
} = watchlistSlice.actions;
export default watchlistSlice.reducer;
