// src/components/ExplainCanister.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Lightbulb, Loader2, ArrowLeft } from "lucide-react";
import { explainCode, Language } from "../lib/ai-service";

const ExplainCanister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("motoko");
  const [fileName, setFileName] = useState("Contract.mo");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromPreview, setFromPreview] = useState(false);
  
  // Load code from router state when component mounts
  useEffect(() => {
    console.log("ExplainCanister state:", location.state);
    if (location.state?.code) {
      setCode(location.state.code);
      
      if (location.state.language) {
        setLanguage(location.state.language as Language);
      }
      
      if (location.state.fileName) {
        setFileName(location.state.fileName);
      }
      
      if (location.state.fromPreview) {
        setFromPreview(true);
      }
      
      // Auto-explain when code is provided from CodePreview
      if (location.state.fromPreview && location.state.code) {
        handleExplain();
      }
    }
  }, [location.state]);

  const handleExplain = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await explainCode(code, language);
      setExplanation(result);
    } catch (err: any) {
      console.error("Error explaining code:", err);
      setError(err?.message || "Failed to explain code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    // Go back to the code preview if we came from there
    if (fromPreview) {
      navigate('/code-preview', { 
        state: { 
          code,
          language,
          fileName
        } 
      });
    } else {
      // Otherwise go to home
      navigate('/');
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Explain My Canister
            </h2>
            <p className="text-lg text-navy-600">
              Human-readable explanation of your {language} code
            </p>
          </div>
          
          <div className="mb-6 flex justify-start">
            <Button 
              variant="outline" 
              className="border-navy-300 text-navy-700 hover:bg-navy-50"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {fromPreview ? "Back to Code" : "Back"}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 border-navy-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-electric-500 rounded-full"></div>
                  <span className="font-medium text-navy-700">Your Code</span>
                </div>
                
                <Textarea
                  placeholder="Paste your Motoko smart contract code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[300px] font-mono text-sm border-navy-200 focus:border-electric-500 focus:ring-electric-500 resize-none bg-navy-900 text-white"
                />
                
                <Button 
                  onClick={handleExplain}
                  disabled={!code.trim() || isLoading}
                  className="w-full bg-electric-600 hover:bg-electric-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Explain
                    </>
                  )}
                </Button>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </Card>
            
            <Card className="p-6 border-navy-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-navy-700">Explanation</span>
                </div>
                
                {isLoading ? (
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-electric-600 animate-spin mx-auto mb-4" />
                      <p className="text-navy-600">Analyzing your code...</p>
                    </div>
                  </div>
                ) : explanation ? (
                  <div className="min-h-[300px] prose prose-sm max-w-none overflow-auto">
                    {explanation.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-navy-700 leading-relaxed mb-4">
                        {paragraph.startsWith('**') ? (
                          <span dangerouslySetInnerHTML={{
                            __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-navy-900">$1</strong>')
                          }} />
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-navy-500">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Explanation will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExplainCanister;