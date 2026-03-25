import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

interface ICPPrice {
  usd: number;
  btc: number;
  change24h: number;
}

interface ICPPricePoint {
  date: string;
  price: number;
}

const MOCK_PRICE: ICPPrice = { usd: 8.52, btc: 0.0000987, change24h: 3.14 };
const MOCK_HISTORY: ICPPricePoint[] = [
  { date: "Mar 18", price: 7.95 },
  { date: "Mar 19", price: 8.12 },
  { date: "Mar 20", price: 7.88 },
  { date: "Mar 21", price: 8.34 },
  { date: "Mar 22", price: 8.67 },
  { date: "Mar 23", price: 8.45 },
  { date: "Mar 24", price: 8.52 },
];

function parsePriceResponse(json: string): ICPPrice {
  try {
    const data = JSON.parse(json);
    return {
      usd: data.usd ?? data.price_usd ?? data.USD ?? MOCK_PRICE.usd,
      btc: data.btc ?? data.price_btc ?? data.BTC ?? MOCK_PRICE.btc,
      change24h:
        data.change24h ??
        data.change_24h ??
        data.percent_change_24h ??
        MOCK_PRICE.change24h,
    };
  } catch {
    return MOCK_PRICE;
  }
}

function parsePriceHistory(json: string): ICPPricePoint[] {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) {
      return data.map(
        (
          item: { date?: string; time?: string; price?: number; usd?: number },
          i: number,
        ) => ({
          date: item.date ?? item.time ?? `Day ${i + 1}`,
          price: item.price ?? item.usd ?? 0,
        }),
      );
    }
    return MOCK_HISTORY;
  } catch {
    return MOCK_HISTORY;
  }
}

export function useICPPrice() {
  const { actor, isFetching } = useActor();
  return useQuery<ICPPrice>({
    queryKey: ["icpPrice"],
    queryFn: async () => {
      if (!actor) return MOCK_PRICE;
      try {
        const result = await actor.getCurrentIcpPrice();
        return parsePriceResponse(result);
      } catch {
        return MOCK_PRICE;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    placeholderData: MOCK_PRICE,
  });
}

export function useICPPriceHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ICPPricePoint[]>({
    queryKey: ["icpPriceHistory"],
    queryFn: async () => {
      if (!actor) return MOCK_HISTORY;
      try {
        const result = await actor.getIcpPriceHistory();
        return parsePriceHistory(result);
      } catch {
        return MOCK_HISTORY;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: MOCK_HISTORY,
  });
}
