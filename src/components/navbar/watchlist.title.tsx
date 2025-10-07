import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FC,
  type ChangeEvent,
} from "react";
import { Plus, RefreshCcw, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { addTokens } from "../../store/watchListSlice";
import { triggerRefresh } from "../../store/refreshSlice";
import { fetchMarketCoins } from "../../services/tokenService";

interface Token {
  id: number;
  coingeckoId: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  holdings: number;
}

interface TokenSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoinGeckoTrendingItem {
  item: {
    id: string;
    name: string;
    symbol: string;
    small: string;
  };
}

interface CoinGeckoTrendingResponse {
  coins: CoinGeckoTrendingItem[];
}

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

const initialColor = "#a9e851";

const TokenSearchModal: FC<TokenSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [tokens, setTokens] = useState<Token[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null); // Sentinel div to observe
  const dispatch = useDispatch();

  // Fetch trending tokens on modal open
  useEffect(() => {
    if (!isOpen) return;
    setTokens([]);
    setSelectedTokens(new Set());
    setPage(1);
    setHasMore(true);

    const fetchTrending = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/search/trending"
        );
        const data: CoinGeckoTrendingResponse = await res.json();

        const trendingTokens: Token[] = data.coins.map((coin, index) => ({
          id: index + 1,
          coingeckoId: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol.toUpperCase(),
          icon: coin.item.small,
          price: 0,
          holdings: 0,
        }));

        setTokens(trendingTokens);
      } catch (err) {
        console.error("Error loading trending tokens:", err);
        setTokens([]);
      }
    };

    fetchTrending();
  }, [isOpen]);

  // Fetch tokens for given page
  const fetchMoreTokens = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const perPage = 20;
      const data: CoinGeckoMarketCoin[] = await fetchMarketCoins(perPage, page);

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setTokens((prev) => {
          const baseId = prev.length > 0 ? prev[prev.length - 1].id : 0;
          const newTokens: Token[] = data.map((coin, idx) => ({
            id: baseId + idx + 1,
            coingeckoId: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            icon: coin.image,
            price: coin.current_price,
            holdings: 0,
          }));
          return [...prev, ...newTokens];
        });
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error loading more tokens:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  // Intersection Observer to detect scroll near bottom
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreTokens();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [fetchMoreTokens, hasMore]);

  if (!isOpen) return null;

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleToken = (coingeckoId: string) => {
    setSelectedTokens((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(coingeckoId)) {
        newSelected.delete(coingeckoId);
      } else {
        newSelected.add(coingeckoId);
      }
      return newSelected;
    });
  };

  return (
    <div
      className="fixed inset-0 glass flex items-center justify-center z-50 rounded-md"
      onClick={onClose}
    >
      <div
        className="bg-[#212124] rounded-2xl w-full max-w-xl shadow-2xl border border-gray-800 max-h-[55vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-800 flex-shrink-0 p-2">
          <input
            type="text"
            placeholder="Search tokens (e.g., ETH, SOL)..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="w-full bg-[#212124] text-white px-4 py-2 rounded-md focus:outline-none"
            autoFocus
          />
        </div>

        <div className="p-2 overflow-y-auto flex-grow max-h-[calc(80vh-112px)]">
          {filteredTokens.map((token) => (
            <div
              key={token.coingeckoId}
              className="flex items-center justify-between p-2.5 hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer group"
              onClick={() => toggleToken(token.coingeckoId)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center text-md w-8 h-8 rounded-full"
                  style={{ backgroundColor: initialColor + "20" }}
                >
                  {token.icon.startsWith("http") ? (
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-5 h-5"
                    />
                  ) : (
                    token.icon
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-white font-light text-sm">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="text-gray-400 text-xs">
                    Price: $
                    {token.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedTokens.has(token.coingeckoId)
                    ? "bg-[#a9e851] border-[#a9e851]"
                    : "border-gray-600 group-hover:border-gray-400"
                }`}
              >
                {selectedTokens.has(token.coingeckoId) && (
                  <svg
                    className="w-2 h-2 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}

          {/* Sentinel div for intersection observer */}
          <div ref={sentinelRef} />

          {loadingMore && (
            <div className="text-gray-400 text-center p-2">
              Loading more tokens...
            </div>
          )}
          {!hasMore && !loadingMore && tokens.length > 0 && (
            <div className="text-gray-400 text-center p-2">
              No more tokens to load
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 flex gap-3 justify-end p-2 flex-shrink-0">
          <button
            onClick={() => {
              const tokensToAdd = Array.from(selectedTokens)
                .map((coingeckoId) =>
                  tokens.find((t) => t.coingeckoId === coingeckoId)
                )
                .filter((t): t is Token => !!t)
                .map((t) => ({
                  coingeckoId: t.coingeckoId,
                  holdings: t.holdings,
                }));
              dispatch(addTokens(tokensToAdd));
              onClose();
            }}
            disabled={selectedTokens.size === 0}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              selectedTokens.size === 0
                ? "bg-transparent border-1 text-gray-600 border-gray-600 cursor-not-allowed"
                : "bg-[#a9e851] text-black hover:bg-[#98d645]"
            }`}
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

const WatchListTitle: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

  return (
    <>
      <div className="w-full flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            <Star fill="#a9e851" color="#a9e851" />
          </span>
          <h2 className="text-lg font-medium text-white">Watchlist</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 text-sm rounded-3xl font-semibold transition-colors"
            onClick={() => dispatch(triggerRefresh())}
          >
            <p className="flex gap-1 items-center text-white bg-[#27272A] p-2 rounded-md hover:bg-[#3f3f46] transition-colors">
              <RefreshCcw size={14} color="grey" /> Refresh Prices
            </p>
            <p
              className="flex gap-1 items-center bg-[#a9e851] text-black p-2 rounded-md hover:bg-[#98d645] transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={14} /> Add Token
            </p>
          </button>
        </div>
      </div>
      <TokenSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default WatchListTitle;
