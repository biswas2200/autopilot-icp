// src/lib/wallet-service.ts
import { Principal } from '@dfinity/principal';

export type WalletState = {
  isConnected: boolean;
  principal?: string;
  accountId?: string;
  balance?: string;
  agent?: any; // Add agent for backend integration
}

// Environment-aware configuration
const getNetworkConfig = () => {
  const isDevelopment = import.meta.env.NODE_ENV === 'development' || import.meta.env.VITE_DFX_NETWORK === 'local';
  
  if (isDevelopment) {
    return {
      host: 'http://localhost:4943',
      whitelist: [
        import.meta.env.VITE_AUTOPILOT_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai'
      ]
    };
  } else {
    return {
      host: 'https://ic0.app',
      whitelist: [
        import.meta.env.VITE_AUTOPILOT_BACKEND_CANISTER_ID || ''
      ]
    };
  }
};

// This will be populated by our wallet connection
let walletState: WalletState = {
  isConnected: false
};

// Function to check if the Plug wallet is available
export const isPlugWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'ic' in window && 'plug' in (window as any).ic;
};

// Connect to Plug wallet
export const connectWallet = async (): Promise<WalletState> => {
  if (!isPlugWalletAvailable()) {
    throw new Error('Plug wallet is not installed. Please install the Plug wallet extension first.');
  }

  const config = getNetworkConfig();
  console.log('Connecting to network:', config);
  
  try {
    // Request connection to Plug wallet
    const connected = await (window as any).ic.plug.requestConnect({
      whitelist: config.whitelist,
      host: config.host
    });

    if (connected) {
      // Get the principal ID
      const principal = await (window as any).ic.plug.agent.getPrincipal();
      const principalText = principal.toText();
      
      // Try to get account ID (handle if function doesn't exist)
      let accountId: string | undefined;
      try {
        // Some versions of Plug may not have accountId function
        if (typeof (window as any).ic.plug.accountId === 'function') {
          accountId = await (window as any).ic.plug.accountId();
        } else if ((window as any).ic.plug.sessionManager?.sessionData?.accountId) {
          accountId = (window as any).ic.plug.sessionManager.sessionData.accountId;
        } else {
          console.warn('AccountId not available in this Plug wallet version');
          accountId = undefined;
        }
      } catch (accountError) {
        console.warn('Failed to get account ID:', accountError);
        accountId = undefined;
      }
      
      // Update wallet state
      walletState = {
        isConnected: true,
        principal: principalText,
        accountId: accountId,
        balance: '0', // We'll update this later if needed
        agent: (window as any).ic.plug.agent // Add agent for backend integration
      };
      
      console.log('Connected to Plug wallet:', walletState);
      return walletState;
    } else {
      throw new Error('Failed to connect to Plug wallet');
    }
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Disconnect from Plug wallet
export const disconnectWallet = async (): Promise<void> => {
  try {
    // Try to disconnect from Plug if available
    if (isPlugWalletAvailable() && (window as any).ic.plug.disconnect) {
      await (window as any).ic.plug.disconnect();
    }
  } catch (error) {
    console.warn('Error during disconnect:', error);
  }
  
  walletState = {
    isConnected: false
  };
};

// Check if wallet is already connected
export const checkConnection = async (): Promise<WalletState> => {
  if (!isPlugWalletAvailable()) {
    return { isConnected: false };
  }

  try {
    const connected = await (window as any).ic.plug.isConnected();
    if (connected) {
      const principal = await (window as any).ic.plug.agent.getPrincipal();
      const principalText = principal.toText();
      
      // Try to get account ID safely
      let accountId: string | undefined;
      try {
        if (typeof (window as any).ic.plug.accountId === 'function') {
          accountId = await (window as any).ic.plug.accountId();
        }
      } catch (accountError) {
        console.warn('Failed to get account ID during connection check:', accountError);
        accountId = undefined;
      }
      
      walletState = {
        isConnected: true,
        principal: principalText,
        accountId: accountId,
        agent: (window as any).ic.plug.agent
      };
    } else {
      walletState = { isConnected: false };
    }
    
    return walletState;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return { isConnected: false };
  }
};

// Get current wallet state
export const getWalletState = (): WalletState => {
  return walletState;
};

// Deploy a canister using connected wallet
export const deployCanister = async (code: string, name: string): Promise<string> => {
  if (!walletState.isConnected) {
    throw new Error('Wallet not connected. Please connect your wallet first.');
  }

  // This is a simplified example - real deployment would require more steps
  try {
    console.log(`Deploying canister with name: ${name}`);
    console.log('Network:', getNetworkConfig());
    
    // For the hackathon, simulate successful deployment
    // In production, this would use the IC management canister
    const isDevelopment = import.meta.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Local development - return a local-style canister ID
      return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-cai`;
    } else {
      // Mainnet - return a mainnet-style canister ID
      return `rdmx6-jaaaa-aaaah-qcaiq-cai`;
    }
  } catch (error) {
    console.error('Error deploying canister:', error);
    throw error;
  }
};

// Get network information
export const getNetworkInfo = () => {
  const config = getNetworkConfig();
  const isDevelopment = import.meta.env.NODE_ENV === 'development' || import.meta.env.VITE_DFX_NETWORK === 'local';
  
  return {
    network: isDevelopment ? 'local' : 'mainnet',
    host: config.host,
    canisterIds: config.whitelist,
    isDevelopment
  };
};

// Helper function to get current environment
export const getCurrentEnvironment = () => {
  return {
    isDevelopment: import.meta.env.NODE_ENV === 'development',
    network: import.meta.env.VITE_DFX_NETWORK || 'local',
    backendCanisterId: import.meta.env.VITE_AUTOPILOT_BACKEND_CANISTER_ID,
    host: import.meta.env.VITE_IC_HOST
  };
};