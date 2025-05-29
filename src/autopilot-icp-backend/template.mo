import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Nat32 "mo:base/Nat32";

import Types "./types";

module TemplateManager {
    
    type Template = Types.Template;
    type TemplateId = Types.TemplateId;
    type TemplateCategory = Types.TemplateCategory;
    type APIResponse<T> = Types.APIResponse<T>;
    
    public class TemplateManager() {
        
        // Storage for templates
        private var templates = HashMap.HashMap<TemplateId, Template>(0, func(a: TemplateId, b: TemplateId) : Bool { a == b }, func(a: TemplateId) : Nat32 { 
            func hash(n : Nat) : Nat32 {
                var acc : Nat32 = 0;
                var temp = n;
                while (temp > 0) {
                    acc := acc +% Nat32.fromNat(temp % 256);
                    temp := temp / 256;
                };
                acc
            };
            hash(a)
        });
        
        // Initialize with default templates
        private func initializeDefaultTemplates() {
            let defaultTemplates : [Template] = [
                {
                    id = 1;
                    name = "Simple Token";
                    description = "Basic fungible token with transfer functionality";
                    category = #DeFi;
                    language = #Motoko;
                    code = "import Debug \"mo:base/Debug\";\nimport HashMap \"mo:base/HashMap\";\nimport Principal \"mo:base/Principal\";\nimport Result \"mo:base/Result\";\n\nactor SimpleToken {\n    type Balance = Nat;\n    type Account = Principal;\n    \n    private stable var totalSupply : Balance = 1000000;\n    private stable var balanceEntries : [(Account, Balance)] = [];\n    private var balances = HashMap.HashMap<Account, Balance>(1, Principal.equal, Principal.hash);\n    \n    system func preupgrade() {\n        balanceEntries := Iter.toArray(balances.entries());\n    };\n    \n    system func postupgrade() {\n        balances := HashMap.fromIter<Account, Balance>(balanceEntries.vals(), balanceEntries.size(), Principal.equal, Principal.hash);\n        balanceEntries := [];\n    };\n    \n    public query func balanceOf(account: Account) : async Balance {\n        switch (balances.get(account)) {\n            case (?balance) { balance };\n            case null { 0 };\n        }\n    };\n    \n    public shared(msg) func transfer(to: Account, amount: Balance) : async Result.Result<(), Text> {\n        let from = msg.caller;\n        let fromBalance = switch (balances.get(from)) {\n            case (?balance) { balance };\n            case null { 0 };\n        };\n        \n        if (fromBalance < amount) {\n            return #err(\"Insufficient balance\");\n        };\n        \n        let toBalance = switch (balances.get(to)) {\n            case (?balance) { balance };\n            case null { 0 };\n        };\n        \n        balances.put(from, fromBalance - amount);\n        balances.put(to, toBalance + amount);\n        \n        #ok(())\n    };\n    \n    public query func getTotalSupply() : async Balance {\n        totalSupply\n    };\n}";
                    previewImage = null;
                    isActive = true;
                    usageCount = 0;
                    createdAt = Time.now();
                },
                {
                    id = 2;
                    name = "NFT Collection";
                    description = "Non-fungible token collection with minting capability";
                    category = #NFT;
                    language = #Motoko;
                    code = "import Debug \"mo:base/Debug\";\nimport HashMap \"mo:base/HashMap\";\nimport Principal \"mo:base/Principal\";\nimport Result \"mo:base/Result\";\nimport Nat \"mo:base/Nat\";\n\nactor NFTCollection {\n    type TokenId = Nat;\n    type Account = Principal;\n    \n    type NFT = {\n        id: TokenId;\n        owner: Account;\n        metadata: Text;\n        name: Text;\n    };\n    \n    private stable var nextTokenId : TokenId = 1;\n    private stable var nftEntries : [(TokenId, NFT)] = [];\n    private var nfts = HashMap.HashMap<TokenId, NFT>(1, func(a: TokenId, b: TokenId) : Bool { a == b }, func(a: TokenId) : Nat32 { Nat32.fromNat(a) });\n    \n    system func preupgrade() {\n        nftEntries := Iter.toArray(nfts.entries());\n    };\n    \n    system func postupgrade() {\n        nfts := HashMap.fromIter<TokenId, NFT>(nftEntries.vals(), nftEntries.size(), func(a: TokenId, b: TokenId) : Bool { a == b }, func(a: TokenId) : Nat32 { Nat32.fromNat(a) });\n        nftEntries := [];\n    };\n    \n    public shared(msg) func mint(to: Account, name: Text, metadata: Text) : async Result.Result<TokenId, Text> {\n        let tokenId = nextTokenId;\n        let nft : NFT = {\n            id = tokenId;\n            owner = to;\n            metadata = metadata;\n            name = name;\n        };\n        \n        nfts.put(tokenId, nft);\n        nextTokenId += 1;\n        \n        #ok(tokenId)\n    };\n    \n    public query func ownerOf(tokenId: TokenId) : async Result.Result<Account, Text> {\n        switch (nfts.get(tokenId)) {\n            case (?nft) { #ok(nft.owner) };\n            case null { #err(\"Token does not exist\") };\n        }\n    };\n    \n    public query func tokenMetadata(tokenId: TokenId) : async Result.Result<NFT, Text> {\n        switch (nfts.get(tokenId)) {\n            case (?nft) { #ok(nft) };\n            case null { #err(\"Token does not exist\") };\n        }\n    };\n    \n    public shared(msg) func transfer(tokenId: TokenId, to: Account) : async Result.Result<(), Text> {\n        switch (nfts.get(tokenId)) {\n            case (?nft) {\n                if (nft.owner != msg.caller) {\n                    return #err(\"Not the owner of this token\");\n                };\n                \n                let updatedNft = {\n                    nft with owner = to;\n                };\n                nfts.put(tokenId, updatedNft);\n                #ok(())\n            };\n            case null { #err(\"Token does not exist\") };\n        }\n    };\n}";
                    previewImage = null;
                    isActive = true;
                    usageCount = 0;
                    createdAt = Time.now();
                },
                {
                    id = 3;
                    name = "Simple DAO";
                    description = "Basic DAO with proposal creation and voting";
                    category = #DAO;
                    language = #Motoko;
                    code = "import Debug \"mo:base/Debug\";\nimport HashMap \"mo:base/HashMap\";\nimport Principal \"mo:base/Principal\";\nimport Result \"mo:base/Result\";\nimport Time \"mo:base/Time\";\nimport Array \"mo:base/Array\";\n\nactor SimpleDAO {\n    type Account = Principal;\n    type ProposalId = Nat;\n    \n    type Proposal = {\n        id: ProposalId;\n        title: Text;\n        description: Text;\n        proposer: Account;\n        yesVotes: Nat;\n        noVotes: Nat;\n        deadline: Int;\n        executed: Bool;\n    };\n    \n    type Vote = {\n        #Yes;\n        #No;\n    };\n    \n    private stable var nextProposalId : ProposalId = 1;\n    private stable var proposalEntries : [(ProposalId, Proposal)] = [];\n    private stable var memberEntries : [(Account, Bool)] = [];\n    private stable var voteEntries : [(Text, Bool)] = []; // (proposalId#voter, hasVoted)\n    \n    private var proposals = HashMap.HashMap<ProposalId, Proposal>(1, func(a: ProposalId, b: ProposalId) : Bool { a == b }, func(a: ProposalId) : Nat32 { Nat32.fromNat(a) });\n    private var members = HashMap.HashMap<Account, Bool>(1, Principal.equal, Principal.hash);\n    private var votes = HashMap.HashMap<Text, Bool>(1, func(a: Text, b: Text) : Bool { a == b }, func(a: Text) : Nat32 { \n        var hash : Nat32 = 0;\n        for (c in a.chars()) {\n            hash := hash +% Nat32.fromNat(Nat32.toNat(Nat32.fromIntWrap(Char.toNat32(c))));\n        };\n        hash\n    });\n    \n    public shared(msg) func addMember(member: Account) : async Result.Result<(), Text> {\n        members.put(member, true);\n        #ok(())\n    };\n    \n    public shared(msg) func createProposal(title: Text, description: Text, durationHours: Nat) : async Result.Result<ProposalId, Text> {\n        let caller = msg.caller;\n        switch (members.get(caller)) {\n            case (?_) {\n                let proposalId = nextProposalId;\n                let deadline = Time.now() + (durationHours * 3600 * 1000000000); // Convert hours to nanoseconds\n                \n                let proposal : Proposal = {\n                    id = proposalId;\n                    title = title;\n                    description = description;\n                    proposer = caller;\n                    yesVotes = 0;\n                    noVotes = 0;\n                    deadline = deadline;\n                    executed = false;\n                };\n                \n                proposals.put(proposalId, proposal);\n                nextProposalId += 1;\n                \n                #ok(proposalId)\n            };\n            case null { #err(\"Only members can create proposals\") };\n        }\n    };\n    \n    public shared(msg) func vote(proposalId: ProposalId, vote: Vote) : async Result.Result<(), Text> {\n        let caller = msg.caller;\n        let voteKey = Nat.toText(proposalId) # \"#\" # Principal.toText(caller);\n        \n        switch (members.get(caller)) {\n            case (?_) {\n                switch (votes.get(voteKey)) {\n                    case (?_) { #err(\"Already voted on this proposal\") };\n                    case null {\n                        switch (proposals.get(proposalId)) {\n                            case (?proposal) {\n                                if (Time.now() > proposal.deadline) {\n                                    return #err(\"Voting period has ended\");\n                                };\n                                \n                                let updatedProposal = switch (vote) {\n                                    case (#Yes) {\n                                        { proposal with yesVotes = proposal.yesVotes + 1 }\n                                    };\n                                    case (#No) {\n                                        { proposal with noVotes = proposal.noVotes + 1 }\n                                    };\n                                };\n                                \n                                proposals.put(proposalId, updatedProposal);\n                                votes.put(voteKey, true);\n                                \n                                #ok(())\n                            };\n                            case null { #err(\"Proposal not found\") };\n                        }\n                    };\n                }\n            };\n            case null { #err(\"Only members can vote\") };\n        }\n    };\n    \n    public query func getProposal(proposalId: ProposalId) : async Result.Result<Proposal, Text> {\n        switch (proposals.get(proposalId)) {\n            case (?proposal) { #ok(proposal) };\n            case null { #err(\"Proposal not found\") };\n        }\n    };\n}";
                    previewImage = null;
                    isActive = true;
                    usageCount = 0;
                    createdAt = Time.now();
                }
            ];
            
            for (template in defaultTemplates.vals()) {
                templates.put(template.id, template);
            };
        };
        
