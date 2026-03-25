# ICP Hub

## Current State
The app has Internet Identity auth, chat with display names, ICP price charts from multiple exchanges. Backend has: setDisplayName, getMyProfile, getUserProfile (by Principal), sendChatMessage, getChatMessages, HTTP outcalls for price data.

## Requested Changes (Diff)

### Add
- Extended user profile: displayName, bio, avatarUrl (optional)
- Friends system: sendFriendRequest, acceptFriendRequest, removeFriend, getFriends, getPendingFriendRequests
- Get all users list (for friend discovery)
- Profile page (own) with inline editing of nickname and bio
- Modal to view any user's public profile from chat (click on username)
- Friends tab/section showing accepted friends and pending requests
- In chat: clicking username opens profile modal with "Add Friend" / "Remove Friend" button

### Modify
- UserProfile type: add bio field
- setDisplayName → setProfile (accepts displayName + bio)

### Remove
- Nothing removed

## Implementation Plan
1. Update main.mo: extend UserProfile with bio, add FriendRequest/FriendStatus types, add sendFriendRequest, acceptFriendRequest, removeFriend, getFriends, getPendingRequests, getAllUsers
2. Regenerate Motoko bindings
3. Frontend: add Profile page/modal with edit form, UserProfileModal component triggered from chat username clicks, Friends panel with pending/accepted lists
