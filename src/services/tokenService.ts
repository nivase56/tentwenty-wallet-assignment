// src/services/tokenService.ts

export interface CoinGeckoTrendingItem {
  item: {
    id: string;
    name: string;
    symbol: string;
    small: string;
  };
}

export interface CoinGeckoTrendingResponse {
  coins: CoinGeckoTrendingItem[];
}

export interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

/**
 * Fetch trending tokens from CoinGecko
 */
export async function fetchTrendingTokens(): Promise<CoinGeckoTrendingItem[]> {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  if (!res.ok) {
    throw new Error(`Failed to fetch trending tokens: ${res.statusText}`);
  }
  const data: CoinGeckoTrendingResponse = await res.json();
  return data.coins;
}

/**
 * Fetch market coins paged from CoinGecko
 * @param page the page number to fetch
 * @param perPage number of coins per page
 */
export async function fetchMarketCoins(
  page: number,
  perPage: number = 20
): Promise<CoinGeckoMarketCoin[]> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch market coins: ${res.statusText}`);
  }
  const data: CoinGeckoMarketCoin[] = await res.json();
  return data;
}
