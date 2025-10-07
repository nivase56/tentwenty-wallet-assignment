import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import {
  addToken,
  removeToken,
  updateHoldings,
} from "../../store/watchListSlice";
import { setPortfolioTotal } from "../../store/walletSlice";
import { fetchCryptoMarketData } from "../../services/cryptoService";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  sparklineColor: string;
  sparklineData: number[];
  holdings: number;
  value: number;
  originalId?: number;
}

interface CoinGeckoApiResponse {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

const CryptoPortfolioTable = () => {
  const dispatch = useDispatch();
  const watchlistTokens = useSelector(
    (state: RootState) => state.watchlist.tokens
  );
    const refreshFlag = useSelector((state: RootState) => state.refresh.refreshFlag); // Move here

  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCryptoData = useCallback(async () => {
    try {
      const defaultCoins = [
        "bitcoin",
        "ethereum",
        "solana",
        "dogecoin",
        "usd-coin",
        "stellar",
      ];

      // Prioritize watchlist tokens first, then default coins
      const watchlistIds = watchlistTokens
        .map((token) => token.coingeckoId)
        .filter((id) => typeof id === "string" && id.length > 0)
        .map((id) => id.toLowerCase());

      const allCoinIds = [...watchlistIds, ...defaultCoins];

      const uniqueCoinIds = [...new Set(allCoinIds)];
      
      const data: CoinGeckoApiResponse[] = await fetchCryptoMarketData(uniqueCoinIds);
      console.log("CoinGecko response:", data);
      

      // Sort data to prioritize watchlist tokens
      // Sort data to prioritize watchlist tokens first, then default coins
      const sortedData = data.sort((a, b) => {
        const aIsDefault = defaultCoins.includes(a.id.toLowerCase());
        const bIsDefault = defaultCoins.includes(b.id.toLowerCase());
        if (aIsDefault && !bIsDefault) return 1;
        if (!aIsDefault && bIsDefault) return -1;
        return 0;
      });

      const transformedData: CryptoData[] = sortedData.map((coin) => {
        const watchlistToken = watchlistTokens.find(
          (token) =>
            typeof token.coingeckoId === "string" &&
            token.coingeckoId.toLowerCase() === coin.id.toLowerCase()
        );

        const holdings = watchlistToken?.holdings ?? 1.5;
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: coin.image,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          sparklineColor:
            coin.price_change_percentage_24h >= 0 ? "green" : "red",
          sparklineData: coin.sparkline_in_7d?.price?.slice(-50) || [],
          holdings,
          value: coin.current_price * holdings,
          originalId: watchlistToken?.id,
        };
      });

      setCryptoData(transformedData);

      const totalValue = transformedData.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalValue);

      dispatch(
        setPortfolioTotal({
          formatted: formattedTotal,
          value: totalValue.toString(),
        })
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching crypto data", error);
      setLoading(false);
    }
  }, [watchlistTokens, dispatch]);

  useEffect(() => {
    fetchCryptoData();
  }, [watchlistTokens, fetchCryptoData, refreshFlag]);

