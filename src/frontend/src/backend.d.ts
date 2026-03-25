import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ChatMessage {
    displayName: string;
    text: string;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    displayName: string;
    bio: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getChatMessages(): Promise<Array<ChatMessage>>;
    getCurrentIcpPrice(): Promise<string>;
    getIcpPriceHistory(): Promise<string>;
    getMyProfile(): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    isCallerAdmin(): Promise<boolean>;
    sendChatMessage(text: string): Promise<void>;
    setDisplayName(displayName: string): Promise<void>;
    setProfile(displayName: string, bio: string): Promise<void>;
    getFriends(): Promise<Array<Principal>>;
    getFriendStatus(other: Principal): Promise<string>;
    getPendingFriendRequests(): Promise<Array<Principal>>;
    sendFriendRequest(to: Principal): Promise<void>;
    acceptFriendRequest(from: Principal): Promise<void>;
    rejectFriendRequest(from: Principal): Promise<void>;
    removeFriend(friend: Principal): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