        // Initialize templates on first creation
        initializeDefaultTemplates();
        
        // Add a new template
        public func addTemplate(template: Template) : APIResponse<TemplateId> {
            templates.put(template.id, template);
            #Ok(template.id)
        };
        
        // Get a template by ID
        public func getTemplate(templateId: TemplateId) : APIResponse<Template> {
            switch (templates.get(templateId)) {
                case (?template) {
                    if (template.isActive) {
                        #Ok(template)
                    } else {
                        #Err("Template is not active")
                    }
                };
                case null #Err("Template not found");
            }
        };
        
        // Get all active templates
        public func getAllTemplates() : APIResponse<[Template]> {
            let activeTemplates = Array.filter<Template>(
                templates.vals() |> Iter.toArray(_),
                func(template: Template) : Bool { template.isActive }
            );
            #Ok(activeTemplates)
        };
        
        // Get templates by category
        public func getTemplatesByCategory(category: TemplateCategory) : APIResponse<[Template]> {
            let categoryTemplates = Array.filter<Template>(
                templates.vals() |> Iter.toArray(_),
                func(template: Template) : Bool { 
                    template.isActive and template.category == category 
                }
            );
            #Ok(categoryTemplates)
        };
        
        // Get templates by language
        public func getTemplatesByLanguage(language: Types.CodeLanguage) : APIResponse<[Template]> {
            let languageTemplates = Array.filter<Template>(
                templates.vals() |> Iter.toArray(_),
                func(template: Template) : Bool { 
                    template.isActive and template.language == language 
                }
            );
            #Ok(languageTemplates)
        };
        
