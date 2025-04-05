
import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { analyzeReceipt } from '@/utils/imageAnalysis';
import { Bill } from '@/types';

interface BillUploadProps {
  onBillParsed: (bill: Bill) => void;
}

const BillUpload = ({ onBillParsed }: BillUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        setUploadedImage(base64Image);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const processReceipt = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    try {
      const parsedBill = await analyzeReceipt(uploadedImage);
      if (parsedBill) {
        onBillParsed(parsedBill);
        toast.success('Receipt analyzed successfully');
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast.error('Failed to analyze receipt');
    } finally {
      setIsProcessing(false);
      setUploadedImage(null); // Reset the image after processing
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Upload Receipt</CardTitle>
        <CardDescription>
          Upload a photo of your receipt and we'll automatically extract the details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!uploadedImage ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or JPEG (max 5MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isUploading || isProcessing}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden max-h-[300px] flex items-center justify-center">
              <img 
                src={uploadedImage} 
                alt="Uploaded receipt" 
                className="object-contain max-h-[300px] max-w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {uploadedImage && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setUploadedImage(null)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={processReceipt}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Receipt
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BillUpload;
