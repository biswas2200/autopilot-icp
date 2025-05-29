// src/lib/template-service.ts

import { Language } from './ai-service';

export interface Template {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in minutes
  features: string[];
}

export const templates = [
  {
    id: 'nft-minting',
    name: 'NFT Minting',
    description: 'Create and mint unique digital assets with metadata and ownership tracking',
    difficulty: 'Intermediate' as const,
    estimatedTime: 5,
    features: ['Metadata support', 'Ownership transfer', 'Batch minting']
  },
  {
    id: 'token-faucet',
    name: 'Token Faucet',
    description: 'Distribute tokens to users with rate limiting and anti-spam protection',
    difficulty: 'Beginner' as const,
    estimatedTime: 3,
    features: ['Rate limiting', 'User verification', 'Token distribution']
  },
  {
    id: 'dao-voting',
    name: 'DAO Voting',
    description: 'Decentralized governance with proposal creation and weighted voting',
    difficulty: 'Intermediate' as const,
    estimatedTime: 10,
    features: ['Proposal system', 'Weighted voting', 'Quorum requirements']
  },
  {
    id: 'crowdfunding',
    name: 'Crowdfunding Campaign',
    description: 'Raise funds with milestone tracking and automatic refunds',
    difficulty: 'Advanced' as const,
    estimatedTime: 15,
    features: ['Milestone tracking', 'Refund system', 'Goal management']
  },
  {
    id: 'token-gated',
    name: 'Token-Gated Access',
    description: 'Create contracts where only users who hold a specific token can access a service',
    difficulty: 'Intermediate' as const,
    estimatedTime: 8,
    features: ['Token verification', 'Access control', 'Service protection']
  },
  {
    id: 'subscription',
    name: 'Subscription Access',
    description: 'Contracts where users pay for 30-day access to a feature or service',
    difficulty: 'Intermediate' as const,
    estimatedTime: 12,
    features: ['Time-based access', 'Payment handling', 'Auto-renewal']
  },
  {
    id: 'feedback',
    name: 'Anonymous Feedback Collector',
    description: 'A smart contract to collect anonymous suggestions or reviews',
    difficulty: 'Beginner' as const,
    estimatedTime: 6,
    features: ['Anonymous posting', 'Data privacy', 'Feedback aggregation']
  },
  {
    id: 'weighted-voting',
    name: 'Weighted Voting System',
    description: 'Voting contracts where votes are weighted based on token balance',
    difficulty: 'Advanced' as const,
    estimatedTime: 18,
    features: ['Balance-weighted votes', 'Token integration', 'Governance rules']
  }
];

/**
 * Returns all available templates
 */
export function getAllTemplates(): Template[] {
  return templates;
}

/**
 * Returns a specific template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find(template => template.id === id);
}

/**
 * Returns templates filtered by difficulty
 */
export function getTemplatesByDifficulty(difficulty: 'Beginner' | 'Intermediate' | 'Advanced'): Template[] {
  return templates.filter(template => template.difficulty === difficulty);
}

/**
 * Generate a detailed prompt based on template ID and language
 */
export function generatePromptFromTemplate(templateId: string, language: Language): string {
  const template = getTemplateById(templateId);
  if (!template) return '';
  
  const languageSpecific = language === 'motoko' 
    ? 'Implement this in Motoko, optimized for Internet Computer.'
    : 'Implement this in Rust, optimized for Internet Computer.';

  return `Create a ${template.name} smart contract with the following features:
${template.features.map(f => `- ${f}`).join('\n')}

The contract should implement ${template.description.toLowerCase()}.

${languageSpecific}

Include detailed comments explaining key functionality.`;
}