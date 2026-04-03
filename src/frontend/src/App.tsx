import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  ExternalLink,
  Github,
  Hash,
  Menu,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Send,
  TrendingUp,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChatMessage } from "./backend";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type ExchangePrice,
  useMultiExchange,
  usePriceHistory,
} from "./hooks/useMultiExchange";

function fmt(n: number | null, digits = 2) {
  if (n === null) return "—";
  return n.toFixed(digits);
}

function fmtVolume(n: number | null) {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: color }}
      />
    </span>
  );
}

function TickerBar() {
  const { prices } = useMultiExchange();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-8 px-4"
      style={{
        height: "36px",
        background: "#000000",
        borderBottom: "1px solid #1E2D42",
        fontSize: "12px",
      }}
    >
      <span style={{ color: "#A9B4C7" }} className="font-semibold shrink-0">
        ICP/USDT
      </span>
      {prices.map((ex) => {
        const pos = (ex.change24h ?? 0) >= 0;
        return (
          <span
            key={ex.name}
            className="flex items-center gap-1.5 shrink-0"
            style={{ color: "#A9B4C7" }}
          >
            <span className="font-bold" style={{ color: ex.logoColor }}>
              {ex.name}:
            </span>
            {ex.loading ? (
              <span style={{ color: "#4A5568" }}>загрузка...</span>
            ) : ex.error ? (
              <span style={{ color: "#EF4444" }}>ошибка</span>
            ) : (
              <>
                <span style={{ color: "#EAF0FF" }} className="font-semibold">
                  ${fmt(ex.price)}
                </span>
                <span
                  className="flex items-center gap-0.5"
                  style={{ color: pos ? "#22C55E" : "#EF4444" }}
                >
                  {pos ? (
                    <ArrowUpRight size={10} />
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                  {fmt(Math.abs(ex.change24h ?? 0))}%
                </span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}

function Navbar({ activeSection }: { activeSection: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;
  const navLinks = [
    { label: "Новости", href: "#news" },
    { label: "Трейдинг", href: "#trading" },
    { label: "Сообщество", href: "#community" },
    {
      label: "Документация",
      href: "https://internetcomputer.org/docs",
      external: true,
    },
  ];

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-40"
        style={{
          top: "36px",
          background: "rgba(0, 0, 0, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a href="#top" className="flex items-center gap-2 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                }}
              >
                ICP
              </div>
              <span
                className="font-display font-bold text-lg"
                style={{ color: "#EAF0FF" }}
              >
                ICP Hub
              </span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-sm font-medium"
                    data-ocid={`nav.${link.label}.link`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`nav-link text-sm font-medium ${
                      activeSection === link.href.slice(1) ? "active" : ""
                    }`}
                    data-ocid={`nav.${link.label}.link`}
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {identity ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="text-xs font-mono px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    style={{
                      color: "#A855F7",
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(168,85,247,0.3)",
                    }}
                    data-ocid="nav.profile.button"
                  >
                    <UserCircle size={14} />
                    {shortPrincipal}
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-90"
                    style={{ color: "#A9B4C7", border: "1px solid #1f1f1f" }}
                    data-ocid="nav.logout.button"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="text-sm font-medium px-4 py-2 rounded-full transition-all disabled:opacity-50"
                    style={{ color: "#A9B4C7", border: "1px solid #1f1f1f" }}
                    data-ocid="nav.login.button"
                  >
                    {isLoggingIn ? "Вход..." : "Войти"}
                  </button>
                  <button
                    type="button"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    }}
                    data-ocid="nav.signup.button"
                  >
                    {isLoggingIn ? "Вход..." : "Регистрация"}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: "#EAF0FF" }}
              data-ocid="nav.menu.toggle"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            className="md:hidden"
            style={{ background: "#060606", borderTop: "1px solid #1f1f1f" }}
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="nav-link text-sm font-medium py-2"
                  onClick={() => setMenuOpen(false)}
                  data-ocid={`nav.mobile.${link.label}.link`}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                {identity ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(true);
                        setMenuOpen(false);
                      }}
                      className="flex-1 text-xs font-mono text-center py-2 rounded-full flex items-center justify-center gap-1"
                      style={{
                        color: "#A855F7",
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(168,85,247,0.3)",
                      }}
                      data-ocid="nav.mobile.profile.button"
                    >
                      <UserCircle size={12} />
                      {shortPrincipal}
                    </button>
                    <button
                      type="button"
                      onClick={clear}
                      className="flex-1 text-sm py-2 rounded-full"
                      style={{ color: "#A9B4C7", border: "1px solid #1f1f1f" }}
                      data-ocid="nav.mobile.logout.button"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={login}
                      disabled={isLoggingIn}
                      className="flex-1 text-sm py-2 rounded-full disabled:opacity-50"
                      style={{ color: "#A9B4C7", border: "1px solid #1f1f1f" }}
                      data-ocid="nav.mobile.login.button"
                    >
                      {isLoggingIn ? "Вход..." : "Войти"}
                    </button>
                    <button
                      type="button"
                      onClick={login}
                      disabled={isLoggingIn}
                      className="flex-1 text-sm py-2 rounded-full font-semibold text-white disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                      }}
                      data-ocid="nav.mobile.signup.button"
                    >
                      {isLoggingIn ? "Вход..." : "Регистрация"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {identity && (
        <MyProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}

function HeroSection() {
  return (
    <section
      className="pt-32 pb-20 px-4 sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(43,196,180,0.08) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{
                background: "rgba(124,58,237,0.18)",
                color: "#A855F7",
                border: "1px solid rgba(168,85,247,0.35)",
              }}
            >
              <PulseDot color="#A855F7" />
              Данные в реальном времени
            </div>
            <h1
              className="font-display font-bold leading-tight mb-6"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                color: "#EAF0FF",
              }}
            >
              Отслеживай курс{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #A855F7, #4CC9F0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ICP
              </span>{" "}
              в реальном времени
            </h1>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "#A9B4C7", maxWidth: "480px" }}
            >
              Мониторинг цен с бирж Binance, Bybit и Huobi, интерактивные
              графики и всё об экосистеме Internet Computer.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#trading"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all"
                style={{ color: "#2BC4B4", border: "2px solid #2BC4B4" }}
                data-ocid="hero.view_chart.button"
              >
                Смотреть график <TrendingUp size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
              <img
                src="/assets/generated/icp-hero-network.dim_600x500.png"
                alt="ICP Network"
                className="relative rounded-2xl"
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  border: "1px solid #1f1f1f",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExchangeCard({ ex }: { ex: ExchangePrice }) {
  const pos = (ex.change24h ?? 0) >= 0;
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
    >
      <div className="h-1 w-full" style={{ background: ex.logoColor }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: `${ex.logoColor}22`, color: ex.logoColor }}
            >
              {ex.name[0]}
            </div>
            <span
              className="font-display font-bold"
              style={{ color: "#EAF0FF" }}
            >
              {ex.name}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
          >
            <PulseDot color="#22C55E" />
            LIVE
          </div>
        </div>

        {ex.loading ? (
          <div
            className="flex flex-col gap-2"
            data-ocid={`exchange.${ex.name.toLowerCase()}.loading_state`}
          >
            {[48, 32, 24].map((w) => (
              <div
                key={w}
                className="rounded animate-pulse"
                style={{
                  height: w === 48 ? "2.5rem" : "1rem",
                  width: `${w * 2}px`,
                  background: "#202C3D",
                }}
              />
            ))}
          </div>
        ) : ex.error ? (
          <div
            className="text-sm py-4 text-center"
            style={{ color: "#EF4444" }}
            data-ocid={`exchange.${ex.name.toLowerCase()}.error_state`}
          >
            Не удалось загрузить данные
          </div>
        ) : (
          <>
            <div
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: "#EAF0FF", lineHeight: 1 }}
            >
              ${fmt(ex.price)}
            </div>

            <div
              className="flex items-center gap-1 text-sm font-semibold"
              style={{ color: pos ? "#22C55E" : "#EF4444" }}
            >
              {pos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {fmt(Math.abs(ex.change24h ?? 0))}% за 24ч
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Макс 24ч", value: `$${fmt(ex.high24h)}` },
                { label: "Мин 24ч", value: `$${fmt(ex.low24h)}` },
                { label: "Объём 24ч", value: fmtVolume(ex.volume) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs" style={{ color: "#A9B4C7" }}>
                    {item.label}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "#EAF0FF" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExchangePanel() {
  const { prices, lastUpdated, refresh } = useMultiExchange();

  const validPrices = prices.filter((p) => p.price !== null);
  const avgPrice =
    validPrices.length > 0
      ? validPrices.reduce((s, p) => s + (p.price ?? 0), 0) / validPrices.length
      : null;

  const timeStr = lastUpdated ? lastUpdated.toLocaleTimeString("ru-RU") : "—";

  return (
    <section
      id="exchanges"
      className="py-16 px-4 sm:px-6"
      style={{ background: "rgba(18, 26, 42, 0.8)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div
            className="flex items-center gap-2 text-sm font-semibold mb-3"
            style={{ color: "#4CC9F0" }}
          >
            <TrendingUp size={16} />
            <span>РЕАЛЬНОЕ ВРЕМЯ</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              className="font-display font-bold text-3xl"
              style={{ color: "#EAF0FF" }}
            >
              Курс ICP в реальном времени
            </h2>
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{
                background: "rgba(76,201,240,0.12)",
                color: "#4CC9F0",
                border: "1px solid rgba(76,201,240,0.25)",
              }}
              data-ocid="exchanges.refresh.button"
            >
              <RefreshCw size={12} />
              Обновить
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <PulseDot color="#22C55E" />
            <span className="text-xs" style={{ color: "#A9B4C7" }}>
              Обновлено: {timeStr}
            </span>
          </div>
        </motion.div>

        {/* 3 exchange cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {prices.map((ex, i) => (
            <motion.div
              key={ex.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              data-ocid={`exchange.${ex.name.toLowerCase()}.card`}
            >
              <ExchangeCard ex={ex} />
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          data-ocid="exchanges.comparison.table"
        >
          <div className="p-4 border-b" style={{ borderColor: "#1f1f1f" }}>
            <h3
              className="font-display font-semibold text-sm"
              style={{ color: "#EAF0FF" }}
            >
              Сравнение бирж
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {[
                    "Биржа",
                    "Цена",
                    "Изм. 24ч",
                    "Макс 24ч",
                    "Мин 24ч",
                    "Объём 24ч",
                    "Разница от средней",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: "#A9B4C7" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.map((ex) => {
                  const pos = (ex.change24h ?? 0) >= 0;
                  const diff =
                    ex.price !== null && avgPrice !== null
                      ? ((ex.price - avgPrice) / avgPrice) * 100
                      : null;
                  return (
                    <tr
                      key={ex.name}
                      style={{ borderBottom: "1px solid #1E2D42" }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: ex.logoColor }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: "#EAF0FF" }}
                          >
                            {ex.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "#EAF0FF" }}
                      >
                        {ex.loading ? (
                          <div
                            className="h-3 w-16 rounded animate-pulse"
                            style={{ background: "#202C3D" }}
                          />
                        ) : ex.error ? (
                          <span style={{ color: "#EF4444" }}>—</span>
                        ) : (
                          `$${fmt(ex.price)}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!ex.loading && !ex.error && (
                          <span
                            className="flex items-center gap-0.5 font-semibold"
                            style={{ color: pos ? "#22C55E" : "#EF4444" }}
                          >
                            {pos ? (
                              <ArrowUpRight size={12} />
                            ) : (
                              <ArrowDownRight size={12} />
                            )}
                            {fmt(Math.abs(ex.change24h ?? 0))}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#EAF0FF" }}>
                        {ex.loading ? "..." : `$${fmt(ex.high24h)}`}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#EAF0FF" }}>
                        {ex.loading ? "..." : `$${fmt(ex.low24h)}`}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#A9B4C7" }}>
                        {ex.loading ? "..." : fmtVolume(ex.volume)}
                      </td>
                      <td className="px-4 py-3">
                        {diff !== null && (
                          <span
                            className="text-xs font-semibold"
                            style={{ color: diff >= 0 ? "#22C55E" : "#EF4444" }}
                          >
                            {diff >= 0 ? "+" : ""}
                            {diff.toFixed(3)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const PERIOD_OPTIONS: { label: string; days: 1 | 7 | 30 }[] = [
  { label: "1Д", days: 1 },
  { label: "7Д", days: 7 },
  { label: "30Д", days: 30 },
];

function TradingSection() {
  const [selectedDays, setSelectedDays] = useState<1 | 7 | 30>(7);
  const { data: history, loading: histLoading } = usePriceHistory(selectedDays);
  const { prices } = useMultiExchange();

  // Compute aggregated stats from exchange prices
  const validPrices = prices.filter(
    (p) => !p.loading && !p.error && p.price !== null,
  );
  const avgPrice =
    validPrices.length > 0
      ? validPrices.reduce((s, p) => s + (p.price ?? 0), 0) / validPrices.length
      : null;
  const avgChange =
    validPrices.length > 0
      ? validPrices.reduce((s, p) => s + (p.change24h ?? 0), 0) /
        validPrices.length
      : null;
  const maxHigh = validPrices.reduce<number | null>(
    (m, p) => (p.high24h !== null ? Math.max(m ?? 0, p.high24h) : m),
    null,
  );
  const minLow = validPrices.reduce<number | null>(
    (m, p) =>
      p.low24h !== null ? Math.min(m ?? Number.POSITIVE_INFINITY, p.low24h) : m,
    null,
  );
  const totalVol = validPrices.reduce((s, p) => s + (p.volume ?? 0), 0);

  const isPositive = (avgChange ?? 0) >= 0;

  return (
    <section id="trading" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div
            className="flex items-center gap-2 text-sm font-semibold mb-3"
            style={{ color: "#4CC9F0" }}
          >
            <TrendingUp size={16} />
            <span>LIVE</span>
          </div>
          <h2
            className="font-display font-bold text-3xl"
            style={{ color: "#EAF0FF" }}
          >
            График ICP/USDT
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
        >
          {/* Price header */}
          <div className="p-6 border-b" style={{ borderColor: "#1f1f1f" }}>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: "#A9B4C7" }}
                >
                  ICP / USDT · Средняя по биржам
                </div>
                <div
                  className="font-display font-bold"
                  style={{
                    fontSize: "2.5rem",
                    color: "#EAF0FF",
                    lineHeight: 1,
                  }}
                >
                  {avgPrice !== null ? (
                    `$${fmt(avgPrice)}`
                  ) : (
                    <span className="text-2xl" style={{ color: "#4A5568" }}>
                      Загрузка...
                    </span>
                  )}
                </div>
              </div>
              {avgChange !== null && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{
                    background: isPositive
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                    color: isPositive ? "#22C55E" : "#EF4444",
                  }}
                  data-ocid="trading.change_badge"
                >
                  {isPositive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {fmt(Math.abs(avgChange))}%
                  <span className="text-xs font-normal opacity-70">24ч</span>
                </div>
              )}

              {/* Period selector */}
              <div
                className="ml-auto flex items-center gap-1 p-1 rounded-lg"
                style={{ background: "#202C3D" }}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setSelectedDays(opt.days)}
                    className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
                    style={{
                      background:
                        selectedDays === opt.days ? "#7C3AED" : "transparent",
                      color: selectedDays === opt.days ? "#fff" : "#A9B4C7",
                    }}
                    data-ocid={`trading.period_${opt.days}d.tab`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-6">
            {histLoading ? (
              <div
                className="h-72 rounded-lg animate-pulse"
                style={{ background: "#202C3D" }}
                data-ocid="trading.chart.loading_state"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={history}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1f1f1f"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#1f1f1f"
                    tick={{ fill: "#A9B4C7", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#1f1f1f"
                    tick={{ fill: "#A9B4C7", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v.toFixed(2)}`}
                    domain={["auto", "auto"]}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#202C3D",
                      border: "1px solid #1f1f1f",
                      borderRadius: "8px",
                      color: "#EAF0FF",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(4)}`,
                      "ICP/USDT",
                    ]}
                    labelStyle={{ color: "#A9B4C7" }}
                    cursor={{
                      stroke: "#A855F7",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      fill: "#A855F7",
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#EAF0FF",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t"
            style={{ borderColor: "#1f1f1f" }}
          >
            {[
              {
                label: "Текущая цена",
                value: avgPrice !== null ? `$${fmt(avgPrice)}` : "—",
              },
              {
                label: "Изм. 24ч",
                value:
                  avgChange !== null
                    ? `${avgChange >= 0 ? "+" : ""}${fmt(avgChange)}%`
                    : "—",
                color:
                  avgChange !== null
                    ? avgChange >= 0
                      ? "#22C55E"
                      : "#EF4444"
                    : undefined,
              },
              {
                label: "Макс 24ч",
                value: maxHigh !== null ? `$${fmt(maxHigh)}` : "—",
              },
              {
                label: "Мин 24ч",
                value:
                  minLow !== null && minLow !== Number.POSITIVE_INFINITY
                    ? `$${fmt(minLow)}`
                    : "—",
              },
              { label: "Объём (суммарно)", value: fmtVolume(totalVol || null) },
              { label: "Бирж активно", value: `${validPrices.length}/3` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-5 py-4 border-r last:border-r-0"
                style={{ borderColor: "#1f1f1f" }}
              >
                <div className="text-xs mb-1" style={{ color: "#A9B4C7" }}>
                  {stat.label}
                </div>
                <div
                  className="font-display font-bold text-sm"
                  style={{ color: stat.color ?? "#EAF0FF" }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 flex justify-end">
            <a
              href="https://www.coingecko.com/en/coins/internet-computer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: "#4CC9F0" }}
              data-ocid="trading.coingecko.link"
            >
              <ExternalLink size={13} />
              Подробнее на CoinGecko →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  source: string;
  link: string;
  gradient: string;
  category: string;
}

const PAGE_SIZE = 12;

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "ICP превысил 1 миллиард транзакций на блокчейне",
    date: "24 мар 2026",
    source: "ICP.news",
    excerpt:
      "Блокчейн Internet Computer достиг важной вехи — обработано более миллиарда полностью on-chain транзакций.",
    link: "https://icp.news",
    gradient: "linear-gradient(135deg, #4CC9F0 0%, #A855F7 100%)",
    category: "ICP",
  },
  {
    title: "DFINITY объявляет о Chain Fusion v2",
    date: "22 мар 2026",
    source: "DFINITY Blog",
    excerpt: "Технология Chain Fusion получила крупное обновление.",
    link: "https://dfinity.org/blog",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4CC9F0 100%)",
    category: "DFINITY",
  },
  {
    title: "Internet Identity теперь поддерживает Passkeys",
    date: "18 мар 2026",
    source: "ICP.news",
    excerpt: "Web3-аутентификация стала проще.",
    link: "https://icp.news",
    gradient: "linear-gradient(135deg, #4CC9F0 0%, #A855F7 100%)",
    category: "ICP",
  },
  {
    title: "Новый DEX на ICP достиг $50M TVL за первую неделю",
    date: "15 мар 2026",
    source: "CoinDesk",
    excerpt: "ICPSwap v3 запустился с пулами сконцентрированной ликвидности.",
    link: "https://coindesk.com",
    gradient: "linear-gradient(135deg, #2BC4B4 0%, #7C3AED 100%)",
    category: "Media",
  },
  {
    title: "DFINITY Foundation вступила в Hyperledger",
    date: "12 мар 2026",
    source: "DFINITY Blog",
    excerpt: "DFINITY стала премиум-членом Hyperledger Foundation.",
    link: "https://dfinity.org/blog",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4CC9F0 100%)",
    category: "DFINITY",
  },
  {
    title: "ICP в топ-20 крипто по рыночной капитализации",
    date: "10 мар 2026",
    source: "Cointelegraph",
    excerpt: "После обновления протокола ICP вошёл в топ-20 криптовалют.",
    link: "https://cointelegraph.com",
    gradient: "linear-gradient(135deg, #F5C542 0%, #7C3AED 100%)",
    category: "Media",
  },
];

const GRADIENT_MAP: Record<string, string> = {
  Reddit: "linear-gradient(135deg, #FF4500 0%, #7C3AED 100%)",
  DFINITY: "linear-gradient(135deg, #7C3AED 0%, #4CC9F0 100%)",
  Media: "linear-gradient(135deg, #2BC4B4 0%, #7C3AED 100%)",
  ICP: "linear-gradient(135deg, #4CC9F0 0%, #A855F7 100%)",
  CryptoSlate: "linear-gradient(135deg, #22C55E 0%, #4CC9F0 100%)",
  Cointelegraph: "linear-gradient(135deg, #F5C542 0%, #7C3AED 100%)",
  Forum: "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)",
  Decrypt: "linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)",
  BeInCrypto: "linear-gradient(135deg, #10B981 0%, #4CC9F0 100%)",
  Messari: "linear-gradient(135deg, #6366F1 0%, #4CC9F0 100%)",
  Bankless: "linear-gradient(135deg, #F59E0B 0%, #7C3AED 100%)",
  CoinGecko: "linear-gradient(135deg, #84CC16 0%, #4CC9F0 100%)",
};

const ICP_KEYWORDS = [
  "ICP",
  "Internet Computer",
  "DFINITY",
  "dfinity",
  "icp",
  "canister",
  "motoko",
  "chain fusion",
  "NNS",
  "SNS",
  "ckBTC",
  "ckETH",
  "chain key",
  "internet identity",
  "openchat",
  "dscvr",
  "sonic",
  "icpswap",
];

function isIcpRelated(title: string, desc: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  return ICP_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function formatDateRu(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

const CORS_PROXIES = [
  (url: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) =>
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchViaProxy(url: string): Promise<string> {
  let lastErr: Error = new Error("All proxies failed");
  for (const makeProxy of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxy(url);
      const res = await fetchWithTimeout(proxyUrl, {}, 9000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text && text.length > 100) return text;
    } catch (e) {
      lastErr = e as Error;
    }
  }
  throw lastErr;
}

async function fetchViaRss2Json(
  url: string,
  category: string,
  source: string,
): Promise<NewsItem[]> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`;
    const res = await fetchWithTimeout(apiUrl, {}, 9000);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];
    return (data.items as any[])
      .filter((item) =>
        isIcpRelated(
          item.title || "",
          stripHtml(item.description || item.content || ""),
        ),
      )
      .map((item) => ({
        title: (item.title || "").slice(0, 120),
        excerpt:
          stripHtml(item.description || item.content || "").slice(0, 200) ||
          "Читать статью",
        date: formatDateRu(item.pubDate || ""),
        source,
        link: item.link || item.guid || "#",
        gradient: GRADIENT_MAP[category] || GRADIENT_MAP.Media,
        category,
      }));
  } catch {
    return [];
  }
}

function parseRssXml(
  xml: string,
  category: string,
  source: string,
  filterIcp = true,
): NewsItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) return [];
    const items = Array.from(doc.querySelectorAll("item, entry"));
    const results: NewsItem[] = [];
    for (const item of items) {
      const title = stripHtml(
        item.querySelector("title")?.textContent || "",
      ).slice(0, 120);
      const desc = stripHtml(
        item.querySelector("description, summary")?.textContent || "",
      ).slice(0, 200);
      if (!title) continue;
      if (filterIcp && !isIcpRelated(title, desc)) continue;
      const linkEl = item.querySelector("link");
      const link = (
        linkEl?.getAttribute("href") ||
        linkEl?.textContent ||
        "#"
      ).trim();
      const pubDate =
        item.querySelector("pubDate, published, updated")?.textContent || "";
      results.push({
        title,
        excerpt: desc || "Читать статью на сайте источника",
        date: formatDateRu(pubDate),
        source,
        link,
        gradient: GRADIENT_MAP[category] || GRADIENT_MAP.Media,
        category,
      });
    }
    return results;
  } catch {
    return [];
  }
}

async function fetchRssSource(src: RssSource): Promise<NewsItem[]> {
  try {
    const xml = await fetchViaProxy(src.url);
    const items = parseRssXml(xml, src.category, src.source, src.filterIcp);
    if (items.length > 0) return items;
    return fetchViaRss2Json(src.url, src.category, src.source);
  } catch {
    return fetchViaRss2Json(src.url, src.category, src.source);
  }
}

async function fetchRedditDirect(subreddit: string): Promise<NewsItem[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
    const res = await fetchWithTimeout(url, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    const children = data?.data?.children;
    if (!Array.isArray(children)) return [];
    return (children as any[])
      .filter((c) => isIcpRelated(c.data?.title || "", c.data?.selftext || ""))
      .map((c) => ({
        title: (c.data?.title || "").slice(0, 120),
        excerpt:
          (c.data?.selftext || "").slice(0, 200) || "Обсуждение на Reddit",
        date: c.data?.created_utc
          ? formatDateRu(new Date(c.data.created_utc * 1000).toISOString())
          : "",
        source: `r/${subreddit}`,
        link:
          c.data?.url ||
          (c.data?.permalink ? `https://reddit.com${c.data.permalink}` : "#"),
        gradient: GRADIENT_MAP.Reddit,
        category: "Reddit",
      }));
  } catch {
    return [];
  }
}

interface RssSource {
  url: string;
  category: string;
  source: string;
  filterIcp: boolean;
}

const RSS_SOURCES: RssSource[] = [
  {
    url: "https://medium.com/feed/dfinity",
    category: "DFINITY",
    source: "DFINITY Blog",
    filterIcp: false,
  },
  {
    url: "https://icp.news/feed/",
    category: "ICP",
    source: "ICP.news",
    filterIcp: false,
  },
  {
    url: "https://forum.dfinity.org/latest.rss",
    category: "Forum",
    source: "DFINITY Forum",
    filterIcp: false,
  },
  {
    url: "https://forum.dfinity.org/c/announcements/7.rss",
    category: "DFINITY",
    source: "DFINITY Announcements",
    filterIcp: false,
  },
  {
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "Media",
    source: "CoinDesk",
    filterIcp: true,
  },
  {
    url: "https://cointelegraph.com/rss",
    category: "Cointelegraph",
    source: "Cointelegraph",
    filterIcp: true,
  },
  {
    url: "https://cryptoslate.com/feed/",
    category: "CryptoSlate",
    source: "CryptoSlate",
    filterIcp: true,
  },
  {
    url: "https://decrypt.co/feed",
    category: "Decrypt",
    source: "Decrypt",
    filterIcp: true,
  },
  {
    url: "https://beincrypto.com/feed/",
    category: "BeInCrypto",
    source: "BeInCrypto",
    filterIcp: true,
  },
  {
    url: "https://messari.io/rss",
    category: "Messari",
    source: "Messari",
    filterIcp: true,
  },
  {
    url: "https://blog.coingecko.com/feed/",
    category: "CoinGecko",
    source: "CoinGecko Blog",
    filterIcp: true,
  },
  {
    url: "https://thedefiant.io/feed",
    category: "Media",
    source: "The Defiant",
    filterIcp: true,
  },
  {
    url: "https://banklesshq.com/feed",
    category: "Bankless",
    source: "Bankless",
    filterIcp: true,
  },
  {
    url: "https://www.theblock.co/rss.xml",
    category: "Media",
    source: "The Block",
    filterIcp: true,
  },
  {
    url: "https://cryptopotato.com/feed/",
    category: "Media",
    source: "CryptoPotato",
    filterIcp: true,
  },
];

function useIcpNews() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sourcesLoaded, setSourcesLoaded] = useState(0);
  const [tick, setTick] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick is intentional refresh trigger
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSourcesLoaded(0);
    setVisibleCount(PAGE_SIZE);

    const bump = () => {
      if (!cancelled) setSourcesLoaded((n) => n + 1);
    };

    const fetchers = [
      fetchRedditDirect("dfinity")
        .then((r) => {
          bump();
          return r;
        })
        .catch(() => [] as NewsItem[]),
      fetchRedditDirect("InternetComputer")
        .then((r) => {
          bump();
          return r;
        })
        .catch(() => [] as NewsItem[]),
      ...RSS_SOURCES.map((src) =>
        fetchRssSource(src)
          .then((r) => {
            bump();
            return r;
          })
          .catch(() => [] as NewsItem[]),
      ),
    ];

    Promise.allSettled(fetchers).then((results) => {
      if (cancelled) return;
      const all: NewsItem[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value);
      }
      const seen = new Set<string>();
      const deduped = all.filter((item) => {
        const key = item.link && item.link !== "#" ? item.link : item.title;
        if (!item.title || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      deduped.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (Number.isNaN(da) && Number.isNaN(db)) return 0;
        if (Number.isNaN(da)) return 1;
        if (Number.isNaN(db)) return -1;
        return db - da;
      });
      if (deduped.length === 0) {
        setAllNews(FALLBACK_NEWS);
        setError(
          "Не удалось загрузить актуальные новости, показываем кешированные",
        );
      } else {
        setAllNews(deduped);
      }
      setLastUpdated(new Date());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const loadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  }, []);

  return {
    allNews,
    visibleCount,
    loading,
    loadingMore,
    error,
    lastUpdated,
    refresh,
    loadMore,
    sourcesLoaded,
    totalSources: RSS_SOURCES.length + 2,
  };
}

function NewsSection() {
  const {
    allNews,
    visibleCount,
    loading,
    loadingMore,
    error,
    lastUpdated,
    refresh,
    loadMore,
    sourcesLoaded,
    totalSources,
  } = useIcpNews();
  const [activeCategory, setActiveCategory] = useState("Все");

  const categories = [
    "Все",
    "ICP",
    "DFINITY",
    "Reddit",
    "Forum",
    "Media",
    "Cointelegraph",
    "CryptoSlate",
    "Decrypt",
    "BeInCrypto",
    "Messari",
    "Bankless",
    "CoinGecko",
  ];

  const filtered =
    activeCategory === "Все"
      ? allNews
      : allNews.filter((n) => n.category === activeCategory);
  const visible = filtered.slice(0, visibleCount);
  const hasMoreFiltered = visibleCount < filtered.length;

  return (
    <section id="news" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Новости ICP</h2>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
                  Загружаем источники... {sourcesLoaded}/{totalSources}
                </span>
              ) : lastUpdated ? (
                `Обновлено: ${lastUpdated.toLocaleTimeString("ru-RU")} · ${allNews.length} статей из ${totalSources} источников`
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-all text-sm disabled:opacity-50"
            title="Обновить новости"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Обновить
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
              {cat !== "Все" && !loading && (
                <span className="ml-1 opacity-40 text-[10px]">
                  {allNews.filter((n) => n.category === cat).length || ""}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => String(i)).map((id) => (
              <div
                key={id}
                className="rounded-xl border border-white/5 bg-white/3 h-52 animate-pulse"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Нет новостей по этой категории
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((item, i) => (
                <motion.div
                  key={
                    item.link && item.link !== "#"
                      ? item.link
                      : `${item.source}-${i}`
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="rounded-xl border border-white/5 bg-white/3 overflow-hidden hover:border-white/15 transition-all group flex flex-col"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: item.gradient }}
                  />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 truncate max-w-[130px]">
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">
                      {item.excerpt}
                    </p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-auto"
                    >
                      Читать →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {hasMoreFiltered && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl border border-purple-500/30 bg-purple-600/10 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Загружаем...
                    </>
                  ) : (
                    <>
                      Загрузить ещё новости
                      <span className="text-xs opacity-60 ml-1">
                        +{Math.min(PAGE_SIZE, filtered.length - visibleCount)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMoreFiltered && visible.length >= PAGE_SIZE && (
              <p className="text-center text-gray-600 text-xs mt-8">
                Показано все {visible.length} статей
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function CommunitySection() {
  const cards = [
    {
      icon: <MessageSquare size={24} />,
      color: "#7C3AED",
      title: "Форум ICP",
      description:
        "Присоединяйтесь к тысячам разработчиков, обсуждающих последние новости ICP, делящихся проектами и получающих помощь.",
      cta: "Перейти на форум",
      link: "https://forum.dfinity.org",
    },
    {
      icon: <Calendar size={24} />,
      color: "#2BC4B4",
      title: "Мероприятия ICP",
      description:
        "Предстоящие хакатоны, митапы и конференции, где можно познакомиться с сообществом ICP по всему миру.",
      cta: "Смотреть мероприятия",
      link: "https://dfinity.org/events",
    },
    {
      icon: <MessageCircle size={24} />,
      color: "#A855F7",
      title: "Discord-сервер",
      description:
        "Общайтесь в реальном времени с 50 000+ строителями ICP, получайте поддержку и сотрудничайте в open-source проектах.",
      cta: "Присоединиться",
      link: "https://discord.gg/cA7y6ezyE2",
    },
  ];

  return (
    <section
      id="community"
      className="py-20 px-4 sm:px-6"
      style={{ background: "rgba(17, 17, 17, 0.4)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div
            className="flex items-center gap-2 text-sm font-semibold mb-3"
            style={{ color: "#9B5DE5" }}
          >
            <Users size={16} />
            <span>СООБЩЕСТВО</span>
          </div>
          <h2
            className="font-display font-bold text-3xl"
            style={{ color: "#EAF0FF" }}
          >
            Сообщество
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#A9B4C7" }}>
            Общайтесь, сотрудничайте и развивайтесь вместе с экосистемой ICP
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glow rounded-xl p-6 flex flex-col gap-4 transition-all duration-300"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              data-ocid={`community.item.${i + 1}`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}22`, color: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <h3
                  className="font-display font-bold text-lg mb-2"
                  style={{ color: "#EAF0FF" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#A9B4C7" }}
                >
                  {card.description}
                </p>
              </div>
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: `${card.color}DD` }}
                data-ocid={`community.cta.button.${i + 1}`}
              >
                {card.cta} <ExternalLink size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const footerLinks = [
    {
      heading: "Платформа",
      links: [
        { label: "Новости", href: "#news" },
        { label: "Трейдинг", href: "#trading" },
        { label: "Сообщество", href: "#community" },
      ],
    },
    {
      heading: "Ресурсы",
      links: [
        {
          label: "Документация ICP",
          href: "https://internetcomputer.org/docs",
          external: true,
        },
        {
          label: "Блог DFINITY",
          href: "https://dfinity.org/blog",
          external: true,
        },
        {
          label: "Дашборд ICP",
          href: "https://dashboard.internetcomputer.org",
          external: true,
        },
        { label: "Гранты", href: "https://dfinity.org/grants", external: true },
      ],
    },
  ];

  return (
    <footer
      className="border-t"
      style={{ background: "#000000", borderColor: "#1f1f1f" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                }}
              >
                ICP
              </div>
              <span
                className="font-display font-bold text-lg"
                style={{ color: "#EAF0FF" }}
              >
                ICP Hub
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#A9B4C7", maxWidth: "280px" }}
            >
              Ваш портал в экосистему Internet Computer. Следите за новостями и
              отслеживайте курс ICP.
            </p>
            <div className="flex items-center gap-3">
              {[
                {
                  icon: <Github size={18} />,
                  href: "https://github.com/dfinity",
                  label: "GitHub",
                },
                {
                  icon: <MessageCircle size={18} />,
                  href: "https://discord.gg/cA7y6ezyE2",
                  label: "Discord",
                },
                {
                  icon: <Send size={18} />,
                  href: "https://t.me/dfinity",
                  label: "Telegram",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{
                    background: "#111111",
                    color: "#A9B4C7",
                    border: "1px solid #1f1f1f",
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4
                className="font-semibold text-sm mb-4"
                style={{ color: "#EAF0FF" }}
              >
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "#A9B4C7" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "#1f1f1f" }}
        >
          <p className="text-xs" style={{ color: "#A9B4C7" }}>
            © {year} ICP Hub. Работает на Internet Computer.
          </p>
          <p className="text-xs" style={{ color: "#A9B4C7" }}>
            Сделано с ❤️ на{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "#A855F7" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── UserProfileModal ─────────────────────────────────────────────────────────

interface UserProfileModalProps {
  principal: Principal | null;
  onClose: () => void;
}

function UserProfileModal({ principal, onClose }: UserProfileModalProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<{
    displayName: string;
    bio: string;
  } | null>(null);
  const [friendStatus, setFriendStatus] = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const myPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = principal && myPrincipal === principal.toString();

  useEffect(() => {
    if (!principal || !actor) return;
    setLoading(true);
    const a = actor;
    const profilePromise = a.getUserProfile(principal).then((res: any) => {
      const p = res ?? null;
      setProfile(p ?? null);
    });
    const statusPromise = identity
      ? a.getFriendStatus(principal).then(setFriendStatus)
      : Promise.resolve();
    Promise.all([profilePromise, statusPromise]).finally(() =>
      setLoading(false),
    );
  }, [principal, actor, identity]);

  const handleFriendAction = async () => {
    if (!actor || !principal) return;
    setActionLoading(true);
    try {
      const a = actor;
      if (friendStatus === "none") {
        await a.sendFriendRequest(principal);
        setFriendStatus("pending_sent");
      } else if (friendStatus === "pending_received") {
        await a.acceptFriendRequest(principal);
        setFriendStatus("friends");
      } else if (friendStatus === "friends") {
        await a.removeFriend(principal);
        setFriendStatus("none");
      }
    } catch (_) {}
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!actor || !principal) return;
    setActionLoading(true);
    try {
      await actor.rejectFriendRequest(principal);
      setFriendStatus("none");
    } catch (_) {}
    setActionLoading(false);
  };

  const displayName =
    profile?.displayName ||
    (principal ? `${principal.toString().slice(0, 8)}...` : "");

  return (
    <Dialog open={!!principal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "#131D2E",
          border: "1px solid #1f1f1f",
          color: "#EAF0FF",
        }}
        data-ocid="user_profile.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#EAF0FF" }}>
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="user_profile.loading_state"
          >
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "#A855F7", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                }}
              >
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#EAF0FF" }}>
                  {displayName}
                </p>
                <p className="text-xs font-mono" style={{ color: "#4A5A6F" }}>
                  {principal?.toString().slice(0, 20)}...
                </p>
              </div>
            </div>
            {profile?.bio && (
              <p className="text-sm" style={{ color: "#A9B4C7" }}>
                {profile.bio}
              </p>
            )}
            {!isOwnProfile && identity && (
              <div className="flex gap-2 mt-1">
                {friendStatus === "pending_received" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleFriendAction}
                      disabled={actionLoading}
                      className="flex-1 text-sm font-semibold py-2 rounded-xl text-white disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                      }}
                      data-ocid="user_profile.confirm_button"
                    >
                      {actionLoading ? "..." : "Принять"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 text-sm py-2 rounded-xl disabled:opacity-50"
                      style={{ border: "1px solid #1f1f1f", color: "#A9B4C7" }}
                      data-ocid="user_profile.cancel_button"
                    >
                      {actionLoading ? "..." : "Отклонить"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleFriendAction}
                    disabled={actionLoading || friendStatus === "pending_sent"}
                    className="flex-1 text-sm font-semibold py-2 rounded-xl text-white disabled:opacity-50"
                    style={{
                      background:
                        friendStatus === "friends"
                          ? "rgba(239,68,68,0.15)"
                          : "linear-gradient(135deg, #7C3AED, #A855F7)",
                      border:
                        friendStatus === "friends"
                          ? "1px solid rgba(239,68,68,0.3)"
                          : "none",
                      color: friendStatus === "friends" ? "#EF4444" : "white",
                    }}
                    data-ocid="user_profile.primary_button"
                  >
                    {actionLoading
                      ? "..."
                      : friendStatus === "none"
                        ? "Добавить в друзья"
                        : friendStatus === "pending_sent"
                          ? "Запрос отправлен"
                          : "Удалить из друзей"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── MyProfileModal ───────────────────────────────────────────────────────────

interface MyProfileModalProps {
  open: boolean;
  onClose: () => void;
}

function MyProfileModal({ open, onClose }: MyProfileModalProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<
    {
      principal: Principal;
      profile: { displayName: string; bio: string } | null;
    }[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<
    {
      principal: Principal;
      profile: { displayName: string; bio: string } | null;
    }[]
  >([]);
  const [viewProfile, setViewProfile] = useState<Principal | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!open || !actor || !identity) return;
    setLoading(true);
    const profileP = actor.getMyProfile().then((res) => {
      const p = res ?? null;
      if (p) {
        setDisplayName(p.displayName || "");
        setBio(p.bio || "");
      }
    });
    const friendsP = actor.getFriends().then(async (principals: any[]) => {
      const items = await Promise.all(
        principals.map(async (pr: any) => {
          const res = await actor.getUserProfile(pr);
          const prof = res ?? null;
          return { principal: pr, profile: prof ?? null };
        }),
      );
      setFriends(items);
    });
    const pendingP = actor
      .getPendingFriendRequests()
      .then(async (principals: any[]) => {
        const items = await Promise.all(
          principals.map(async (pr: any) => {
            const res = await actor.getUserProfile(pr);
            const prof = res ?? null;
            return { principal: pr, profile: prof ?? null };
          }),
        );
        setPendingRequests(items);
      });
    Promise.all([profileP, friendsP, pendingP]).finally(() =>
      setLoading(false),
    );
  }, [open, actor, identity]);

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.setProfile(displayName.trim(), bio.trim());
      setEditMode(false);
    } catch (_) {}
    setSaving(false);
  };

  const handleAccept = async (pr: Principal) => {
    if (!actor) return;
    try {
      await actor.acceptFriendRequest(pr);
      const res = await actor.getUserProfile(pr);
      const prof = res ?? null;
      setFriends((prev) => [...prev, { principal: pr, profile: prof ?? null }]);
      setPendingRequests((prev) =>
        prev.filter((r) => r.principal.toString() !== pr.toString()),
      );
    } catch (_) {}
  };

  const handleReject = async (pr: Principal) => {
    if (!actor) return;
    try {
      await actor.rejectFriendRequest(pr);
      setPendingRequests((prev) =>
        prev.filter((r) => r.principal.toString() !== pr.toString()),
      );
    } catch (_) {}
  };

  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="sm:max-w-lg max-h-[80vh] overflow-y-auto"
          style={{
            background: "#131D2E",
            border: "1px solid #1f1f1f",
            color: "#EAF0FF",
          }}
          data-ocid="my_profile.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#EAF0FF" }}>Мой профиль</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="my_profile.loading_state"
            >
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "#A855F7",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                  }}
                >
                  {(displayName || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: "#EAF0FF" }}
                  >
                    {displayName || "Без имени"}
                  </p>
                  <p
                    className="text-xs font-mono truncate"
                    style={{ color: "#4A5A6F" }}
                  >
                    {myPrincipal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  style={{ border: "1px solid #1f1f1f", color: "#A9B4C7" }}
                  data-ocid="my_profile.edit_button"
                >
                  {editMode ? "Отмена" : "Изменить"}
                </button>
              </div>

              {editMode && (
                <div
                  className="flex flex-col gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <div>
                    <span
                      className="text-xs font-medium mb-1 block"
                      style={{ color: "#A9B4C7" }}
                    >
                      Никнейм
                    </span>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ваш никнейм..."
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                      style={{
                        background: "#111111",
                        color: "#EAF0FF",
                        border: "1px solid #1f1f1f",
                      }}
                      data-ocid="my_profile.input"
                    />
                  </div>
                  <div>
                    <span
                      className="text-xs font-medium mb-1 block"
                      style={{ color: "#A9B4C7" }}
                    >
                      О себе (необязательно)
                    </span>
                    <textarea
                      id="my-profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Расскажите о себе..."
                      rows={3}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                      style={{
                        background: "#111111",
                        color: "#EAF0FF",
                        border: "1px solid #1f1f1f",
                      }}
                      data-ocid="my_profile.textarea"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !displayName.trim()}
                    className="text-sm font-semibold py-2 rounded-xl text-white disabled:opacity-50 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    }}
                    data-ocid="my_profile.save_button"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              )}

              {!editMode && bio && (
                <p className="text-sm" style={{ color: "#A9B4C7" }}>
                  {bio}
                </p>
              )}

              {pendingRequests.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "#2BC4B4" }}
                  >
                    Запросы в друзья ({pendingRequests.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {pendingRequests.map((req, i) => (
                      <div
                        key={req.principal.toString()}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{
                          background: "rgba(43,196,180,0.07)",
                          border: "1px solid rgba(43,196,180,0.15)",
                        }}
                        data-ocid={`my_profile.item.${i + 1}`}
                      >
                        <button
                          type="button"
                          className="flex-1 text-left text-sm font-medium truncate hover:underline"
                          style={{ color: "#EAF0FF" }}
                          onClick={() => setViewProfile(req.principal)}
                        >
                          {req.profile?.displayName ||
                            `${req.principal.toString().slice(0, 8)}...`}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(req.principal)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold text-white shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #7C3AED, #A855F7)",
                          }}
                          data-ocid="my_profile.confirm_button"
                        >
                          Принять
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.principal)}
                          className="text-xs px-2 py-1 rounded-lg shrink-0"
                          style={{
                            border: "1px solid #1f1f1f",
                            color: "#A9B4C7",
                          }}
                          data-ocid="my_profile.cancel_button"
                        >
                          Отклонить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#A855F7" }}
                >
                  Друзья ({friends.length})
                </p>
                {friends.length === 0 ? (
                  <p
                    className="text-sm"
                    style={{ color: "#4A5A6F" }}
                    data-ocid="my_profile.empty_state"
                  >
                    Друзей пока нет
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {friends.map((fr, i) => (
                      <button
                        type="button"
                        key={fr.principal.toString()}
                        onClick={() => setViewProfile(fr.principal)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors w-full"
                        data-ocid={`my_profile.item.${i + 1}`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #7C3AED, #A855F7)",
                          }}
                        >
                          {(fr.profile?.displayName || "?")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                        <span
                          className="text-sm truncate"
                          style={{ color: "#EAF0FF" }}
                        >
                          {fr.profile?.displayName ||
                            `${fr.principal.toString().slice(0, 8)}...`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {viewProfile && (
        <UserProfileModal
          principal={viewProfile}
          onClose={() => setViewProfile(null)}
        />
      )}
    </>
  );
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Principal | null>(
    null,
  );
  const [bio, setBio] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const fetchMessages = useCallback(async () => {
    if (!actor) return;
    try {
      const msgs = await actor.getChatMessages();
      setMessages(msgs);
    } catch (_) {}
  }, [actor]);

  // Poll messages when open
  useEffect(() => {
    if (!open || !actor) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [open, actor, fetchMessages]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll when messages change
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  // Check display name when opening as logged-in user
  useEffect(() => {
    if (!open || !identity || !actor) return;
    actor
      .getMyProfile()
      .then((profile) => {
        if (!profile || !profile.displayName) {
          setShowNamePrompt(true);
        }
      })
      .catch(() => {});
  }, [open, identity, actor]);

  const handleSaveName = async () => {
    if (!actor || !displayName.trim()) return;
    setSavingName(true);
    try {
      await actor.setProfile(displayName.trim(), bio.trim());
      setShowNamePrompt(false);
    } catch (_) {}
    setSavingName(false);
  };

  const handleSend = async () => {
    if (!actor || !text.trim() || sending) return;
    setSending(true);
    try {
      await actor.sendChatMessage(text.trim());
      setText("");
      await fetchMessages();
    } catch (_) {}
    setSending(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{
              width: 380,
              height: 500,
              background: "#131D2E",
              border: "1px solid #1f1f1f",
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.15)",
            }}
            data-ocid="chat.panel"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{
                background: "#0F1825",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#2BC4B4" }}
                />
                <span
                  className="font-semibold text-sm"
                  style={{ color: "#EAF0FF" }}
                >
                  Чат сообщества
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: "#A9B4C7" }}
                data-ocid="chat.close_button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Name prompt */}
            {showNamePrompt && identity && (
              <div
                className="px-4 py-3 shrink-0 flex items-center gap-2"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  borderBottom: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    placeholder="Ваш никнейм..."
                    className="w-full text-sm px-3 py-1.5 rounded-lg outline-none"
                    style={{
                      background: "#111111",
                      color: "#EAF0FF",
                      border: "1px solid #1f1f1f",
                    }}
                    data-ocid="chat.input"
                  />
                  <input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="О себе (необязательно)..."
                    className="w-full text-sm px-3 py-1.5 rounded-lg outline-none"
                    style={{
                      background: "#111111",
                      color: "#EAF0FF",
                      border: "1px solid #1f1f1f",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName || !displayName.trim()}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                  }}
                  data-ocid="chat.save_button"
                >
                  {savingName ? "..." : "Сохранить"}
                </button>
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1f1f1f transparent",
              }}
            >
              {messages.length === 0 && (
                <div
                  className="flex-1 flex items-center justify-center"
                  data-ocid="chat.empty_state"
                >
                  <p
                    className="text-sm text-center"
                    style={{ color: "#4A5A6F" }}
                  >
                    Пока нет сообщений.
                    <br />
                    Будьте первым!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={`${msg.sender.toString()}-${msg.timestamp}`}
                  className="flex flex-col gap-0.5"
                  data-ocid={`chat.item.${i + 1}`}
                >
                  <div className="flex items-baseline gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold hover:underline"
                      style={{ color: "#A855F7" }}
                      onClick={() => setSelectedProfile(msg.sender)}
                    >
                      {msg.displayName ||
                        `${msg.sender.toString().slice(0, 8)}...`}
                    </button>
                    <span className="text-xs" style={{ color: "#4A5A6F" }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#CBD5E8" }}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: "1px solid #1f1f1f" }}
            >
              {identity ? (
                <div className="flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSend()
                    }
                    placeholder="Написать сообщение..."
                    maxLength={500}
                    className="flex-1 text-sm px-3 py-2 rounded-xl outline-none transition-colors"
                    style={{
                      background: "#111111",
                      color: "#EAF0FF",
                      border: "1px solid #1f1f1f",
                    }}
                    data-ocid="chat.textarea"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="p-2 rounded-xl text-white disabled:opacity-40 transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    }}
                    data-ocid="chat.submit_button"
                  >
                    <Send size={16} />
                  </button>
                </div>
              ) : (
                <p
                  className="text-sm text-center py-1"
                  style={{ color: "#4A5A6F" }}
                >
                  <button
                    type="button"
                    onClick={() => {}}
                    className="underline"
                    style={{ color: "#A855F7" }}
                  >
                    Войдите
                  </button>
                  , чтобы написать
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg relative"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #A855F7)",
          boxShadow: "0 4px 24px rgba(124,58,237,0.5)",
        }}
        data-ocid="chat.open_modal_button"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && messages.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: "#2BC4B4", color: "#000000" }}
          >
            {messages.length > 99 ? "99+" : messages.length}
          </span>
        )}
      </motion.button>
      {selectedProfile && (
        <UserProfileModal
          principal={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = ["exchanges", "news", "trading", "community"];
    const observers: IntersectionObserver[] = [];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #000000 0%, #060606 100%)",
      }}
    >
      <TickerBar />
      <Navbar activeSection={activeSection} />
      <main style={{ paddingTop: "36px" }}>
        <HeroSection />
        <ExchangePanel />
        <TradingSection />
        <NewsSection />
        <CommunitySection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
