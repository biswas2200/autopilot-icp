// src/components/CodePreview.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Copy, Download, Play, Edit3, ArrowLeft, AlertCircle } from "lucide-react";
import { getWalletState, deployCanister } from "../lib/wallet-service";
import { toast } from "./ui/use-toast"; // Import toast for notifications

// Import the DeploymentModal
import DeploymentModal from "./DeploymentModal";

// Default code to show when no code is generated
const DEFAULT_CODE = `// Default Motoko Smart Contract Template
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

/* 
 * This is a sample smart contract template.
 * Generate your own contract by describing what you want to build
 * in the prompt generator, or select from our pre-built templates.
 */
actor DefaultContract {
  // State variables
  private stable var counter : Nat = 0;
  
  // Public functions
  public func increment() : async Nat {
    counter += 1;
    return counter;
  };
  
  public query func getCount() : async Nat {
    return counter;
  };
  
  // Add your custom functionality here
}`;

const CodePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(DEFAULT_CODE); // Initialize with default code
  const [fileName, setFileName] = useState("Contract.mo");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("motoko");
  
  // Add states for deployment
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedCanisterId, setDeployedCanisterId] = useState<string | null>(null);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  
  // Load code from router state when component mounts
  useEffect(() => {
    if (location.state?.code) {
      setCode(location.state.code);
      
      if (location.state.fileName) {
        setFileName(location.state.fileName);
      }
      
      if (location.state.prompt) {
        setPrompt(location.state.prompt);
      }
      
      if (location.state.language) {
        setLanguage(location.state.language);
      }
    }
  }, [location.state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied to clipboard",
      duration: 2000
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeploy = async () => {
    // Check if wallet is connected
    const walletState = getWalletState();
    
    if (!walletState.isConnected) {
      // Show a message asking the user to connect their wallet
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy the contract",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDeploying(true);
      
      // Call the deployCanister function from wallet-service
      const canisterId = await deployCanister(code, fileName);
      
      // Update state with the deployed canister ID
      setDeployedCanisterId(canisterId);
      
      // Show the deployment success modal
      setShowDeploymentModal(true);
      
    } catch (error: any) {
      console.error('Deployment failed:', error);
      
      // Show error toast
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to deploy the contract. Please try again.",
        variant: "destructive"
      });
      
    } finally {
      setIsDeploying(false);
    }
  };
  
  const handleExplain = () => {
    // Navigate to explanation component with the code
    navigate('/explain-canister', { 
      state: { 
        code, // Make sure code is passed to ExplainCanister
        language,
        fileName,
        fromPreview: true // Flag to indicate we came from preview
      } 
    });
  };
  
  const handleBack = () => {
    // Go back to the prompt generator
    navigate('/');
  };

  return (
    <section className="py-16 bg-navy-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Generated Smart Contract
            </h2>
            <p className="text-lg text-navy-600">
              Review, edit, and deploy your contract
            </p>
          </div>
          
          <div className="mb-6 flex justify-between">
            <Button 
              variant="outline" 
              className="border-navy-300 text-navy-700 hover:bg-navy-50"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button 
              variant="outline" 
              className="border-navy-300 text-navy-700 hover:bg-navy-50"
              onClick={handleExplain}
            >
              Explain Code
            </Button>
          </div>
          
          <Card className="border-navy-200 shadow-lg overflow-hidden">
            <div className="border-b border-navy-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="ml-4 text-sm text-navy-600 font-mono">{fileName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-navy-600 hover:text-navy-900"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "View" : "Edit"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopy}
                    className="text-navy-600 hover:text-navy-900"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleDownload}
                    className="text-navy-600 hover:text-navy-900"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-900 text-navy-100 p-6 min-h-[400px] max-h-[600px] overflow-auto">
              {isEditing ? (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
                  rows={20}
                />
              ) : (
                <pre className="font-mono text-sm leading-relaxed">
                  <code className={`language-${language}`}>{code}</code>
                </pre>
              )}
            </div>
            
            <div className="p-6 bg-white border-t border-navy-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 bg-electric-600 hover:bg-electric-700 text-white"
                >
                  {isDeploying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Deploy to ICP
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-navy-300 text-navy-700 hover:bg-navy-50"
                >
                  Save as Template
                </Button>
              </div>
              
              {!getWalletState().isConnected && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Connect your wallet first to deploy this contract to the Internet Computer</span>
                </div>
              )}
            </div>
          </Card>
          
          {/* Add the deployment modal */}
          <DeploymentModal 
            isOpen={showDeploymentModal}
            onClose={() => setShowDeploymentModal(false)}
            canisterId={deployedCanisterId || ''}
          />
        </div>
      </div>
    </section>
  );
};

export default CodePreview;