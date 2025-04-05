
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bill, Session, Participant } from '@/types';
import { generateSessionId } from '@/utils/calculations';
import BillForm from '@/components/BillForm';
import BillUpload from '@/components/BillUpload';
import ParticipantList from '@/components/ParticipantList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'bill' | 'participants'>('bill');
  const [bill, setBill] = useState<Bill | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expiryMinutes, setExpiryMinutes] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>('manual');
  
  const handleSaveBill = (newBill: Bill) => {
    setBill(newBill);
    setStep('participants');
    window.scrollTo(0, 0);
  };
  
  const handleBillParsed = (parsedBill: Bill) => {
    setBill(parsedBill);
    setActiveTab('manual'); // Switch to manual tab to show the parsed bill data
  };
  
  const createSession = () => {
    if (!bill) {
      toast.error("Bill details are missing");
      return;
    }
    
    if (participants.length === 0) {
      toast.error("Please add at least one participant");
      return;
    }
    
    const sessionId = generateSessionId();
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    
    const session: Session = {
      id: sessionId,
      bill,
      organizer: "current-user", // This would normally be a user ID
      participants,
      expiresAt: expiryTime,
      locked: false,
      created: Date.now()
    };
    
    // Store session in localStorage for demo purposes
    // In a real app, this would be saved to a database
    const existingSessions = JSON.parse(localStorage.getItem('splitSessions') || '[]');
    localStorage.setItem('splitSessions', JSON.stringify([...existingSessions, session]));
    
    toast.success('Session created successfully!');
    navigate(`/summary/${sessionId}`);
  };
  
  return (
    <div className="main-container min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Bill</h1>
        <p className="text-muted-foreground mb-8">
          {step === 'bill' 
            ? 'Start by entering the bill details below or upload a receipt'
            : 'Now add participants who will share this bill'}
        </p>
        
        {step === 'bill' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <BillForm 
                initialBill={bill || undefined} 
                onSave={handleSaveBill}
              />
            </TabsContent>
            
            <TabsContent value="upload">
              <BillUpload onBillParsed={handleBillParsed} />
              {bill && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Bill data has been extracted! Switch to Manual Entry tab to review and make changes if needed.
                  </p>
                  <Button onClick={() => handleSaveBill(bill)}>
                    Continue with this bill
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <ParticipantList 
              participants={participants}
              onChange={setParticipants}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryTime">Time Limit (minutes)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="expiryTime"
                      type="number"
                      min="1"
                      max="1440"
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 30)}
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-muted-foreground">
                      Session will expire after {expiryMinutes} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('bill')}>
                Back to Bill
              </Button>
              
              <Button onClick={createSession} disabled={participants.length === 0}>
                Create Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
