import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Github,
  Hash,
  Menu,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  TrendingUp,
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

const COURSES = [
  {
    title: "Основы разработки на ICP",
    level: "Начальный",
    duration: "8 часов",
    rating: 4.8,
    students: 12400,
    description:
      "Изучите Motoko, задеплойте первый контейнер и поймите архитектуру Internet Computer.",
    link: "https://internetcomputer.org/docs/current/developer-docs/getting-started/overview-of-icp",
    color: "#7C3AED",
    icon: "🧱",
  },
  {
    title: "DeFi на Internet Computer",
    level: "Средний",
    duration: "12 часов",
    rating: 4.7,
    students: 8200,
    description:
      "Создавайте децентрализованные финансовые приложения с технологией Chain Fusion и управлением SNS.",
    link: "https://internetcomputer.org/defi",
    color: "#2BC4B4",
    icon: "💰",
  },
  {
    title: "Chain Fusion и интеграция Bitcoin",
    level: "Продвинутый",
    duration: "10 часов",
    rating: 4.9,
    students: 5600,
    description:
      "Глубокое погружение в интеграцию Bitcoin, ckBTC и кросс-чейн dApps на пороговой ECDSA.",
    link: "https://internetcomputer.org/bitcoin-integration",
    color: "#4CC9F0",
    icon: "₿",
  },
  {
    title: "Смарт-контракты на Motoko",
    level: "Средний",
    duration: "6 часов",
    rating: 4.6,
    students: 9800,
    description:
      "Пишите, тестируйте и деплойте production-ready смарт-контракты на Motoko — нативном языке ICP.",
    link: "https://motoko-book.dev/",
    color: "#A855F7",
    icon: "📜",
  },
  {
    title: "Идентификация и авторизация ICP",
    level: "Начальный",
    duration: "4 часа",
    rating: 4.5,
    students: 15000,
    description:
      "Внедрите Internet Identity, Web3-аутентификацию и самосуверенную идентичность в ваших dApps.",
    link: "https://internetcomputer.org/internet-identity",
    color: "#F5C542",
    icon: "🔐",
  },
  {
    title: "SNS и DAO-управление",
    level: "Продвинутый",
    duration: "14 часов",
    rating: 4.8,
    students: 4200,
    description:
      "Запустите Service Nervous System, токенизируйте ваш dApp и создайте полностью on-chain DAO.",
    link: "https://internetcomputer.org/sns",
    color: "#22C55E",
    icon: "🗳️",
  },
];

