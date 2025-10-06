import { WalletCards, LogOut } from "lucide-react";
import { useConnect, useAccount, useDisconnect, useBalance } from "wagmi";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  disconnectWallet,
  setBalance,
  setWalletData,
} from "../../store/walletSlice";
import type { AppDispatch } from "../../store/store";

const DonutTitle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const connectors = useConnect().connectors;
  const connect = useConnect().connect;
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Find only the WalletConnect connector
  const walletConnect = connectors.find((c) =>
    c.name.toLowerCase().includes("walletconnect")
  );

  // Truncate address helper
  const truncateAddress = (addr: string | []) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const { data: balance } = useBalance({
    address: address,
  });

  // Sync wallet connection state to Redux
  useEffect(() => {
    if (isConnected && address) {
      dispatch(
        setWalletData({
          address: address as string,
          isActive: isConnected,
        })
      );
    } else {
      dispatch(disconnectWallet());
    }
  }, [isConnected, address, dispatch]);

  // Sync balance to Redux
  useEffect(() => {
    if (balance) {
      dispatch(
        setBalance({
          decimals: balance.decimals,
          formatted: balance.formatted,
          symbol: balance.symbol,
          value: balance.value.toString(), // ✅ fix here
        })
      );
    } else {
      dispatch(setBalance(null));
    }
  }, [balance, dispatch]);

  return (
    <div className="w-full flex items-center justify-between py-3 px-1">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <span className="text-lg">
          <div className="h-5 w-5 bg-lime-400 rounded-sm flex items-center justify-center">
            <p className="h-3 w-3 bg-black transform rotate-[10deg] origin-top-right" />
          </div>
        </span>
        <h2 className="text-lg font-medium text-white">Token Portfolio</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {isConnected && address && (
          <div className="px-3 py-1.5 bg-gray-800 rounded-3xl border border-gray-700">
            <span className="text-sm font-mono text-lime-400">
              {truncateAddress(address)}
            </span>
          </div>
        )}

        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-3xl font-semibold transition-colors ${
            isConnected
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-lime-400 hover:bg-lime-500 text-black"
          }`}
          onClick={() => {
            if (isConnected) {
              disconnect();
            } else if (walletConnect) {
              connect({ connector: walletConnect });
            } else {
              console.error("WalletConnect not found");
            }
          }}
        >
          {isConnected ? (
            <>
              <LogOut size={14} /> Disconnect
            </>
          ) : (
            <>
              <WalletCards size={14} /> Connect Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DonutTitle;
