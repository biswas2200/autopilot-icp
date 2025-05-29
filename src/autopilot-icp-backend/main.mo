import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Option "mo:base/Option";

import Types "./types";
import ProjectStorage "./project";
import TemplateManager "./template";
import DeploymentService "./deploy";

actor AutoPilotICP {
    
    // Type aliases for convenience
    type Project = Types.Project;
    type Template = Types.Template;
    type ProjectId = Types.ProjectId;
    type TemplateId = Types.TemplateId;
    type UserId = Types.UserId;
    type APIResponse<T> = Types.APIResponse<T>;
    
    // Stable storage for upgrades
    private stable var projectsEntries : [(ProjectId, Project)] = [];
    private stable var templatesEntries : [(TemplateId, Template)] = [];
    private stable var userProjectsEntries : [(UserId, [ProjectId])] = [];
    private stable var nextProjectId : ProjectId = 1;
    private stable var nextTemplateId : TemplateId = 1;
    
    // Runtime state
    private var projectStorage = ProjectStorage.ProjectStorage();
    private var templateManager = TemplateManager.TemplateManager();
    private var deploymentService = DeploymentService.DeploymentService();
    
    // Initialize with stable data
    system func preupgrade() {
        projectsEntries := projectStorage.toArray();
        templatesEntries := templateManager.toArray();
        userProjectsEntries := projectStorage.getUserProjectsArray();
    };
    
    system func postupgrade() {
        projectStorage.fromArray(projectsEntries);
        templateManager.fromArray(templatesEntries);
        projectStorage.fromUserProjectsArray(userProjectsEntries);
        projectsEntries := [];
        templatesEntries := [];
        userProjectsEntries := [];
    };
    
    // Project Management Functions
    
    public shared(msg) func createProject(request: Types.CreateProjectRequest) : async APIResponse<Project> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #Err("Anonymous users cannot create projects");
        };
        
        let project : Project = {
            id = nextProjectId;
            owner = caller;
            name = request.name;
            description = request.description;
            prompt = request.prompt;
            language = request.language;
            generatedCode = null;
            canisterId = null;
            status = #Draft;
            createdAt = Time.now();
            updatedAt = Time.now();
            deploymentLog = null;
        };
        
        switch (projectStorage.addProject(project)) {
            case (#Ok(_)) {
                nextProjectId += 1;
                #Ok(project)
            };
            case (#Err(err)) #Err(err);
        }
    };
    
    public shared(msg) func updateProject(request: Types.UpdateProjectRequest) : async APIResponse<Project> {
        let caller = msg.caller;
        switch (projectStorage.updateProject(request.id, caller, request)) {
            case (#Ok(project)) #Ok(project);
            case (#Err(err)) #Err(err);
        }
    };
    
    public shared(msg) func getProject(projectId: ProjectId) : async APIResponse<Project> {
        let caller = msg.caller;
        switch (projectStorage.getProject(projectId, caller)) {
            case (#Ok(project)) #Ok(project);
            case (#Err(err)) #Err(err);
        }
    };
    
    public shared(msg) func getUserProjects() : async APIResponse<[Project]> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #Err("Anonymous users cannot access projects");
        };
        
        switch (projectStorage.getUserProjects(caller)) {
            case (#Ok(projects)) #Ok(projects);
            case (#Err(err)) #Err(err);
        }
    };
    
    public shared(msg) func deleteProject(projectId: ProjectId) : async APIResponse<Bool> {
        let caller = msg.caller;
        switch (projectStorage.deleteProject(projectId, caller)) {
            case (#Ok(success)) #Ok(success);
            case (#Err(err)) #Err(err);
        }
    };
    
    // Code Generation Functions
    
    public shared(msg) func generateCode(request: Types.GenerateCodeRequest) : async APIResponse<Project> {
        let caller = msg.caller;
        
        // Get the project to ensure ownership
        switch (projectStorage.getProject(request.projectId, caller)) {
            case (#Ok(project)) {
                // In a real implementation, this would call an AI service
                // For now, we'll simulate code generation
                let generatedCode = await simulateCodeGeneration(request);
                
                let updateRequest : Types.UpdateProjectRequest = {
                    id = request.projectId;
                    name = null;
                    description = null;
                    generatedCode = ?generatedCode;
                };
                
                switch (projectStorage.updateProject(request.projectId, caller, updateRequest)) {
                    case (#Ok(updatedProject)) {
                        // Update status to Generated
                        let statusUpdate = {
                            id = request.projectId;
                            name = null;
                            description = null;
                            generatedCode = null;
                        };
                        let finalProject = {
                            updatedProject with 
                            status = #Generated;
                            updatedAt = Time.now();
                        };
                        ignore projectStorage.updateProjectStatus(request.projectId, #Generated);
                        #Ok(finalProject)
                    };
                    case (#Err(err)) #Err(err);
                }
            };
            case (#Err(err)) #Err(err);
        }
    };
    
    // Template Management Functions
    
    public query func getTemplates() : async APIResponse<[Template]> {
        switch (templateManager.getAllTemplates()) {
            case (#Ok(templates)) #Ok(templates);
            case (#Err(err)) #Err(err);
        }
    };
    
    public query func getTemplate(templateId: TemplateId) : async APIResponse<Template> {
        switch (templateManager.getTemplate(templateId)) {
            case (#Ok(template)) #Ok(template);
            case (#Err(err)) #Err(err);
        }
    };
    
    public query func getTemplatesByCategory(category: Types.TemplateCategory) : async APIResponse<[Template]> {
        switch (templateManager.getTemplatesByCategory(category)) {
            case (#Ok(templates)) #Ok(templates);
            case (#Err(err)) #Err(err);
        }
    };
    
    // Deployment Functions
    
    public shared(msg) func deployProject(projectId: ProjectId) : async APIResponse<Types.DeploymentResult> {
        let caller = msg.caller;
        
        switch (projectStorage.getProject(projectId, caller)) {
            case (#Ok(project)) {
                switch (project.generatedCode) {
                    case (?code) {
                        let deployRequest : Types.DeploymentRequest = {
                            projectId = projectId;
                            code = code;
                            canisterSettings = null;
                        };
                        
                        let result = await deploymentService.deployCanister(deployRequest);
                        
                        // Update project with deployment result
                        switch (result) {
                            case (#Ok(deployResult)) {
                                switch (deployResult) {
                                    case (#Success(success)) {
                                        ignore projectStorage.updateProjectDeployment(
                                            projectId, 
                                            ?success.canisterId, 
                                            #Deployed,
                                            ?success.deploymentLog
                                        );
                                    };
                                    case (#Error(_)) {
                                        ignore projectStorage.updateProjectStatus(projectId, #Failed);
                                    };
                                }
                            };
                            case (#Err(_)) {
                                ignore projectStorage.updateProjectStatus(projectId, #Failed);
                            };
                        };
                        
                        result
                    };
                    case null #Err("No code generated for this project");
                }
            };
            case (#Err(err)) #Err(err);
        }
    };
    
    // Statistics and Analytics
    
    public query func getPlatformStats() : async APIResponse<Types.PlatformStats> {
        let stats : Types.PlatformStats = {
            totalProjects = projectStorage.getTotalProjects();
            totalDeployments = projectStorage.getTotalDeployments();
            totalUsers = projectStorage.getTotalUsers();
            templatesUsed = templateManager.getTotalUsage();
            lastUpdated = Time.now();
        };
        #Ok(stats)
    };
    
    public shared(msg) func getUserStats() : async APIResponse<Types.UserStats> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #Err("Anonymous users cannot access stats");
        };
        
        switch (projectStorage.getUserStats(caller)) {
            case (#Ok(stats)) #Ok(stats);
            case (#Err(err)) #Err(err);
        }
    };
    
    // Admin Functions (for initial setup)
    
    public shared(msg) func addTemplate(template: Template) : async APIResponse<TemplateId> {
        // In production, add proper admin access control
        let newTemplate = {
            template with 
            id = nextTemplateId;
            createdAt = Time.now();
        };
        
        switch (templateManager.addTemplate(newTemplate)) {
            case (#Ok(id)) {
                nextTemplateId += 1;
                #Ok(id)
            };
            case (#Err(err)) #Err(err);
        }
    };
    
    // Helper Functions
    
    private func simulateCodeGeneration(request: Types.GenerateCodeRequest) : async Text {
        // This is a placeholder for actual AI integration
        // In production, this would call your AI service (Gemini API)
        
        let baseTemplate = switch (request.language) {
            case (#Motoko) {
                "import Debug \"mo:base/Debug\";\n\nactor GeneratedContract {\n    public func greet(name : Text) : async Text {\n        \"Hello, \" # name # \"!\"\n    };\n}";
            };
            case (#Rust) {
                "use ic_cdk_macros::*;\n\n#[update]\nfn greet(name: String) -> String {\n    format!(\"Hello, {}!\", name)\n}";
            };
        };
        
        baseTemplate # "\n\n// Generated from prompt: " # request.prompt
    };
    
    // Health check
    public query func health() : async Text {
        "AutoPilot ICP Backend is running"
    };
}