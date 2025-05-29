// src/lib/ai-service.ts

// Configuration
const USE_MOCK_DATA = false; // Set to false to use real API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated API URL with correct model name
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const MAX_TOKENS = 1024; 

export type Language = 'motoko' | 'rust';

type CodeGenerationParams = {
  prompt: string;
  language: Language;
  template?: string;
};

// Main exported functions that decide whether to use mock or real API
export async function generateCode(params: CodeGenerationParams): Promise<string> {
  // Use mock data if flag is set or if no API key is available
  if (USE_MOCK_DATA || !GEMINI_API_KEY) {
    console.log("Using mock data for code generation");
    return generateMockCode(params);
  } else {
    return generateRealCode(params);
  }
}

export async function explainCode(code: string, language: Language): Promise<string> {
  // Use mock data if flag is set or if no API key is available
  if (USE_MOCK_DATA || !GEMINI_API_KEY) {
    console.log("Using mock data for code explanation");
    return explainMockCode(code, language);
  } else {
    return explainRealCode(code, language);
  }
}

// Mock implementations for testing (keeping your existing implementation)
async function generateMockCode({ prompt, language, template }: CodeGenerationParams): Promise<string> {
  console.log("Generating mock code for:", prompt);
  
  return new Promise((resolve) => {
    // Simulate API delay (shorter for testing)
    setTimeout(() => {
      if (language === 'motoko') {
        resolve(`
// Generated Motoko code for: ${prompt}
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";

actor ${getActorName(prompt)} {
  // State variables
  private stable var counter : Nat = 0;
  private stable var owner : Principal = Principal.fromText("2vxsx-fae");
  
  // Data structures
  type Entry = {
    id: Nat;
    text: Text;
    completed: Bool;
    timestamp: Int;
  };
  
  private stable var entries : [Entry] = [];
  private var entriesMap = HashMap.HashMap<Nat, Entry>(0, Nat.equal, Hash.hash);
  
  // Initialize from stable storage
  system func preupgrade() {
    entries := Iter.toArray(entriesMap.vals());
  };
  
  system func postupgrade() {
    for (entry in entries.vals()) {
      entriesMap.put(entry.id, entry);
    };
  };
  
  // Core functionality
  public func addEntry(text : Text) : async Nat {
    let id = counter + 1;
    let entry : Entry = {
      id = id;
      text = text;
      completed = false;
      timestamp = Time.now();
    };
    
    entriesMap.put(id, entry);
    counter += 1;
    return id;
  };
  
  public query func getEntry(id : Nat) : async ?Entry {
    entriesMap.get(id)
  };
  
  public query func getAllEntries() : async [Entry] {
    Iter.toArray(entriesMap.vals())
  };
  
  public func updateEntry(id : Nat, text : Text, completed : Bool) : async Bool {
    switch (entriesMap.get(id)) {
      case (null) { return false; };
      case (?entry) {
        let updatedEntry : Entry = {
          id = id;
          text = text;
          completed = completed;
          timestamp = entry.timestamp;
        };
        entriesMap.put(id, updatedEntry);
        return true;
      };
    }
  };
}
        `);
      } else {
        resolve(`
// Generated Rust code for: ${prompt}
use ic_cdk::export::{
    candid::{CandidType, Deserialize},
    Principal,
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
struct Entry {
    id: u64,
    text: String,
    completed: bool,
    timestamp: u64,
}

thread_local! {
    static COUNTER: RefCell<u64> = RefCell::new(0);
    static ENTRIES: RefCell<HashMap<u64, Entry>> = RefCell::new(HashMap::new());
}

#[update]
fn add_entry(text: String) -> u64 {
    COUNTER.with(|counter| {
        let id = *counter.borrow() + 1;
        
        let entry = Entry {
            id,
            text,
            completed: false,
            timestamp: ic_cdk::api::time(),
        };
        
        ENTRIES.with(|entries| {
            entries.borrow_mut().insert(id, entry);
        });
        
        *counter.borrow_mut() = id;
        id
    })
}

#[query]
fn get_entry(id: u64) -> Option<Entry> {
    ENTRIES.with(|entries| {
        entries.borrow().get(&id).cloned()
    })
}

#[query]
fn get_all_entries() -> Vec<Entry> {
    ENTRIES.with(|entries| {
        entries.borrow().values().cloned().collect()
    })
}
        `);
      }
    }, 500); // Shorter delay for testing
  });
}

