import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import Nat32 "mo:base/Nat32";

import Types "./types";

module ProjectStorage {
    
    type Project = Types.Project;
    type ProjectId = Types.ProjectId;
    type UserId = Types.UserId;
    type ProjectStatus = Types.ProjectStatus;
    type APIResponse<T> = Types.APIResponse<T>;
    
    public class ProjectStorage() {
        
        // Storage for projects
        private var projects = HashMap.HashMap<ProjectId, Project>(0, func(a: ProjectId, b: ProjectId) : Bool { a == b }, func(a: ProjectId) : Nat32 { 
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
        
        // Storage for user -> [projectIds] mapping
        private var userProjects = HashMap.HashMap<UserId, Buffer.Buffer<ProjectId>>(0, Principal.equal, Principal.hash);
        
        // Add a new project
        public func addProject(project: Project) : APIResponse<ProjectId> {
            projects.put(project.id, project);
            
            // Add to user's project list
            switch (userProjects.get(project.owner)) {
                case (?projectList) {
                    projectList.add(project.id);
                };
                case null {
                    let newList = Buffer.Buffer<ProjectId>(1);
                    newList.add(project.id);
                    userProjects.put(project.owner, newList);
                };
            };
            
            #Ok(project.id)
        };
        
        // Get a project by ID (with ownership check)
        public func getProject(projectId: ProjectId, userId: UserId) : APIResponse<Project> {
            switch (projects.get(projectId)) {
                case (?project) {
                    if (project.owner == userId) {
                        #Ok(project)
                    } else {
                        #Err("Access denied: You don't own this project")
                    }
                };
                case null #Err("Project not found");
            }
        };
        
        // Update a project
        public func updateProject(projectId: ProjectId, userId: UserId, request: Types.UpdateProjectRequest) : APIResponse<Project> {
            switch (projects.get(projectId)) {
                case (?project) {
                    if (project.owner != userId) {
                        return #Err("Access denied: You don't own this project");
                    };
                    
                    let updatedProject : Project = {
                        project with
                        name = Option.get(request.name, project.name);
                        description = Option.get(request.description, project.description);
                        generatedCode = switch (request.generatedCode) {
                            case (?code) ?code;
                            case null project.generatedCode;
                        };
                        updatedAt = Time.now();
                    };
                    
                    projects.put(projectId, updatedProject);
                    #Ok(updatedProject)
                };
                case null #Err("Project not found");
            }
        };
        
        // Update project status
        public func updateProjectStatus(projectId: ProjectId, status: ProjectStatus) : APIResponse<Project> {
            switch (projects.get(projectId)) {
                case (?project) {
                    let updatedProject = {
                        project with
                        status = status;
                        updatedAt = Time.now();
                    };
                    projects.put(projectId, updatedProject);
                    #Ok(updatedProject)
                };
                case null #Err("Project not found");
            }
        };
        
        // Update project deployment info
        public func updateProjectDeployment(
            projectId: ProjectId, 
            canisterId: ?Principal, 
            status: ProjectStatus,
            deploymentLog: ?Text
        ) : APIResponse<Project> {
            switch (projects.get(projectId)) {
                case (?project) {
                    let updatedProject = {
                        project with
                        canisterId = canisterId;
                        status = status;
                        deploymentLog = deploymentLog;
                        updatedAt = Time.now();
                    };
                    projects.put(projectId, updatedProject);
                    #Ok(updatedProject)
                };
                case null #Err("Project not found");
            }
        };
        
        // Get all projects for a user
        public func getUserProjects(userId: UserId) : APIResponse<[Project]> {
            switch (userProjects.get(userId)) {
                case (?projectIds) {
                    let projectsBuffer = Buffer.Buffer<Project>(projectIds.size());
                    
                    for (projectId in projectIds.vals()) {
                        switch (projects.get(projectId)) {
                            case (?project) {
                                projectsBuffer.add(project);
                            };
                            case null {}; // Skip missing projects (cleanup needed)
                        };
                    };
                    
                    #Ok(Buffer.toArray(projectsBuffer))
                };
                case null #Ok([]);
            }
        };
        
        // Delete a project
        public func deleteProject(projectId: ProjectId, userId: UserId) : APIResponse<Bool> {
            switch (projects.get(projectId)) {
                case (?project) {
                    if (project.owner != userId) {
                        return #Err("Access denied: You don't own this project");
                    };
                    
                    // Remove from projects
                    ignore projects.remove(projectId);
                    
                    // Remove from user's project list
                    switch (userProjects.get(userId)) {
                        case (?projectList) {
                            let newList = Buffer.Buffer<ProjectId>(projectList.size());
                            for (id in projectList.vals()) {
                                if (id != projectId) {
                                    newList.add(id);
                                };
                            };
                            userProjects.put(userId, newList);
                        };
                        case null {};
                    };
                    
                    #Ok(true)
                };
                case null #Err("Project not found");
            }
        };
        
        // Get user statistics
        public func getUserStats(userId: UserId) : APIResponse<Types.UserStats> {
            switch (userProjects.get(userId)) {
                case (?projectIds) {
                    var successfulDeployments = 0;
                    var totalCodeGenerated = 0;
                    var joinedAt = Time.now(); // Default to now, should track actual join date
                    
                    for (projectId in projectIds.vals()) {
                        switch (projects.get(projectId)) {
                            case (?project) {
                                if (project.status == #Deployed) {
                                    successfulDeployments += 1;
                                };
                                if (Option.isSome(project.generatedCode)) {
                                    totalCodeGenerated += 1;
                                };
                                // Track earliest project creation as join date
                                if (project.createdAt < joinedAt) {
                                    joinedAt := project.createdAt;
                                };
                            };
                            case null {};
                        };
                    };
                    
                    let stats : Types.UserStats = {
                        projectsCreated = projectIds.size();
                        successfulDeployments = successfulDeployments;
                        totalCodeGenerated = totalCodeGenerated;
                        joinedAt = joinedAt;
                    };
                    
                    #Ok(stats)
                };
                case null {
                    let stats : Types.UserStats = {
                        projectsCreated = 0;
                        successfulDeployments = 0;
                        totalCodeGenerated = 0;
                        joinedAt = Time.now();
                    };
                    #Ok(stats)
                };
            }
        };
        
        // Get platform statistics
        public func getTotalProjects() : Nat {
            projects.size()
        };
        
        public func getTotalDeployments() : Nat {
            var count = 0;
            for ((_, project) in projects.entries()) {
                if (project.status == #Deployed) {
                    count += 1;
                };
            };
            count
        };
        
        public func getTotalUsers() : Nat {
            userProjects.size()
        };
        
        // Stable storage helpers for upgrades
        public func toArray() : [(ProjectId, Project)] {
            projects.entries() |> Iter.toArray(_)
        };
        
        public func fromArray(arr: [(ProjectId, Project)]) {
            projects := HashMap.fromIter<ProjectId, Project>(
                arr.vals(), 
                arr.size(), 
                func(a: ProjectId, b: ProjectId) : Bool { a == b }, 
                func(a: ProjectId) : Nat32 { 
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
            
            // Rebuild user projects mapping
            userProjects := HashMap.HashMap<UserId, Buffer.Buffer<ProjectId>>(0, Principal.equal, Principal.hash);
            for ((projectId, project) in arr.vals()) {
                switch (userProjects.get(project.owner)) {
                    case (?projectList) {
                        projectList.add(projectId);
                    };
                    case null {
                        let newList = Buffer.Buffer<ProjectId>(1);
                        newList.add(projectId);
                        userProjects.put(project.owner, newList);
                    };
                };
            };
        };
        
        public func getUserProjectsArray() : [(UserId, [ProjectId])] {
            Array.map<(UserId, Buffer.Buffer<ProjectId>), (UserId, [ProjectId])>(
                userProjects.entries() |> Iter.toArray(_),
                func((userId, buffer)) : (UserId, [ProjectId]) {
                    (userId, Buffer.toArray(buffer))
                }
            )
        };
        
        public func fromUserProjectsArray(arr: [(UserId, [ProjectId])]) {
            userProjects := HashMap.HashMap<UserId, Buffer.Buffer<ProjectId>>(0, Principal.equal, Principal.hash);
            for ((userId, projectIds) in arr.vals()) {
                let buffer = Buffer.Buffer<ProjectId>(projectIds.size());
                for (projectId in projectIds.vals()) {
                    buffer.add(projectId);
                };
                userProjects.put(userId, buffer);
            };
        };
    };
}