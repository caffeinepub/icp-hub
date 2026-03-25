import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
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

  type ChatMessage = {
    sender : Principal;
    displayName : Text;
    text : Text;
    timestamp : Time.Time;
  };

  let chatMessages = List.empty<ChatMessage>();
  var nextMessageId = 0;

  public type UserProfile = {
    displayName : Text;
  };

  let displayNames = Map.empty<Principal, Text>();

  public shared ({ caller }) func setDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set display names");
    };
    displayNames.add(caller, displayName);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    getUserProfileHelper(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    getUserProfileHelper(user);
  };

  func getUserProfileHelper(user : Principal) : ?UserProfile {
    switch (displayNames.get(user)) {
      case (null) { null };
      case (?name) {
        ?{
          displayName = name;
        };
      };
    };
  };

  public shared ({ caller }) func sendChatMessage(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send chat messages");
    };
    let displayName = switch (displayNames.get(caller)) {
      case (null) { "anonymous" };
      case (?name) { name };
    };

    let newMessage : ChatMessage = {
      sender = caller;
      displayName;
      text;
      timestamp = Time.now();
    };

    chatMessages.add(newMessage);
    nextMessageId += 1;

    // Keep only the last 100 messages
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
};
