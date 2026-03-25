# ICP Hub

## Current State
- Single-page ICP Hub with real-time price tracking (Binance, Bybit, Huobi), courses, news, community sections
- Backend: HTTP outcalls for CoinGecko price data
- Login/Registration buttons exist in navbar but have no functionality (no modal, no auth wiring)
- No chat feature exists

## Requested Changes (Diff)

### Add
- Internet Identity authentication via `authorization` component
- Login/Registration modal (or inline flow) that actually authenticates users using Internet Identity
- Public chat feature: authenticated users can post messages, all visitors can read them
- Backend: `sendChatMessage(text: Text)` - stores a chat message with caller principal + timestamp + username
- Backend: `getChatMessages()` - returns paginated list of recent chat messages
- Backend: `getMyProfile()` - returns current user's display name / principal
- Backend: `setDisplayName(name: Text)` - lets user set a display name shown in chat
- Chat UI section (floating widget or dedicated section) with real-time polling every 5 seconds

### Modify
- Navbar "Войти" and "Регистрация" buttons now trigger Internet Identity login flow
- After login, buttons replaced with user avatar/display name + logout option
- Navigation adds "Чат" link when user is logged in, or always visible

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with authorization component + chat messages (sendChatMessage, getChatMessages, setDisplayName, getMyProfile)
2. Wire Internet Identity login to navbar buttons using useInternetIdentity hook (already in codebase at src/frontend/src/hooks/useInternetIdentity.ts)
3. Add chat section to the page - floating chat widget in bottom-right corner or full section
4. Chat shows messages from all users, input only enabled when logged in
5. Messages include display name (or truncated principal), timestamp, message text
6. Auto-refresh messages every 5 seconds
