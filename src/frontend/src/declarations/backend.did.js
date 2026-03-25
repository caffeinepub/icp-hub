/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const Time = IDL.Int;
export const ChatMessage = IDL.Record({
  'displayName' : IDL.Text,
  'text' : IDL.Text,
  'sender' : IDL.Principal,
  'timestamp' : Time,
});
export const UserProfile = IDL.Record({ 'displayName' : IDL.Text, 'bio' : IDL.Text });
export const http_header = IDL.Record({
  'value' : IDL.Text,
  'name' : IDL.Text,
});
export const http_request_result = IDL.Record({
  'status' : IDL.Nat,
  'body' : IDL.Vec(IDL.Nat8),
  'headers' : IDL.Vec(http_header),
});
export const TransformationInput = IDL.Record({
  'context' : IDL.Vec(IDL.Nat8),
  'response' : http_request_result,
});
export const TransformationOutput = IDL.Record({
  'status' : IDL.Nat,
  'body' : IDL.Vec(IDL.Nat8),
  'headers' : IDL.Vec(http_header),
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'acceptFriendRequest' : IDL.Func([IDL.Principal], [], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'getAllUsers' : IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, UserProfile))], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getChatMessages' : IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
  'getCurrentIcpPrice' : IDL.Func([], [IDL.Text], []),
  'getFriendStatus' : IDL.Func([IDL.Principal], [IDL.Text], ['query']),
  'getFriends' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  'getIcpPriceHistory' : IDL.Func([], [IDL.Text], []),
  'getMyProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getPendingFriendRequests' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'rejectFriendRequest' : IDL.Func([IDL.Principal], [], []),
  'removeFriend' : IDL.Func([IDL.Principal], [], []),
  'sendChatMessage' : IDL.Func([IDL.Text], [], []),
  'sendFriendRequest' : IDL.Func([IDL.Principal], [], []),
  'setDisplayName' : IDL.Func([IDL.Text], [], []),
  'setProfile' : IDL.Func([IDL.Text, IDL.Text], [], []),
  'transform' : IDL.Func([TransformationInput], [TransformationOutput], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Time = IDL.Int;
  const ChatMessage = IDL.Record({
    'displayName' : IDL.Text,
    'text' : IDL.Text,
    'sender' : IDL.Principal,
    'timestamp' : Time,
  });
  const UserProfile = IDL.Record({ 'displayName' : IDL.Text, 'bio' : IDL.Text });
  const http_header = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const http_request_result = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  const TransformationInput = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : http_request_result,
  });
  const TransformationOutput = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(http_header),
  });
  
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'acceptFriendRequest' : IDL.Func([IDL.Principal], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'getAllUsers' : IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, UserProfile))], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getChatMessages' : IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
    'getCurrentIcpPrice' : IDL.Func([], [IDL.Text], []),
    'getFriendStatus' : IDL.Func([IDL.Principal], [IDL.Text], ['query']),
    'getFriends' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getIcpPriceHistory' : IDL.Func([], [IDL.Text], []),
    'getMyProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getPendingFriendRequests' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'rejectFriendRequest' : IDL.Func([IDL.Principal], [], []),
    'removeFriend' : IDL.Func([IDL.Principal], [], []),
    'sendChatMessage' : IDL.Func([IDL.Text], [], []),
    'sendFriendRequest' : IDL.Func([IDL.Principal], [], []),
    'setDisplayName' : IDL.Func([IDL.Text], [], []),
    'setProfile' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'transform' : IDL.Func([TransformationInput], [TransformationOutput], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
