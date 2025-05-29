// frontend/src/lib/backend-service.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Types matching your Motoko backend
export interface Project {
  id: number;
  owner: Principal;
  name: string;
  description: string;
  prompt: string;
  language: { Motoko: null } | { Rust: null };
  generatedCode?: string;
  canisterId?: Principal;
  status: { Draft: null } | { Generated: null } | { Deployed: null } | { Failed: null };
  createdAt: bigint;
  updatedAt: bigint;
  deploymentLog?: string;
}

export interface BackendTemplate {
  id: number;
  name: string;
  description: string;
  category: { DeFi: null } | { NFT: null } | { DAO: null } | { Gaming: null } | { Utility: null } | { Other: null };
  language: { Motoko: null } | { Rust: null };
  code: string;
  previewImage?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: bigint;
}

// Canister configuration
const CANISTER_ID = import.meta.env.VITE_AUTOPILOT_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
//const HOST = import.meta.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943';
const HOST = import.meta.env.VITE_IC_HOST || 'http://localhost:4943';

class BackendService {
  private actor: any = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized && this.actor) return;

    const agent = new HttpAgent({ host: HOST });
    
    // In development, fetch root key
    if (import.meta.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    // Agent will use anonymous identity by default
    // Wallet authentication is handled separately

    // Create actor with simplified IDL for your backend
    const idlFactory = ({ IDL }: any) => {
      const ProjectId = IDL.Nat;
      const TemplateId = IDL.Nat;
      const UserId = IDL.Principal;
      
      const CodeLanguage = IDL.Variant({
        'Motoko': IDL.Null,
        'Rust': IDL.Null,
      });
      
      const ProjectStatus = IDL.Variant({
        'Draft': IDL.Null,
        'Generated': IDL.Null,
        'Deployed': IDL.Null,
        'Failed': IDL.Null,
      });
      
      const Project = IDL.Record({
        'id': ProjectId,
        'owner': UserId,
        'name': IDL.Text,
        'description': IDL.Text,
        'prompt': IDL.Text,
        'language': CodeLanguage,
        'generatedCode': IDL.Opt(IDL.Text),
        'canisterId': IDL.Opt(IDL.Principal),
        'status': ProjectStatus,
        'createdAt': IDL.Int,
        'updatedAt': IDL.Int,
        'deploymentLog': IDL.Opt(IDL.Text),
      });
      
      const CreateProjectRequest = IDL.Record({
        'name': IDL.Text,
        'description': IDL.Text,
        'prompt': IDL.Text,
        'language': CodeLanguage,
      });

      const UpdateProjectRequest = IDL.Record({
        'id': ProjectId,
        'name': IDL.Opt(IDL.Text),
        'description': IDL.Opt(IDL.Text),
        'generatedCode': IDL.Opt(IDL.Text),
      });

      const Template = IDL.Record({
        'id': TemplateId,
        'name': IDL.Text,
        'description': IDL.Text,
        'category': IDL.Variant({
          'DeFi': IDL.Null,
          'NFT': IDL.Null,
          'DAO': IDL.Null,
          'Gaming': IDL.Null,
          'Utility': IDL.Null,
          'Other': IDL.Null,
        }),
        'language': CodeLanguage,
        'code': IDL.Text,
        'previewImage': IDL.Opt(IDL.Text),
        'isActive': IDL.Bool,
        'usageCount': IDL.Nat,
        'createdAt': IDL.Int,
      });
      
      const APIResponse = (T: any) => IDL.Variant({
        'Ok': T,
        'Err': IDL.Text,
      });
      
      return IDL.Service({
        'createProject': IDL.Func([CreateProjectRequest], [APIResponse(Project)], []),
        'updateProject': IDL.Func([UpdateProjectRequest], [APIResponse(Project)], []),
        'getUserProjects': IDL.Func([], [APIResponse(IDL.Vec(Project))], ['query']),
        'getProject': IDL.Func([ProjectId], [APIResponse(Project)], ['query']),
        'getTemplates': IDL.Func([], [APIResponse(IDL.Vec(Template))], ['query']),
        'health': IDL.Func([], [IDL.Text], ['query']),
      });
    };

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });

    this.isInitialized = true;
  }

  // Project management methods
  async createProject(name: string, description: string, prompt: string, language: 'motoko' | 'rust'): Promise<Project> {
    if (!this.actor) throw new Error('Backend service not initialized');
    
    const request = {
      name,
      description,
      prompt,
      language: language === 'motoko' ? { Motoko: null } : { Rust: null }
    };
    
    const result = await this.actor.createProject(request);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  }

  async updateProjectWithCode(projectId: number, generatedCode: string): Promise<Project> {
    if (!this.actor) throw new Error('Backend service not initialized');
    
    const request = {
      id: projectId,
      name: [],
      description: [],
      generatedCode: [generatedCode]
    };
    
    const result = await this.actor.updateProject(request);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  }

  async getUserProjects(): Promise<Project[]> {
    if (!this.actor) throw new Error('Backend service not initialized');
    
    const result = await this.actor.getUserProjects();
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  }

  async getTemplates(): Promise<BackendTemplate[]> {
    if (!this.actor) throw new Error('Backend service not initialized');
    
    const result = await this.actor.getTemplates();
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  }

  async healthCheck(): Promise<string> {
    if (!this.actor) throw new Error('Backend service not initialized');
    return await this.actor.health();
  }

  // Check if backend is available
  async isBackendAvailable(): Promise<boolean> {
    try {
      if (!this.actor) await this.init();
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendService = new BackendService();

// Utility functions
export const formatProjectStatus = (status: Project['status']): string => {
  if ('Draft' in status) return 'Draft';
  if ('Generated' in status) return 'Generated';
  if ('Deployed' in status) return 'Deployed';
  if ('Failed' in status) return 'Failed';
  return 'Unknown';
};

export const formatLanguage = (language: Project['language']): string => {
  if ('Motoko' in language) return 'motoko';
  if ('Rust' in language) return 'rust';
  return 'unknown';
};