  useEffect(() => {
    if (!loading) {
      setEditId((prev) => prev); // retain edit row even after refresh
    }
  }, [loading]);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editHoldings, setEditHoldings] = useState<string>("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const toggleMenu = (id: string) =>
    setMenuOpen((prev) => (prev === id ? null : id));

  const handleDelete = (id: string) => {
    const tokenToDelete = cryptoData.find((item) => item.id === id);
    if (tokenToDelete?.originalId !== undefined) {
      dispatch(removeToken(tokenToDelete.originalId));
    }
    setCryptoData((prev) => prev.filter((item) => item.id !== id));
    setMenuOpen(null);
    if (editId === id) {
      setEditId(null);
    }

    // Recalculate total after deletion
    const updatedData = cryptoData.filter((item) => item.id !== id);
    const totalValue = updatedData.reduce((sum, item) => sum + item.value, 0);
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalValue);
    dispatch(
      setPortfolioTotal({
        formatted: formattedTotal,
        value: totalValue.toString(),
      })
    );
  };

  const handleHoldingsClick = (id: string, holdings: number) => {
    setEditId(id);
    setEditHoldings(holdings.toString());
    setMenuOpen(null);
  };

  const handleSave = async (id: string) => {
    const newHoldings = parseFloat(editHoldings);
    if (!isNaN(newHoldings) && newHoldings >= 0) {
      const token = cryptoData.find((item) => item.id === id);

      if (token) {
        if (token.originalId !== undefined) {
          dispatch(
            updateHoldings({ id: token.originalId, holdings: newHoldings })
          );
        } else {
          dispatch(addToken({ coingeckoId: token.id, holdings: newHoldings }));
        }
      }

      // Refetch to sync with Redux state
      await fetchCryptoData();

      // Cleanup edit mode
      setEditId(null);
      setEditHoldings("");
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditHoldings("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSave(id);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const Sparkline: React.FC<{ data: number[]; color: string }> = ({
    data,
    color,
  }) => {
    if (!data || data.length === 0) {
      return <div className="w-[70px] h-[30px]" />;
    }

    const width = 70;
    const height = 30;
    const padding = 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
        const y =
          height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height}>
        <polyline
          points={points}
          fill="none"
          stroke={color === "green" ? "#10b981" : "#ef4444"}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const start = (page - 1) * rowsPerPage;
  const paginatedData = cryptoData.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(cryptoData.length / rowsPerPage);

  if (loading) {
    return (
      <div className="rounded-md mt-2">
        <div className="mx-auto">
          <div className="rounded-lg overflow-auto">
            <div className="bg-[#212124] border border-[#27272A] h-[40vh] flex items-center justify-center">
              <div className="text-[#888] text-sm">Loading crypto data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md mt-2">
      <div className="mx-auto">
        <div className="rounded-lg overflow-auto">
          <div className="bg-[#212124] border border-[#27272A] relative h-[40vh] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#27272A] border-b border-[#333]">
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    Token
                  </th>
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    Price
                  </th>
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    24h %
                  </th>
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    Sparkline (7d)
                  </th>
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    Holdings
                  </th>
                  <th className="text-left py-2 px-6 text-[#999] text-sm font-medium">
                    Value
                  </th>
                  <th className="py-2 px-6"></th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto">
                {paginatedData.map((crypto) => (
                  <tr
                    key={crypto.id}
                    className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a]"
                  >
                    <td className="py-1 px-6 flex items-center gap-3">
                      <img
                        src={crypto.icon}
                        alt={crypto.name}
                        className="w-6 h-6"
                      />
                      <span className="text-white text-sm font-medium">
                        {crypto.name} ({crypto.symbol})
                      </span>
                    </td>
                    <td className="py-1 px-6 text-white text-sm">
                      $
                      {crypto.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td
                      className="py-1 px-6 text-sm"
                      style={{
                        color: crypto.change24h > 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {crypto.change24h > 0 ? "+" : ""}
                      {crypto.change24h.toFixed(2)}%
                    </td>
                    <td className="py-1 px-6">
                      <Sparkline
                        data={crypto.sparklineData}
                        color={crypto.sparklineColor}
                      />
                    </td>
                    <td className="py-1 px-6 text-white text-sm">
                      {editId === crypto.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editHoldings}
                            onChange={(e) => setEditHoldings(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, crypto.id)}
                            className="bg-[#2a2a2a] border rounded px-2 py-1 text-white text-sm w-24 focus:outline-none focus:border-[#a9e851]"
                            autoFocus
                            step="0.0001"
                            min="0"
                          />
                          <button
                            onClick={() => handleSave(crypto.id)}
                            className="bg-[#a9e851] text-black text-xs px-3 py-1 rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-[#ef4444] text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() =>
                            handleHoldingsClick(crypto.id, crypto.holdings)
                          }
                          className="cursor-pointer hover:bg-[#3a3a3a] px-2 py-1 rounded inline-block transition-colors"
                          title="Click to edit holdings"
                        >
                          {crypto.holdings.toFixed(4)}
                        </span>
                      )}
                    </td>
                    <td className="py-1 px-6 text-white text-sm">
                      $
                      {crypto.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-1 px-6 text-right relative">
                      {editId !== crypto.id && (
                        <>
                          <button
                            className="text-[#888] hover:text-white"
                            onClick={() => toggleMenu(crypto.id)}
                          >
                            ⋮
                          </button>
                          {menuOpen === crypto.id && (
                            <div className="absolute right-8 top-6 bg-[#2a2a2a] border border-[#333] rounded-md shadow-lg w-32 z-10">
                              <button
                                onClick={() => handleDelete(crypto.id)}
                                className="block w-full text-left px-3 py-2 text-sm text-[#ef4444] hover:bg-[#3a3a3a]"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-1 border-t border-[#2a2a2a] bg-[#212124]">
            <span className="text-[#888] text-sm">
              {start + 1} — {Math.min(start + rowsPerPage, cryptoData.length)}{" "}
              of {cryptoData.length} results
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1 text-sm text-[#888] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#888]"
              >
                Prev
              </button>
              <span className="text-[#888] text-sm">
                {page} of {totalPages} pages
              </span>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1 text-sm text-[#888] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#888] rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPortfolioTable;
