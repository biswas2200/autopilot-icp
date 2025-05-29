import { Button } from "./ui/button";
import { Github, BookOpen } from "lucide-react";
import { Link } from 'react-router-dom';
import ConnectWalletButton from './ConnectWalletButton';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-electric-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <h1 className="text-xl font-bold text-navy-900">AutoPilot ICP</h1>
        </div>
        
        <nav className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-navy-600 hover:text-navy-900">
            <BookOpen className="w-4 h-4 mr-2" />
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="text-navy-600 hover:text-navy-900">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          
          <ConnectWalletButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;