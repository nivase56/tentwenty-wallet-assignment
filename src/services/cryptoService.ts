// src/services/cryptoService.ts
export interface CoinGeckoApiResponse {
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

export async function fetchCryptoMarketData(coinIds: string[]): Promise<CoinGeckoApiResponse[]> {
  if (coinIds.length === 0) {
    return [];
  }

  const idsParam = coinIds.join(",");

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching crypto data: ${response.statusText}`);
  }

  const data: CoinGeckoApiResponse[] = await response.json();

  return data;
}
