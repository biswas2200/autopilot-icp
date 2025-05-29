// src/pages/Templates.tsx
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Code2, Zap, Shield, Users, Lock, Calendar, MessageSquare, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getAllTemplates, generatePromptFromTemplate } from "../lib/template-service";
import { Language } from "../lib/ai-service";

// Map template ids to Lucide icons
const iconMap: Record<string, any> = {
  'nft-minting': Code2,
  'token-faucet': Zap,
  'dao-voting': Users,
  'crowdfunding': Shield,
  'token-gated': Lock,
  'subscription': Calendar,
  'feedback': MessageSquare,
  'weighted-voting': BarChart2
};

// Get templates from the service
const templates = getAllTemplates().map(template => ({
  ...template,
  // Map to the structure expected by the existing component
  title: template.name,
  estimatedTime: `${template.estimatedTime} min`,
  icon: iconMap[template.id] || Code2 // Default to Code2 if no matching icon
}));

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-100 text-green-700 border-green-200";
    case "Intermediate": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Advanced": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const Templates = () => {
  const navigate = useNavigate();

  // Handle template selection
  const handleUseTemplate = (templateId: string) => {
    // Default to Motoko - user can change this on the prompt page
    const prompt = generatePromptFromTemplate(templateId, "motoko" as Language);
    navigate('/', { 
      state: { 
        template: templateId, 
        prompt: prompt 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="py-16 bg-navy-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-navy-600 hover:text-navy-900 mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
                  All Templates
                </h1>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Browse our complete collection of smart contract templates. 
                  Each template is production-ready and fully customizable.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <Card key={template.id || index} className="p-6 border-navy-200 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-electric-100 rounded-lg flex items-center justify-center">
                        {template.icon && <template.icon className="w-6 h-6 text-electric-600" />}
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-navy-900 mb-2">{template.title}</h3>
                      <p className="text-sm text-navy-600 leading-relaxed mb-4">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-navy-500">
                        <span>Est. time: {template.estimatedTime}</span>
                      </div>
                      
                      <div className="space-y-1">
                        {template.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-electric-500 rounded-full"></div>
                            <span className="text-xs text-navy-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-electric-600 hover:bg-electric-700 text-white mt-4"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        Use This Template
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12 p-8 bg-white rounded-lg border border-navy-200">
              <h3 className="text-xl font-bold text-navy-900 mb-2">
                Need a Custom Template?
              </h3>
              <p className="text-navy-600 mb-4">
                Can't find what you're looking for? Use our AI prompt generator to create a custom smart contract.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-electric-600 hover:bg-electric-700 text-white"
              >
                Try AI Generator
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Templates;