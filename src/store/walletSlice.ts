// store/walletSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string | null;
  isActive: boolean;
  balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  } | null;
}

const initialState: WalletState = {
  address: null,
  isActive: false,
  balance: null,
};

const walletSlice = createSlice({
  name: 'wallet',
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
        value: bigint;
      } | null>
    ) => {
      state.balance = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.isActive = false;
      state.balance = null;
    },
  },
});

export const { setWalletData, setBalance, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;