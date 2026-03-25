# ICP Hub

## Current State
Новости полностью статичные — массив NEWS захардкожен в App.tsx с 6 фиктивными статьями.
Бэкенд имеет HTTP outcalls и уже умеет делать запросы (getCurrentIcpPrice, getIcpPriceHistory).

## Requested Changes (Diff)

### Add
- Бэкенд-метод `fetchIcpNews` — делает HTTP outcalls к нескольким бесплатным RSS/API источникам и возвращает массив новостей [{title, excerpt, date, source, link}]
- Источники: Reddit r/dfinity (RSS), Reddit r/InternetComputer (RSS), DFINITY Blog (Medium RSS), CoinDesk (RSS с фильтром ICP), CryptoSlate (RSS), ICP.news (RSS)
- Кэширование новостей в памяти на 10 минут (Timer)
- Frontend хук `useIcpNews` — запрашивает `fetchIcpNews` с бэкенда при загрузке
- Кнопка «Обновить» в секции новостей
- Фильтр по источнику (All / Reddit / DFINITY / Media)
- Счётчик и дата последнего обновления

### Modify
- NewsSection — вместо статичного массива NEWS использует данные с бэкенда
- Показывает skeleton-загрузку пока идёт запрос
- При ошибке — fallback на статичные новости

### Remove
- Статичный массив NEWS из App.tsx (заменяется динамическими данными)

## Implementation Plan
1. Добавить `fetchIcpNews` в main.mo: делает outcalls к 4+ RSS источникам, парсит XML/JSON текстом, возвращает `[{title; excerpt; date; source; link; gradient}]`
2. Обновить backend.d.ts с новым типом NewsItem и методом
3. Обновить NewsSection в App.tsx: хук для загрузки, skeleton, фильтры, кнопка refresh, timestamp