        // Increment usage count for a template
        public func incrementUsage(templateId: TemplateId) : APIResponse<Bool> {
            switch (templates.get(templateId)) {
                case (?template) {
                    let updatedTemplate = {
                        template with
                        usageCount = template.usageCount + 1;
                    };
                    templates.put(templateId, updatedTemplate);
                    #Ok(true)
                };
                case null #Err("Template not found");
            }
        };
        
        // Update template status
        public func updateTemplateStatus(templateId: TemplateId, isActive: Bool) : APIResponse<Template> {
            switch (templates.get(templateId)) {
                case (?template) {
                    let updatedTemplate = {
                        template with
                        isActive = isActive;
                    };
                    templates.put(templateId, updatedTemplate);
                    #Ok(updatedTemplate)
                };
                case null #Err("Template not found");
            }
        };
        
        // Get popular templates (sorted by usage count)
        public func getPopularTemplates(limit: Nat) : APIResponse<[Template]> {
            let allTemplates = Array.filter<Template>(
                templates.vals() |> Iter.toArray(_),
                func(template: Template) : Bool { template.isActive }
            );
            
            let sortedTemplates = Array.sort<Template>(
                allTemplates,
                func(a: Template, b: Template) : { #less; #equal; #greater } {
                    if (a.usageCount > b.usageCount) { #less }
                    else if (a.usageCount < b.usageCount) { #greater }
                    else { #equal }
                }
            );
            
            let limitedTemplates = if (sortedTemplates.size() <= limit) {
                sortedTemplates
            } else {
                Array.subArray<Template>(sortedTemplates, 0, limit)
            };
            
            #Ok(limitedTemplates)
        };
        
        // Get template statistics
        public func getTotalUsage() : Nat {
            var totalUsage = 0;
            for ((_, template) in templates.entries()) {
                totalUsage += template.usageCount;
            };
            totalUsage
        };
        
        public func getTotalTemplates() : Nat {
            templates.size()
        };
        
        public func getActiveTemplateCount() : Nat {
            var count = 0;
            for ((_, template) in templates.entries()) {
                if (template.isActive) {
                    count += 1;
                };
            };
            count
        };
        
        // Stable storage helpers for upgrades
        public func toArray() : [(TemplateId, Template)] {
            templates.entries() |> Iter.toArray(_)
        };
        
        public func fromArray(arr: [(TemplateId, Template)]) {
            templates := HashMap.fromIter<TemplateId, Template>(
                arr.vals(), 
                arr.size(), 
                func(a: TemplateId, b: TemplateId) : Bool { a == b }, 
                func(a: TemplateId) : Nat32 { 
                    func hash(n : Nat) : Nat32 {
                        var acc : Nat32 = 0;
                        var temp = n;
                        while (temp > 0) {
                            acc := acc +% Nat32.fromNat(temp % 256);
                            temp := temp / 256;
                        };
                        acc
                    };
                    hash(a)
                }
            );
        };
    };
}