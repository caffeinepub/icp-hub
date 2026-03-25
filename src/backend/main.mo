import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getCurrentIcpPrice() : async Text {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd,btc&include_24hr_change=true";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getIcpPriceHistory() : async Text {
    let url = "https://api.coingecko.com/api/v3/coins/internet-computer/market_chart?vs_currency=usd&days=7";
    await OutCall.httpGetRequest(url, [], transform);
  };

  // ============ PROFILES ============

  public type UserProfile = {
    displayName : Text;
    bio : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  // Migration: keep displayNames from previous version, migrate to userProfiles
  let displayNames = Map.empty<Principal, Text>();

  public shared ({ caller }) func setProfile(displayName : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profiles");
    };
    userProfiles.add(caller, { displayName; bio });
  };

  public shared ({ caller }) func setDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set display names");
    };
    let bio = switch (userProfiles.get(caller)) {
      case (null) { "" };
      case (?p) { p.bio };
    };
    userProfiles.add(caller, { displayName; bio });
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public query func getAllUsers() : async [(Principal, UserProfile)] {
    userProfiles.toArray();
  };

  // ============ FRIENDS ============
  // friendships: sorted key "p1:p2" -> true
  let friendships = Map.empty<Text, Bool>();
  // friendRequests: "from:to" -> true
  let pendingRequests = Map.empty<Text, Bool>();

  func makeKey(a : Principal, b : Principal) : Text {
    let ta = a.toText();
    let tb = b.toText();
    if (ta < tb) { ta # ":" # tb } else { tb # ":" # ta };
  };

  func requestKey(from : Principal, to : Principal) : Text {
    from.toText() # "|" # to.toText();
  };

  public shared ({ caller }) func sendFriendRequest(to : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (Principal.equal(caller, to)) {
      Runtime.trap("Cannot add yourself");
    };
    pendingRequests.add(requestKey(caller, to), true);
  };

  public shared ({ caller }) func acceptFriendRequest(from : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    pendingRequests.remove(requestKey(from, caller));
    friendships.add(makeKey(caller, from), true);
  };

  public shared ({ caller }) func rejectFriendRequest(from : Principal) : async () {
    pendingRequests.remove(requestKey(from, caller));
  };

  public shared ({ caller }) func removeFriend(friend : Principal) : async () {
    friendships.remove(makeKey(caller, friend));
  };

  public query ({ caller }) func getFriends() : async [Principal] {
    let result = List.empty<Principal>();
    let all = userProfiles.toArray();
    for ((p, _) in all.values()) {
      if (not Principal.equal(p, caller)) {
        if (friendships.get(makeKey(caller, p)) == ?true) {
          result.add(p);
        };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getPendingFriendRequests() : async [Principal] {
    let result = List.empty<Principal>();
    let all = userProfiles.toArray();
    for ((p, _) in all.values()) {
      if (not Principal.equal(p, caller)) {
        if (pendingRequests.get(requestKey(p, caller)) == ?true) {
          result.add(p);
        };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getFriendStatus(other : Principal) : async Text {
    if (friendships.get(makeKey(caller, other)) == ?true) return "friends";
    if (pendingRequests.get(requestKey(caller, other)) == ?true) return "pending_sent";
    if (pendingRequests.get(requestKey(other, caller)) == ?true) return "pending_received";
    return "none";
  };

  // ============ CHAT ============

  type ChatMessage = {
    sender : Principal;
    displayName : Text;
    text : Text;
    timestamp : Time.Time;
  };

  let chatMessages = List.empty<ChatMessage>();
  var nextMessageId = 0;

  public shared ({ caller }) func sendChatMessage(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send chat messages");
    };
    let displayName = switch (userProfiles.get(caller)) {
      case (null) { "anonymous" };
      case (?profile) { profile.displayName };
    };

    let newMessage : ChatMessage = {
      sender = caller;
      displayName;
      text;
      timestamp = Time.now();
    };

    chatMessages.add(newMessage);
    nextMessageId += 1;

    if (chatMessages.size() > 100) {
      let dropCount = chatMessages.size() - 100;
      let remainingMessages = chatMessages.toArray().sliceToArray(dropCount, chatMessages.size());
      chatMessages.clear();
      chatMessages.addAll(remainingMessages.values());
    };
  };

  public query ({ caller }) func getChatMessages() : async [ChatMessage] {
    chatMessages.toArray();
  };

  // Migrate old displayNames -> userProfiles on upgrade
  system func postupgrade() {
    for ((p, name) in displayNames.entries()) {
      if (userProfiles.get(p) == null) {
        userProfiles.add(p, { displayName = name; bio = "" });
      };
    };
    displayNames.clear();
  };
};
