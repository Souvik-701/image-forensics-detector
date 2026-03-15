import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type CaseStatus = { #clean; #suspicious; #tampered };

  type ForensicsCase = {
    id : Text;
    title : Text;
    imageId : Text;
    status : CaseStatus;
    notes : Text;
    createdAt : Time.Time;
    analystId : Principal;
    findings : Text;
  };

  module ForensicsCase {
    public func compare(a : ForensicsCase, b : ForensicsCase) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let cases = Map.empty<Text, ForensicsCase>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Case management functions
  public shared ({ caller }) func createCase(title : Text, imageId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only analysts can create cases");
    };

    let id = title.concat(Time.now().toText());
    let newCase : ForensicsCase = {
      id;
      title;
      imageId;
      status = #suspicious;
      notes = "";
      createdAt = Time.now();
      analystId = caller;
      findings = "";
    };

    cases.add(id, newCase);
  };

  public shared ({ caller }) func updateCase(id : Text, status : CaseStatus, notes : Text, findings : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only analysts can update cases");
    };

    switch (cases.get(id)) {
      case (null) { Runtime.trap("Case not found") };
      case (?existingCase) {
        // Only the case owner or an admin can update the case
        if (existingCase.analystId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the case owner or an admin can update this case");
        };

        let updatedCase : ForensicsCase = {
          existingCase with
          status;
          notes;
          findings;
        };
        cases.add(id, updatedCase);
      };
    };
  };

  public shared ({ caller }) func deleteCase(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete cases");
    };

    if (not cases.containsKey(id)) {
      Runtime.trap("Case not found");
    };

    cases.remove(id);
  };

  public query ({ caller }) func getAllCases() : async [ForensicsCase] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };
    cases.values().toArray().sort();
  };

  public query ({ caller }) func getCaseById(id : Text) : async ForensicsCase {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };

    switch (cases.get(id)) {
      case (null) { Runtime.trap("Case not found") };
      case (?forensicsCase) { forensicsCase };
    };
  };
};
