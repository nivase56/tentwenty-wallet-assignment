import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  isActive: boolean;
  balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: string;
  } | null;
  portfolioTotal: {
    formatted: string;
    value: string;
  } | null;
}

const initialState: WalletState = {
  address: null,
  isActive: false,
  balance: null,
  portfolioTotal: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletData: (
      state,
      action: PayloadAction<{
        address: string;
        isActive: boolean;
      }>
    ) => {
      state.address = action.payload.address;
      state.isActive = action.payload.isActive;
    },
    setBalance: (
      state,
      action: PayloadAction<{
        decimals: number;
        formatted: string;
        symbol: string;
        value: string;
      } | null>
    ) => {
      state.balance = action.payload;
    },
    setPortfolioTotal: (
      state,
      action: PayloadAction<{
        formatted: string;
        value: string;
      } | null>
    ) => {
      state.portfolioTotal = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.isActive = false;
      state.balance = null;
      state.portfolioTotal = null;
    },
  },
});

export const { setWalletData, setBalance, setPortfolioTotal, disconnectWallet } =
  walletSlice.actions;
export default walletSlice.reducer;