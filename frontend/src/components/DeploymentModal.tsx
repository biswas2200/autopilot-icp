// src/components/DeploymentModal.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Check, ExternalLink, Copy } from 'lucide-react';
import { toast } from './ui/use-toast';

type DeploymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  canisterId: string;
};

const DeploymentModal = ({ isOpen, onClose, canisterId }: DeploymentModalProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(canisterId);
    toast({
      title: "Canister ID copied to clipboard",
      duration: 2000
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deployment Successful!</DialogTitle>
          <DialogDescription>
            Your smart contract has been successfully deployed to the Internet Computer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Canister ID:</p>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1 overflow-x-auto">
                {canisterId}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Your canister is now live on the Internet Computer network.</p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="flex-1 bg-electric-600 hover:bg-electric-700 text-white"
            onClick={() => window.open(`https://dashboard.internetcomputer.org/canister/${canisterId}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on IC Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;