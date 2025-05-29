// src/components/TemplatesSection.tsx
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Vote, Coins, Users, TrendingUp, Shield, Calendar, MessageSquare, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
const templates = [
  {
    id: "nft-minting", 
    title: "NFT Minting",
    description: "Create and mint unique digital assets with metadata and ownership tracking",
    icon: TrendingUp,
    difficulty: "Beginner",
    estimatedTime: "5 min",
    features: ["Metadata support", "Ownership transfer", "Batch minting"]
  },
  {
    id: "token-faucet",
    title: "Token Faucet",
    description: "Distribute tokens to users with rate limiting and anti-spam protection",
    icon: Coins,
    difficulty: "Beginner",
    estimatedTime: "3 min",
    features: ["Rate limiting", "User verification", "Token distribution"]
  },
  {
    id: "dao-voting",
    title: "DAO Voting",
    description: "Decentralized governance with proposal creation and weighted voting",
    icon: Vote,
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    features: ["Proposal system", "Weighted voting", "Quorum requirements"]
  },
  {
    id: "crowdfunding",
    title: "Crowdfunding Campaign",
    description: "Raise funds with milestone tracking and automatic refunds",
    icon: Users,
    difficulty: "Advanced",
    estimatedTime: "15 min",
    features: ["Milestone tracking", "Refund system", "Goal management"]
  },
  {
    id: "token-gated",
    title: "Token-Gated Access",
    description: "Create contracts where only users who hold a specific token can access a service",
    icon: Shield,
    difficulty: "Intermediate",
    estimatedTime: "8 min",
    features: ["Token verification", "Access control", "Service protection"]
  },
  {
    id: "subscription",
    title: "Subscription Access",
    description: "Contracts where users pay for 30-day access to a feature or service",
    icon: Calendar,
    difficulty: "Intermediate",
    estimatedTime: "12 min",
    features: ["Time-based access", "Payment handling", "Auto-renewal"]
  },
  {
    id: "feedback",
    title: "Anonymous Feedback Collector",
    description: "A smart contract to collect anonymous suggestions or reviews",
    icon: MessageSquare,
    difficulty: "Beginner",
    estimatedTime: "6 min",
    features: ["Anonymous posting", "Data privacy", "Feedback aggregation"]
  },
  {
    id: "weighted-voting",
    title: "Weighted Voting System",
    description: "Voting contracts where votes are weighted based on token balance",
    icon: Scale,
    difficulty: "Advanced",
    estimatedTime: "18 min",
    features: ["Balance-weighted votes", "Token integration", "Governance rules"]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "bg-green-100 text-green-700 border-green-200";
    case "Intermediate": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Advanced": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Helper function to generate template prompts
const getTemplatePrompt = (template: any): string => {
  return `Create a ${template.title} smart contract with the following features:
${template.features.map((f: string) => `- ${f}`).join('\n')}

The contract should implement ${template.description.toLowerCase()}.`;
}

const TemplatesSection = () => {
  const navigate = useNavigate();
  
  // Show only first 4 templates on homepage
  const displayedTemplates = templates.slice(0, 4);

  const handleViewAllTemplates = () => {
    navigate('/templates');
  };
  
  const handleUseTemplate = (template: any) => {
    // Generate a prompt based on the template
    const prompt = getTemplatePrompt(template);
    
    // Navigate to prompt generator with the template info
    navigate('/', { 
      state: { 
        template: template.id,
        prompt: prompt
      } 
    });
    setTimeout(() => {
      const inputElement = document.querySelector('.prompt-input-section');
      if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <section className="py-16 bg-navy-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Prebuilt Templates
            </h2>
            <p className="text-lg text-navy-600">
              Start with proven smart contract templates and customize as needed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedTemplates.map((template, index) => (
              <Card key={index} className="p-6 border-navy-200 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-electric-100 rounded-lg flex items-center justify-center">
                      <template.icon className="w-6 h-6 text-electric-600" />
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
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-navy-300 text-navy-700 hover:bg-navy-50"
              onClick={handleViewAllTemplates}
            >
              View All Templates
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
export { templates };