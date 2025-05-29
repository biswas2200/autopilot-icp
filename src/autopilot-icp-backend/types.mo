import Time "mo:base/Time";
import Principal "mo:base/Principal";

module Types {
    // User identity
    public type UserId = Principal;
    
    // Project-related types
    public type ProjectId = Nat;
    
    public type ProjectStatus = {
        #Draft;
        #Generated;
        #Deployed;
        #Failed;
    };
    
    public type CodeLanguage = {
        #Motoko;
        #Rust;
    };
    
    public type Project = {
        id: ProjectId;
        owner: UserId;
        name: Text;
        description: Text;
        prompt: Text;
        language: CodeLanguage;
        generatedCode: ?Text;
        canisterId: ?Principal;
        status: ProjectStatus;
        createdAt: Int;
        updatedAt: Int;
        deploymentLog: ?Text;
    };
    
    // Template-related types
    public type TemplateId = Nat;
    
    public type TemplateCategory = {
        #DeFi;
        #NFT;
        #DAO;
        #Gaming;
        #Utility;
        #Other;
    };
    
    public type Template = {
        id: TemplateId;
        name: Text;
        description: Text;
        category: TemplateCategory;
        language: CodeLanguage;
        code: Text;
        previewImage: ?Text;
        isActive: Bool;
        usageCount: Nat;
        createdAt: Int;
    };
    
    // Deployment-related types
    public type DeploymentRequest = {
        projectId: ProjectId;
        code: Text;
        canisterSettings: ?CanisterSettings;
    };
    
    public type CanisterSettings = {
        computeAllocation: ?Nat;
        memoryAllocation: ?Nat;
        freezingThreshold: ?Nat;
    };
    
    public type DeploymentResult = {
        #Success: {
            canisterId: Principal;
            deploymentLog: Text;
        };
        #Error: Text;
    };
    
    // API Request/Response types
    public type CreateProjectRequest = {
        name: Text;
        description: Text;
        prompt: Text;
        language: CodeLanguage;
    };
    
    public type UpdateProjectRequest = {
        id: ProjectId;
        name: ?Text;
        description: ?Text;
        generatedCode: ?Text;
    };
    
    public type GenerateCodeRequest = {
        projectId: ProjectId;
        prompt: Text;
        language: CodeLanguage;
        templateId: ?TemplateId;
    };
    
    public type APIResponse<T> = {
        #Ok: T;
        #Err: Text;
    };
    
    // Stats and analytics
    public type PlatformStats = {
        totalProjects: Nat;
        totalDeployments: Nat;
        totalUsers: Nat;
        templatesUsed: Nat;
        lastUpdated: Int;
    };
    
    public type UserStats = {
        projectsCreated: Nat;
        successfulDeployments: Nat;
        totalCodeGenerated: Nat;
        joinedAt: Int;
    };
}