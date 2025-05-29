// src/components/PromptGenerator.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Send, Database, Wifi, WifiOff } from "lucide-react";
import { Language, generateCode } from "../lib/ai-service";
import { backendService } from "../lib/backend-service";
import { checkConnection } from "../lib/wallet-service";

const PromptGenerator = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [language, setLanguage] = useState<Language>("motoko");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check backend and wallet status on mount
  useEffect(() => {
    const checkStatuses = async () => {
      // Check wallet connection
      try {
        const walletState = await checkConnection();
        setWalletConnected(walletState.isConnected);
        
        // Initialize backend
        await backendService.init();
        
        // Check backend availability
        const isAvailable = await backendService.isBackendAvailable();
        setBackendStatus(isAvailable ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Error checking statuses:', error);
        setBackendStatus('unavailable');
      }
    };

    checkStatuses();
  }, []);

  // Handle template data from router state
  useEffect(() => {
    if (location.state?.template && location.state?.prompt) {
      setPrompt(location.state.prompt);
      // Auto-generate project name from template
      if (location.state.template) {
        const templateName = location.state.prompt.split(' ')[2] || 'Contract'; // Extract from "Create a [NAME] smart contract"
        setProjectName(templateName + ' Contract');
      }
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Step 1: Generate code using existing AI service
      const code = await generateCode({ 
        prompt, 
        language 
      });
      
      let projectId: number | undefined;
      
      // Step 2: Save to backend if available and wallet connected
      if (backendStatus === 'available' && walletConnected && projectName.trim()) {
        try {
          const project = await backendService.createProject(
            projectName.trim(),
            description.trim() || prompt.substring(0, 100) + '...',
            prompt,
            language
          );
          
          // Update project with generated code
          await backendService.updateProjectWithCode(project.id, code);
          projectId = project.id;
          
          console.log('Project saved to backend:', project.id);
        } catch (backendError) {
          console.warn('Failed to save to backend, continuing without persistence:', backendError);
          // Don't block the flow if backend fails
        }
      }
      
      // Step 3: Navigate to CodePreview (existing flow)
      navigate('/code-preview', {
        state: {
          code,
          prompt,
          language,
          fileName: getFileNameFromPrompt(prompt, language),
          projectId, // Pass project ID if available
          projectName: projectName.trim() || undefined
        }
      });
    } catch (err) {
      setError("Failed to generate code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to generate a file name from the prompt (existing function)
  const getFileNameFromPrompt = (prompt: string, language: Language): string => {
    const words = prompt.split(/\s+/).slice(0, 3);
    const baseName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');
    
    return `${baseName}.${language === 'motoko' ? 'mo' : 'rs'}`;
  };

  const getStatusIcon = () => {
    if (backendStatus === 'checking') return <Loader2 className="w-4 h-4 animate-spin" />;
    if (backendStatus === 'available') return <Database className="w-4 h-4 text-green-600" />;
    return <Database className="w-4 h-4 text-gray-400" />;
  };

  const getWalletIcon = () => {
    return walletConnected ? 
      <Wifi className="w-4 h-4 text-green-600" /> : 
      <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Describe Your Smart Contract
            </h2>
            <p className="text-lg text-navy-600">
              Use plain English to describe your dApp functionality
            </p>
            
            {/* Status indicators */}
            <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {getWalletIcon()}
                <span>{walletConnected ? 'Wallet Connected' : 'Wallet Disconnected'}</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span>
                  {backendStatus === 'checking' && 'Checking Backend...'}
                  {backendStatus === 'available' && 'Backend Connected'}
                  {backendStatus === 'unavailable' && 'Backend Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <Card className="p-8 border-navy-200 shadow-lg prompt-input-section">
            <div className="space-y-6">
              {/* Project details (only show if backend available and wallet connected) */}
              {backendStatus === 'available' && walletConnected && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-navy-700">
                      Project Name (Optional)
                    </Label>
                    <Input
                      placeholder="My Smart Contract"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="border-navy-200 focus:border-electric-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-navy-700">
                      Description (Optional)
                    </Label>
                    <Input
                      placeholder="Brief project description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-navy-200 focus:border-electric-500"
                    />
                  </div>
                  <div className="col-span-full text-xs text-blue-700 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Projects will be saved to your account for future access
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-700">
                  Contract Description
                </label>
                <Textarea
                  placeholder="e.g., I want a voting dApp with 60% approval requirement..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] border-navy-200 focus:border-electric-500 focus:ring-electric-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-700">
                    Language
                  </label>
                  <Select 
                    value={language} 
                    onValueChange={(value) => {
                      setLanguage(value as Language);
                    }}
                  >
                    <SelectTrigger className="border-navy-200 focus:border-electric-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motoko">Motoko</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isLoading}
                    className="w-full bg-electric-600 hover:bg-electric-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate Contract
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {isLoading && (
                <div className="mt-6 p-4 bg-navy-50 rounded-lg border border-navy-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-electric-500 rounded-full animate-loading-pulse"></div>
                    <span className="text-navy-600">Analyzing your prompt and generating smart contract...</span>
                  </div>
                </div>
              )}
              
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Information about backend status */}
              {backendStatus === 'unavailable' && (
                <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  Backend is offline. Your code will be generated but not saved to your account.
                </div>
              )}

              {backendStatus === 'available' && !walletConnected && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  Connect your wallet to save projects to your account for future access.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PromptGenerator;