const NEWS = [
  {
    title: "ICP превысил 1 миллиард транзакций на блокчейне",
    date: "24 мар 2026",
    source: "ICP.news",
    excerpt:
      "Блокчейн Internet Computer достиг важной вехи — обработано более миллиарда полностью on-chain транзакций.",
    link: "https://icp.news",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4CC9F0 100%)",
  },
  {
    title: "DFINITY объявляет о Chain Fusion v2",
    date: "22 мар 2026",
    source: "DFINITY Blog",
    excerpt:
      "Технология Chain Fusion получила крупное обновление, обеспечивающее бесшовную совместимость с Ethereum, Bitcoin и Solana.",
    link: "https://dfinity.org/blog",
    gradient: "linear-gradient(135deg, #2BC4B4 0%, #7C3AED 100%)",
  },
  {
    title: "Программа грантов ICP удвоила финансирование",
    date: "20 мар 2026",
    source: "ICP Dashboard",
    excerpt:
      "Фонд DFINITY удвоил пул грантов разработчиков до $100M, поддерживая 500+ активных проектов на ICP.",
    link: "https://dfinity.org/grants",
    gradient: "linear-gradient(135deg, #A855F7 0%, #2BC4B4 100%)",
  },
  {
    title: "Internet Identity теперь поддерживает Passkeys",
    date: "18 мар 2026",
    source: "ICP.news",
    excerpt:
      "Web3-аутентификация стала проще: Internet Identity интегрировала поддержку WebAuthn passkey во всех браузерах.",
    link: "https://icp.news",
    gradient: "linear-gradient(135deg, #4CC9F0 0%, #A855F7 100%)",
  },
  {
    title: "Новый DEX на ICP достиг $50M TVL за первую неделю",
    date: "15 мар 2026",
    source: "CoinDesk",
    excerpt:
      "ICPSwap v3 запустился с пулами сконцентрированной ликвидности и набрал $50M TVL в рекордные сроки.",
    link: "https://coindesk.com",
    gradient: "linear-gradient(135deg, #22C55E 0%, #4CC9F0 100%)",
  },
  {
    title: "DFINITY Foundation вступила в Hyperledger",
    date: "12 мар 2026",
    source: "DFINITY Blog",
    excerpt:
      "DFINITY стала премиум-членом Hyperledger Foundation, принося on-chain управление ICP в корпоративный сектор.",
    link: "https://dfinity.org/blog",
    gradient: "linear-gradient(135deg, #F5C542 0%, #7C3AED 100%)",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Начальный: "#22C55E",
  Средний: "#F5C542",
  Продвинутый: "#EF4444",
};

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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(rating) ? "#F5C542" : "none"}
          stroke="#F5C542"
        />
      ))}
      <span style={{ color: "#F5C542" }} className="text-xs ml-1 font-semibold">
        {rating}
      </span>
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
        background: "#080F1A",
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
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;
  const navLinks = [
    { label: "Курсы", href: "#courses" },
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
    <nav
      className="fixed left-0 right-0 z-40"
      style={{
        top: "36px",
        background: "rgba(11, 18, 32, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2A3A52",
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
                <span
                  className="text-xs font-mono px-3 py-1.5 rounded-full"
                  style={{
                    color: "#A855F7",
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(168,85,247,0.3)",
                  }}
                >
                  {shortPrincipal}
                </span>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-90"
                  style={{ color: "#A9B4C7", border: "1px solid #2A3A52" }}
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
                  style={{ color: "#A9B4C7", border: "1px solid #2A3A52" }}
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
          style={{ background: "#121A2A", borderTop: "1px solid #2A3A52" }}
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
                  <span
                    className="flex-1 text-xs font-mono text-center py-2 rounded-full"
                    style={{
                      color: "#A855F7",
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(168,85,247,0.3)",
                    }}
                  >
                    {shortPrincipal}
                  </span>
                  <button
                    type="button"
                    onClick={clear}
                    className="flex-1 text-sm py-2 rounded-full"
                    style={{ color: "#A9B4C7", border: "1px solid #2A3A52" }}
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
                    style={{ color: "#A9B4C7", border: "1px solid #2A3A52" }}
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
                href="#courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90 hover:shadow-glow"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                }}
                data-ocid="hero.start_learning.button"
              >
                Начать обучение <ChevronRight size={16} />
              </a>
              <a
                href="#trading"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all"
                style={{ color: "#2BC4B4", border: "2px solid #2BC4B4" }}
                data-ocid="hero.view_chart.button"
              >
                Смотреть график <TrendingUp size={16} />
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { value: "6+", label: "Курсов" },
                { value: "55К+", label: "Студентов" },
                { value: "100%", label: "Онлайн" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-display font-bold"
                    style={{ color: "#EAF0FF" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "#A9B4C7" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
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
                  border: "1px solid #2A3A52",
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
      style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
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
          style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
          data-ocid="exchanges.comparison.table"
        >
          <div className="p-4 border-b" style={{ borderColor: "#2A3A52" }}>
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
                <tr style={{ borderBottom: "1px solid #2A3A52" }}>
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
          style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
        >
          {/* Price header */}
          <div className="p-6 border-b" style={{ borderColor: "#2A3A52" }}>
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
                    stroke="#2A3A52"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#2A3A52"
                    tick={{ fill: "#A9B4C7", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#2A3A52"
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
                      border: "1px solid #2A3A52",
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
            style={{ borderColor: "#2A3A52" }}
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
                style={{ borderColor: "#2A3A52" }}
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

function CoursesSection() {
  return (
    <section id="courses" className="py-20 px-4 sm:px-6">
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
            style={{ color: "#A855F7" }}
          >
            <BookOpen size={16} />
            <span>ОБУЧЕНИЕ</span>
          </div>
          <h2
            className="font-display font-bold text-3xl"
            style={{ color: "#EAF0FF" }}
          >
            Курсы по ICP
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#A9B4C7" }}>
            Всё необходимое для разработки на Internet Computer
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow rounded-xl flex flex-col overflow-hidden transition-all duration-300"
              style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
              data-ocid={`courses.item.${i + 1}`}
            >
              <div
                className="h-1 w-full"
                style={{ background: course.color }}
              />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: `${course.color}22` }}
                  >
                    {course.icon}
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `${LEVEL_COLORS[course.level]}22`,
                      color: LEVEL_COLORS[course.level],
                    }}
                  >
                    {course.level}
                  </span>
                </div>

                <h3
                  className="font-display font-bold text-base mb-2 leading-snug"
                  style={{ color: "#EAF0FF" }}
                >
                  {course.title}
                </h3>
                <p
                  className="text-xs leading-relaxed mb-4 flex-1"
                  style={{ color: "#A9B4C7" }}
                >
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <StarRating rating={course.rating} />
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "#A9B4C7" }}
                  >
                    <Clock size={11} />
                    {course.duration}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs mb-4"
                  style={{ color: "#A9B4C7" }}
                >
                  <Users size={11} />
                  <span>
                    {course.students.toLocaleString("ru-RU")} студентов
                  </span>
                </div>

                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: `${course.color}DD` }}
                  data-ocid={`courses.enroll.button.${i + 1}`}
                >
                  Записаться <ChevronRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section
      id="news"
      className="py-20 px-4 sm:px-6"
      style={{ background: "rgba(26, 36, 51, 0.4)" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <div
              className="flex items-center gap-2 text-sm font-semibold mb-3"
              style={{ color: "#2BC4B4" }}
            >
              <Hash size={16} />
              <span>ПОСЛЕДНЕЕ</span>
            </div>
            <h2
              className="font-display font-bold text-3xl"
              style={{ color: "#EAF0FF" }}
            >
              Новости ICP
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEWS.map((article, i) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow rounded-xl flex flex-col overflow-hidden transition-all duration-300"
              style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
              data-ocid={`news.item.${i + 1}`}
            >
              <div
                className="h-36 w-full"
                style={{ background: article.gradient }}
              />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(43,196,180,0.15)",
                      color: "#2BC4B4",
                    }}
                  >
                    {article.source}
                  </span>
                  <span className="text-xs" style={{ color: "#A9B4C7" }}>
                    {article.date}
                  </span>
                </div>
                <h3
                  className="font-display font-bold text-sm leading-snug mb-2"
                  style={{ color: "#EAF0FF" }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-xs leading-relaxed mb-4 flex-1"
                  style={{ color: "#A9B4C7" }}
                >
                  {article.excerpt}
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold transition-all hover:gap-2"
                  style={{ color: "#2BC4B4" }}
                  data-ocid={`news.read_more.link.${i + 1}`}
                >
                  Читать далее <ChevronRight size={13} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-right mt-6">
          <a
            href="https://icp.news"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "#2BC4B4" }}
            data-ocid="news.view_all.link"
          >
            Все новости <ExternalLink size={14} />
          </a>
        </div>
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
      style={{ background: "rgba(26, 36, 51, 0.4)" }}
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
              style={{ background: "#1A2433", border: "1px solid #2A3A52" }}
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
        { label: "Курсы", href: "#courses" },
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
      style={{ background: "#0B1220", borderColor: "#2A3A52" }}
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
              Ваш портал в экосистему Internet Computer. Учитесь, следите за
              новостями и отслеживайте курс ICP.
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
                    background: "#1A2433",
                    color: "#A9B4C7",
                    border: "1px solid #2A3A52",
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
          style={{ borderColor: "#2A3A52" }}
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
        if (profile && "__kind__" in profile && profile.__kind__ === "None") {
          setShowNamePrompt(true);
        } else if (
          profile &&
          "__kind__" in profile &&
          profile.__kind__ === "Some"
        ) {
          const p = (
            profile as unknown as {
              __kind__: "Some";
              value: { displayName: string };
            }
          ).value;
          if (!p.displayName) setShowNamePrompt(true);
        }
      })
      .catch(() => {});
  }, [open, identity, actor]);

  const handleSaveName = async () => {
    if (!actor || !displayName.trim()) return;
    setSavingName(true);
    try {
      await actor.setDisplayName(displayName.trim());
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
              border: "1px solid #2A3A52",
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
                borderBottom: "1px solid #2A3A52",
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
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  placeholder="Введите ваше имя..."
                  className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none"
                  style={{
                    background: "#1A2433",
                    color: "#EAF0FF",
                    border: "1px solid #2A3A52",
                  }}
                  data-ocid="chat.input"
                />
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
                scrollbarColor: "#2A3A52 transparent",
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
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#A855F7" }}
                    >
                      {msg.displayName ||
                        `${msg.sender.toString().slice(0, 8)}...`}
                    </span>
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
              style={{ borderTop: "1px solid #2A3A52" }}
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
                      background: "#1A2433",
                      color: "#EAF0FF",
                      border: "1px solid #2A3A52",
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
            style={{ background: "#2BC4B4", color: "#0B1220" }}
          >
            {messages.length > 99 ? "99+" : messages.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = ["exchanges", "courses", "news", "trading", "community"];
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
        background: "linear-gradient(180deg, #0B1220 0%, #121A2A 100%)",
      }}
    >
      <TickerBar />
      <Navbar activeSection={activeSection} />
      <main style={{ paddingTop: "36px" }}>
        <HeroSection />
        <ExchangePanel />
        <TradingSection />
        <CoursesSection />
        <NewsSection />
        <CommunitySection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
