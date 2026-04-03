# ICP Hub

## Current State
Агрегатор новостей использует единственный CORS-прокси `allorigins.win` для RSS-источников. Это вызывает зависания — прокси нестабилен и блокирует многие запросы. Текущий `useIcpNews` hook загружает все источники при монтировании и показывает максимум 30 статей без возможности загрузить больше.

## Requested Changes (Diff)

### Add
- Ротация CORS-прокси: несколько прокси-серверов (allorigins, corsproxy.io, cors.sh, rss2json API) — если один не работает, автоматически пробуем следующий
- Кнопка «Загрузить ещё» (пагинация): первая порция 12 статей, по кнопке ещё +12
- Расширенный список источников: 15+ источников (Reddit r/dfinity, r/InternetComputer, r/CryptoCurrency с фильтром ICP; DFINITY Blog/Medium; icp.news; forum.dfinity.org; CoinDesk; Cointelegraph; CryptoSlate; Decrypt; BeInCrypto; CoinJournal; The Defiant; Bankless; Messari; CoinGecko Blog)
- rss2json.com как дополнительный прокси-метод для части источников
- Индикатор количества загруженных/доступных источников

### Modify
- `useIcpNews` hook: хранить все загруженные статьи, показывать только `page * PAGE_SIZE` штук
- `fetchViaProxy`: попробовать несколько прокси последовательно при ошибке
- `parseRssXml`: улучшить парсинг дат и excerpts
- `NewsSection`: добавить кнопку «Загрузить ещё» под сеткой статей
- Убрать жёсткий лимит 30 статей, держать все загруженные

### Remove
- Зависимость от единственного `allorigins.win`

## Implementation Plan
1. Заменить `fetchViaProxy` на `fetchViaProxyWithFallback` — перебирает 4 прокси по очереди
2. Добавить rss2json.com как один из методов получения RSS
3. Расширить `RSS_SOURCES` до 15+ источников
4. В `useIcpNews` хранить `allNews[]`, добавить `visibleCount` (начало = 12, +12 на каждый клик «ещё»)
5. В `NewsSection` добавить кнопку «Загрузить ещё новости» с состоянием загрузки
6. Счётчик в заголовке: «Показано X из Y · из N источников»
