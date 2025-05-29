// src/components/ConnectWalletButton.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Wallet, LogOut, ExternalLink, Database, AlertCircle } from 'lucide-react';
import { connectWallet, disconnectWallet, checkConnection, getWalletState, WalletState } from '../lib/wallet-service';
import { backendService } from '../lib/backend-service';

const ConnectWalletButton = () => {
  const [walletState, setWalletState] = useState<WalletState>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [backendChecking, setBackendChecking] = useState<boolean>(false);

  // Check connection status on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const state = await checkConnection();
        setWalletState(state);
        
        // If wallet is connected, initialize backend
        if (state.isConnected) {
          await initializeBackend();
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkWalletConnection();
  }, []);

  // Initialize backend
  const initializeBackend = async () => {
    setBackendChecking(true);
    try {
      await backendService.init();
      const isAvailable = await backendService.isBackendAvailable();
      setBackendConnected(isAvailable);
      
      if (isAvailable) {
        console.log('Backend initialized successfully');
      } else {
        console.warn('Backend is not available');
      }
    } catch (error) {
      console.error('Error initializing backend:', error);
      setBackendConnected(false);
    } finally {
      setBackendChecking(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const state = await connectWallet();
      setWalletState(state);
      
      // Initialize backend when wallet connects
      if (state.isConnected) {
        await initializeBackend();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      await disconnectWallet();
      setWalletState({ isConnected: false });
      setBackendConnected(false);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format principal ID for display (existing function)
  const formatPrincipalId = (id: string | undefined) => {
    if (!id) return '';
    if (id.length <= 12) return id;
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  };

  // Get backend status indicator
  const getBackendStatusIcon = () => {
    if (backendChecking) return <Database className="w-4 h-4 animate-spin" />;
    if (backendConnected) return <Database className="w-4 h-4 text-green-600" />;
    if (walletState.isConnected) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <Database className="w-4 h-4 text-gray-400" />;
  };

  const getBackendStatusText = () => {
    if (backendChecking) return 'Connecting to backend...';
    if (backendConnected) return 'Backend connected';
    if (walletState.isConnected) return 'Backend offline';
    return 'Backend disconnected';
  };

  return (
    <>
      {walletState.isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white border-electric-600 text-electric-600 hover:bg-electric-50">
              <Wallet className="w-4 h-4 mr-2" />
              {formatPrincipalId(walletState.principal)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Principal ID */}
            <DropdownMenuItem className="flex items-center justify-between cursor-default">
              <span className="text-sm text-gray-500">Principal ID</span>
              <span className="text-sm font-mono">{formatPrincipalId(walletState.principal)}</span>
            </DropdownMenuItem>
            
            {/* Backend Status */}
            <DropdownMenuItem className="flex items-center justify-between cursor-default">
              <div className="flex items-center gap-2">
                {getBackendStatusIcon()}
                <span className="text-sm text-gray-500">Backend</span>
              </div>
              <span className={`text-xs ${backendConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {backendConnected ? 'Connected' : 'Offline'}
              </span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Backend features (only show if connected) */}
            {backendConnected && (
              <>
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/projects'} 
                  className="cursor-pointer"
                >
                  <Database className="w-4 h-4 mr-2" />
                  <span>My Projects</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            {/* External links */}
            <DropdownMenuItem 
              onClick={() => window.open('https://dashboard.internetcomputer.org/', '_blank')} 
              className="cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              <span>View on IC Dashboard</span>
            </DropdownMenuItem>
            
            {/* Disconnect */}
            <DropdownMenuItem 
              onClick={handleDisconnect} 
              className="text-red-600 cursor-pointer"
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>{isLoading ? 'Disconnecting...' : 'Disconnect'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="bg-electric-600 hover:bg-electric-700 text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      
      {/* Error display */}
      {error && (
        <div className="text-red-500 text-sm mt-2 max-w-64">
          {error}
        </div>
      )}
      
      {/* Backend status message for connected wallet */}
      {walletState.isConnected && !backendConnected && !backendChecking && (
        <div className="text-amber-600 text-xs mt-1 max-w-64">
          Backend offline - projects won't be saved
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;