async function explainMockCode(code: string, language: Language): Promise<string> {
  console.log("Generating mock explanation");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
# Code Explanation

This ${language} code implements a basic application with the following functionality:

## State Management
- Uses stable variables to persist state across upgrades
- Implements HashMap for efficient data storage and retrieval

## Data Structures
- Defines an Entry type with fields for id, text, completed status, and timestamp
- Manages entries in a HashMap with numeric IDs as keys

## Core Functionality
- addEntry: Creates a new entry with the given text
- getEntry: Retrieves a specific entry by ID
- getAllEntries: Returns all entries

This code follows best practices for ${language} development on the Internet Computer.
      `);
    }, 300);
  });
}

// Real API implementations using Gemini (UPDATED)
async function generateRealCode({ prompt, language, template }: CodeGenerationParams): Promise<string> {
  try {
    const systemPrompt = getSystemPrompt(language, template);
    
    console.log("Making API request to Gemini 1.5 Flash...");
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\n" + prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: MAX_TOKENS,
          topP: 0.8,
          topK: 10
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Gemini API error:", response.status, errorData);
      
      // More specific error handling
      if (response.status === 404) {
        throw new Error("Model not found. Please check your Gemini API configuration.");
      } else if (response.status === 403) {
        throw new Error("API key invalid or quota exceeded.");
      } else {
        throw new Error(`Gemini API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    console.log("API response received");
    
    // Extract text from Gemini response (updated structure)
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      // Extract code from response
      const text = data.candidates[0].content.parts[0].text;
      return extractCodeFromText(text);
    }
    
    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Error generating code:", error);
    // Fallback to mock if API fails
    console.log("Falling back to mock data due to API error");
    return generateMockCode({ prompt, language, template });
  }
}

async function explainRealCode(code: string, language: Language): Promise<string> {
  try {
    console.log("Making API request to Gemini for code explanation...");
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are an expert ${language} developer. Explain the following code in simple terms, line by line. Be concise and focus only on the most important parts.\n\n${code}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: MAX_TOKENS / 2,
          topP: 0.8,
          topK: 10
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Error explaining code:", error);
    // Fallback to mock if API fails
    return explainMockCode(code, language);
  }
}

// Helper to extract code blocks from Gemini's responses (unchanged)
function extractCodeFromText(text: string): string {
  // If the response contains code blocks (```), extract the code
  const codeBlockRegex = /```(?:motoko|rust)?\s*([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code blocks found, return the whole text
  return text;
}

// Helper function to generate an actor name from prompt (unchanged)
function getActorName(prompt: string): string {
  // Extract the first word and capitalize it
  const words = prompt.split(/\s+/);
  let name = words[0] || "Default";
  name = name.replace(/[^a-zA-Z0-9]/g, '');
  return name.charAt(0).toUpperCase() + name.slice(1) + "App";
}

// System prompt for code generation (unchanged)
function getSystemPrompt(language: Language, template?: string): string {
  const basePrompt = `You are an expert ${language} developer specializing in Internet Computer Protocol. 
Generate production-ready, well-documented ${language} code based on the user's requirements.

Your code should:
1. Follow ${language} best practices for ICP development
2. Include proper error handling
3. Be well-structured with clear comments
4. Be secure and efficient
5. Be concise and focused on core functionality to save token usage

Wrap your code in triple backticks.
`;

  if (template) {
    return `${basePrompt}\n${getTemplateInstructions(template, language)}`;
  }
  
  return basePrompt + "\nReturn ONLY the code with no additional explanation or markdown formatting.";
}

// Keep your existing template instructions (unchanged)
function getTemplateInstructions(template: string, language: string): string {
  switch (template) {
    case 'nft':
      return `Create an NFT implementation with metadata support, ownership transfer, and batch minting capabilities.
The contract should include functions for:
- Minting new NFTs with metadata
- Transferring ownership
- Viewing NFT details
- Batch operations where appropriate

Return ONLY the ${language} code with no additional explanation.`;
    
    case 'token-faucet':
      return `Create a token faucet implementation with rate limiting and anti-spam protection.
The contract should include:
- Rate limiting logic (e.g., once per day per user)
- Basic user verification
- Token distribution functionality

Return ONLY the ${language} code with no additional explanation.`;
    
    case 'dao-voting':
      return `Create a DAO voting system with proposal creation and weighted voting.
The contract should include:
- Proposal creation and management
- Voting mechanism with weights
- Quorum checking for proposal validation

Return ONLY the ${language} code with no additional explanation.`;
    
    // Add cases for the other templates
    case 'crowdfunding':
      return `Create a crowdfunding contract with milestone tracking and automatic refunds.
The contract should include:
- Funding goal management
- Milestone tracking and verification
- Automatic refund mechanism if goals aren't met

Return ONLY the ${language} code with no additional explanation.`;
      
    case 'token-gated':
      return `Create a token-gated access contract where only users with specific tokens can access services.
The contract should include:
- Token verification mechanisms
- Access control functions
- Service protection features

Return ONLY the ${language} code with no additional explanation.`;
      
    case 'subscription':
      return `Create a subscription access contract where users pay for 30-day access to services.
The contract should include:
- Time-based access tracking
- Payment handling
- Automatic renewal options

Return ONLY the ${language} code with no additional explanation.`;
      
    case 'feedback':
      return `Create an anonymous feedback collector contract.
The contract should include:
- Anonymous posting mechanisms
- Data privacy protections
- Feedback aggregation features

Return ONLY the ${language} code with no additional explanation.`;
      
    case 'weighted-voting':
      return `Create a weighted voting system where votes are counted based on token balance.
The contract should include:
- Balance-weighted vote calculation
- Token integration for weight determination
- Governance rules implementation

Return ONLY the ${language} code with no additional explanation.`;
      
    default:
      return "Return ONLY the code with no additional explanation or markdown formatting.";
  }
}