import { useCallback, useEffect, useState } from "react";

export interface ExchangePrice {
  name: string;
  price: number | null;
  change24h: number | null;
  high24h: number | null;
  low24h: number | null;
  volume: number | null;
  loading: boolean;
  error: boolean;
  logoColor: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

const INITIAL_STATE = (name: string, logoColor: string): ExchangePrice => ({
  name,
  price: null,
  change24h: null,
  high24h: null,
  low24h: null,
  volume: null,
  loading: true,
  error: false,
  logoColor,
});

async function fetchBinance(): Promise<Partial<ExchangePrice>> {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/24hr?symbol=ICPUSDT",
    { signal: AbortSignal.timeout(8000) },
  );
  const d = await res.json();
  return {
    price: Number.parseFloat(d.lastPrice),
    change24h: Number.parseFloat(d.priceChangePercent),
    high24h: Number.parseFloat(d.highPrice),
    low24h: Number.parseFloat(d.lowPrice),
    volume: Number.parseFloat(d.volume),
  };
}

async function fetchBybit(): Promise<Partial<ExchangePrice>> {
  const res = await fetch(
    "https://api.bybit.com/v5/market/tickers?category=spot&symbol=ICPUSDT",
    { signal: AbortSignal.timeout(8000) },
  );
  const d = await res.json();
  const item = d.result.list[0];
  return {
    price: Number.parseFloat(item.lastPrice),
    change24h: Number.parseFloat(item.price24hPcnt) * 100,
    high24h: Number.parseFloat(item.highPrice24h),
    low24h: Number.parseFloat(item.lowPrice24h),
    volume: Number.parseFloat(item.volume24h),
  };
}

async function fetchHuobi(): Promise<Partial<ExchangePrice>> {
  const res = await fetch(
    "https://api.huobi.pro/market/detail/merged?symbol=icpusdt",
    { signal: AbortSignal.timeout(8000) },
  );
  const d = await res.json();
  const t = d.tick;
  const change = ((t.close - t.open) / t.open) * 100;
  return {
    price: t.close,
    change24h: change,
    high24h: t.high,
    low24h: t.low,
    volume: t.vol,
  };
}

const fetchers = [
  { name: "Binance", logoColor: "#F0B90B", fn: fetchBinance },
  { name: "Bybit", logoColor: "#FF6B00", fn: fetchBybit },
  { name: "Huobi", logoColor: "#2EBD85", fn: fetchHuobi },
];

export function useMultiExchange() {
  const [prices, setPrices] = useState<ExchangePrice[]>(
    fetchers.map((f) => INITIAL_STATE(f.name, f.logoColor)),
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setPrices((prev) =>
      prev.map((p) => ({ ...p, loading: true, error: false })),
    );
    const results = await Promise.allSettled(fetchers.map((f) => f.fn()));
    setPrices(
      results.map((result, i) => {
        const { name, logoColor } = fetchers[i];
        if (result.status === "fulfilled") {
          return {
            name,
            logoColor,
            loading: false,
            error: false,
            price: result.value.price ?? null,
            change24h: result.value.change24h ?? null,
            high24h: result.value.high24h ?? null,
            low24h: result.value.low24h ?? null,
            volume: result.value.volume ?? null,
          };
        }
        return {
          name,
          logoColor,
          loading: false,
          error: true,
          price: null,
          change24h: null,
          high24h: null,
          low24h: null,
          volume: null,
        };
      }),
    );
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { prices, lastUpdated, refresh: fetchAll };
}

export function usePriceHistory(days: 1 | 7 | 30) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(
      `https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=${days}`,
      { signal: AbortSignal.timeout(12000) },
    )
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const chartPrices: [number, number][] = json.prices ?? [];
        const interval = days === 1 ? 4 : days === 7 ? 6 : 1;
        const filtered = chartPrices.filter((_, i) => i % interval === 0);
        setData(
          filtered.map(([ts, price]) => {
            const d = new Date(ts);
            let label: string;
            if (days === 1) {
              label = d.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } else {
              label = d.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
              });
            }
            return { date: label, price: Math.round(price * 10000) / 10000 };
          }),
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { data, loading, error };
}
