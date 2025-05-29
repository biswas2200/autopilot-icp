import { Button } from "./ui/button";
import { ArrowRight, Code2, Zap, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-navy-50 via-white to-electric-50 flex items-center justify-center overflow-hidden">
      {/* Background geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-electric-400 rounded-full"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-electric-200 rounded-lg rotate-45"></div>
        <div className="absolute bottom-32 left-1/3 w-24 h-24 border-2 border-navy-300 rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-electric-100 to-navy-100 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-navy-900 mb-6 leading-tight">
            From Prompt to
            <span className="text-electric-600 block">Production</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-navy-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Describe your idea, deploy your smart contract — all on ICP.
          </p>
          
          <Button 
            size="lg" 
            className="bg-electric-600 hover:bg-electric-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-electric-200"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur rounded-lg border border-navy-100">
              <Code2 className="w-12 h-12 text-electric-600 mb-4" />
              <h3 className="font-semibold text-navy-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-navy-600 text-center">Generate smart contracts from natural language</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur rounded-lg border border-navy-100">
              <Zap className="w-12 h-12 text-electric-600 mb-4" />
              <h3 className="font-semibold text-navy-900 mb-2">Instant Deploy</h3>
              <p className="text-sm text-navy-600 text-center">Deploy directly to Internet Computer</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur rounded-lg border border-navy-100">
              <Shield className="w-12 h-12 text-electric-600 mb-4" />
              <h3 className="font-semibold text-navy-900 mb-2">Production Ready</h3>
              <p className="text-sm text-navy-600 text-center">Secure, audited smart contract templates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
