import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ReportFormData } from "@/lib/types";

interface ReportChangesModalProps {
  isOpen: boolean;
  spaceId: number | null;
  onClose: () => void;
  spaceName: string;
}

const ReportChangesModal = ({ 
  isOpen, 
  spaceId, 
  onClose,
  spaceName 
}: ReportChangesModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ReportFormData>>({
    changeType: "",
    currentInfo: "",
    correctedInfo: "",
    additionalDetails: "",
    contactEmail: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!spaceId) {
      toast({
        title: "Error",
        description: "No coworking space selected.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.changeType) {
      toast({
        title: "Missing information",
        description: "Please select what needs updating.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit the report to the API
      await apiRequest('POST', '/api/reports', {
        ...formData,
        spaceId
      });
      
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review the information shortly.",
      });
      
      // Reset form and close modal
      setFormData({
        changeType: "",
        currentInfo: "",
        correctedInfo: "",
        additionalDetails: "",
        contactEmail: ""
      });
      onClose();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{zIndex: 9999}} className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Report Information Changes
              </DialogTitle>
              <p className="text-sm text-gray-600">Help us keep information up to date for {spaceName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="changeType">What needs updating?</Label>
              <Select 
                value={formData.changeType} 
                onValueChange={(value) => handleInputChange('changeType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select change type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pricing">Pricing information</SelectItem>
                  <SelectItem value="services">Services/amenities</SelectItem>
                  <SelectItem value="contact">Contact details</SelectItem>
                  <SelectItem value="location">Location details</SelectItem>
                  <SelectItem value="hours">Opening hours</SelectItem>
                  <SelectItem value="other">Other information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currentInfo">Current information</Label>
              <Input 
                id="currentInfo" 
                placeholder="What is currently shown"
                value={formData.currentInfo || ''}
                onChange={(e) => handleInputChange('currentInfo', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="correctedInfo">Corrected information</Label>
              <Input 
                id="correctedInfo" 
                placeholder="What should be shown"
                value={formData.correctedInfo || ''}
                onChange={(e) => handleInputChange('correctedInfo', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="additionalDetails">Additional details</Label>
              <Textarea 
                id="additionalDetails" 
                placeholder="Any other information that might help"
                value={formData.additionalDetails || ''}
                onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Your email (optional)</Label>
              <Input 
                id="contactEmail" 
                type="email" 
                placeholder="In case we need to follow up"
                value={formData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportChangesModal;
