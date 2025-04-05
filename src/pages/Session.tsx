import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Session, Participant, ParticipantSelection } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ItemList from '@/components/ItemList';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/calculations';

const SessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Load session data
  useEffect(() => {
    const loadSession = () => {
      try {
        // In a real app, we'd fetch from a database
        const existingSessions = JSON.parse(localStorage.getItem('splitSessions') || '[]');
        const foundSession = existingSessions.find((s: Session) => s.id === id);
        
        if (!foundSession) {
          setError('Session not found');
          return;
        }
        
        setSession(foundSession);
        
        // Calculate time left
        const now = Date.now();
        const expiresAt = foundSession.expiresAt;
        setTimeLeft(Math.max(0, expiresAt - now));
        
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, [id]);
  
  // Timer logic
  useEffect(() => {
    if (!session || timeLeft === null) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (!prevTime || prevTime <= 1000) {
          clearInterval(timer);
          // Lock the session if timer expires
          if (session && !session.locked) {
            const updatedSession = {...session, locked: true};
            updateSessionInStorage(updatedSession);
            setSession(updatedSession);
            toast.info("Time's up! Bill is now locked.");
            navigate(`/summary/${session.id}`);
          }
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [session, timeLeft, navigate]);
  
  const handleJoinSession = () => {
    if (!session) return;
    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    // Check if participant already exists
    const existingParticipant = session.participants.find(
      p => p.name === participantName.trim() && 
           (p.email === participantEmail.trim() || (!p.email && !participantEmail.trim()))
    );
    
    if (existingParticipant) {
      setCurrentParticipant(existingParticipant);
      // Check if this participant has already submitted their selections
      if (existingParticipant.submitted) {
        // setSubmitted(true);
        toast.info("You've already submitted your selections");
      } else {
        toast.success(`Welcome back, ${existingParticipant.name}!`);
      }
    } else {
      toast.error('Your name is not in the participant list');
    }
  };
  
  const updateParticipantSelections = (selections: ParticipantSelection[]) => {
    if (!session || !currentParticipant) return;
    
    // Update current participant's selections
    const updatedParticipants = session.participants.map(p => 
      p.id === currentParticipant.id ? { ...p, selections } : p
    );
    
    const updatedSession = {
      ...session,
      participants: updatedParticipants
    };
    
    // Update in-memory state
    setSession(updatedSession);
    setCurrentParticipant({
      ...currentParticipant,
      selections
    });
    
    // Save to storage
    updateSessionInStorage(updatedSession);
  };

  const handleSubmitSelections = () => {
    if (!session || !currentParticipant) return;
    
    // Mark this participant as submitted
    const updatedParticipants = session.participants.map(p => 
      p.id === currentParticipant.id ? { 
        ...p, 
        selections: currentParticipant.selections || [],
        submitted: true 
      } : p
    );
    
    const updatedSession = {
      ...session,
      participants: updatedParticipants
    };
    
    // Update in-memory state
    setSession(updatedSession);
    setCurrentParticipant({
      ...currentParticipant,
      submitted: true
    });
    setSubmitted(true);
    
    // Save to storage
    updateSessionInStorage(updatedSession);
    
    toast.success('Your selections have been submitted!');
  };
  
  const updateSessionInStorage = (updatedSession: Session) => {
    try {
      const existingSessions = JSON.parse(localStorage.getItem('splitSessions') || '[]');
      const updatedSessions = existingSessions.map((s: Session) => 
        s.id === updatedSession.id ? updatedSession : s
      );
      
      localStorage.setItem('splitSessions', JSON.stringify(updatedSessions));
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };
  
  const formatTimeLeft = () => {
    if (timeLeft === null) return '--:--';
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const isOrganizer = () => {
    return session?.organizer === currentParticipant?.name;
  };
  
  if (loading) {
    return (
      <div className="main-container h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading session...</div>
        </div>
      </div>
    );
  }
  
  if (error || !session) {
    return (
      <div className="main-container h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || 'Session not found'}</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (session.locked) {
    return (
      <div className="main-container h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Session Locked</h1>
          <p className="text-muted-foreground mb-6">
            This bill is now locked for editing. View the summary to see what everyone owes.
          </p>
          <Button asChild>
            <Link to={`/summary/${session.id}`}>View Summary</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="main-container min-h-screen pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{session.bill.merchant}</h1>
            <div className="text-muted-foreground">
              Bill Date: {new Date(session.bill.date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-4 py-2 rounded-md font-mono text-lg ${
              timeLeft && timeLeft < 60000 ? 'bg-red-100 text-red-600' : 'bg-secondary'
            }`}>
              {formatTimeLeft()}
            </div>
            {isOrganizer() && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/summary/${session.id}`)}
                >
                  View Summary
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Set current participant to the first participant
                    const firstParticipant = session.participants[0];
                    setCurrentParticipant(firstParticipant);
                    setParticipantName(firstParticipant.name);
                    setParticipantEmail(firstParticipant.email || '');
                  }}
                >
                  Add my contribution
                </Button>
                {session.participants.every(p => p.submitted) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const upiLink = 'upi://pay?pa=upiaddress@okhdfcbank&pn=JohnDoe&cu=INR';
                      navigator.clipboard.writeText(upiLink);
                      toast.success('Payment link copied to clipboard');
                    }}
                  >
                    Generate Payment Link
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-6">
          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div>{formatCurrency(session.bill.charges.subTotal, session.bill.currency)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Tax</div>
                  <div>{formatCurrency(session.bill.charges.tax, session.bill.currency)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Service Charge</div>
                  <div>{formatCurrency(session.bill.charges.serviceCharge, session.bill.currency)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Discount</div>
                  <div>{formatCurrency(session.bill.charges.discount, session.bill.currency)}</div>
                </div>
                
                <div className="col-span-2">
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <div className="font-medium">Total</div>
                    <div className="font-medium">{formatCurrency(session.bill.charges.total, session.bill.currency)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Participant Selection or Login */}
          {!currentParticipant ? (
            <Card>
              <CardHeader>
                <CardTitle>Join Session</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleJoinSession}
                    disabled={!participantName.trim()}
                    className="w-full"
                  >
                    Join Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : submitted ? (
            <Card>
              <CardHeader>
                <CardTitle>Thank You!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Your selections have been successfully submitted. The session organizer can view your contributions.
                  </p>
                  <p className="text-muted-foreground">
                    When the session is complete, you'll be able to view the final breakdown.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <ItemList
                bill={session.bill}
                participant={currentParticipant}
                onChange={updateParticipantSelections}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitSelections}
                  size="lg"
                  className="mt-4"
                >
                  Submit Selections
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
