import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { calculateSessionSummary, formatCurrency } from '@/utils/calculations';
import { Session, SessionSummary, ParticipantSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/table';
import SummaryBreakdown from '@/components/SummaryBreakdown';
import { CheckIcon, AlertCircleIcon, WalletCardsIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const SummaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSummary = () => {
      try {
        // In a real app, we'd fetch from a database
        const existingSessions = JSON.parse(localStorage.getItem('splitSessions') || '[]');
        const foundSession: Session | undefined = existingSessions.find((s: Session) => s.id === id);
        
        if (!foundSession) {
          setError('Session not found');
          return;
        }
        
        // Calculate summary
        const sessionSummary = calculateSessionSummary(
          foundSession.bill,
          foundSession.participants
        );
        
        setSummary({
          ...sessionSummary,
          session: foundSession
        });
        
      } catch (err) {
        console.error('Error loading summary:', err);
        setError('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    
    loadSummary();
  }, [id]);
  
  const getSessionShareUrl = () => {
    return `${window.location.origin}/session/${id}`;
  };
  
  const copySessionLink = () => {
    navigator.clipboard.writeText(getSessionShareUrl());
    toast.success('Share link copied to clipboard');
  };
  
  const togglePaymentStatus = (participantId: string) => {
    if (!summary) return;
    
    // Update participant's payment status
    const updatedParticipants = summary.participants.map(participant => 
      participant.id === participantId 
        ? { ...participant, paid: !participant.paid }
        : participant
    );
    
    // Update the session in localStorage
    const existingSessions = JSON.parse(localStorage.getItem('splitSessions') || '[]');
    const updatedSessions = existingSessions.map((session: Session) => {
      if (session.id === id) {
        return {
          ...session,
          participants: session.participants.map(p => {
            const updatedParticipant = updatedParticipants.find(up => up.id === p.id);
            return updatedParticipant ? { ...p, paid: updatedParticipant.paid } : p;
          })
        };
      }
      return session;
    });
    
    localStorage.setItem('splitSessions', JSON.stringify(updatedSessions));
    
    // Update local state
    setSummary({
      ...summary,
      participants: updatedParticipants
    });
    
    const participant = updatedParticipants.find(p => p.id === participantId);
    if (participant) {
      toast.success(`${participant.name} marked as ${participant.paid ? 'paid' : 'unpaid'}`);
    }
  };
  
  if (loading) {
    return (
      <div className="main-container h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading summary...</div>
        </div>
      </div>
    );
  }
  
  if (error || !summary) {
    return (
      <div className="main-container h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || 'Summary not found'}</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const totalPaid = summary.participants
    .filter(p => p.paid)
    .reduce((sum, p) => sum + p.total, 0);
  
  const totalUnpaid = summary.participants
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + p.total, 0);
  
  return (
    <div className="main-container min-h-screen pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{summary.session.bill.merchant}</h1>
          <div className="text-muted-foreground mb-4">
            Bill Date: {new Date(summary.session.bill.date).toLocaleDateString()}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`/session/${summary.session.id}`}>Back to Session</Link>
            </Button>
            
            <Button variant="outline" onClick={copySessionLink}>
              Copy Share Link
            </Button>
            
            <Button asChild>
              <Link to="/create">Create New Bill</Link>
            </Button>
          </div>
        </div>

        {/* Participant Submission Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Participant Status</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Items Selected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {participant.submitted ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckIcon className="h-4 w-4 mr-1" /> Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-yellow-600">
                            <AlertCircleIcon className="h-4 w-4 mr-1" /> Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {participant.items?.length || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Participant Summary</CardTitle>
            <div className="text-sm text-muted-foreground">
              {summary.session.bill.charges.total > 0 && 
                `${formatCurrency(totalPaid, summary.session.bill.currency)} of ${formatCurrency(summary.session.bill.charges.total, summary.session.bill.currency)} paid`
              }
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Tax & Service</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(participant.subTotal, summary.session.bill.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          participant.tax + participant.serviceCharge - participant.discount, 
                          summary.session.bill.currency
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(participant.total, summary.session.bill.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Switch 
                            checked={participant.paid || false}
                            onCheckedChange={() => togglePaymentStatus(participant.id)}
                            className="mr-2"
                          />
                          <span className={`text-sm ${participant.paid ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {participant.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(summary.session.bill.charges.total, summary.session.bill.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPaid > 0 && (
                        <span className="text-sm text-green-600">
                          {formatCurrency(totalPaid, summary.session.bill.currency)} paid
                        </span>
                      )}
                      {totalUnpaid > 0 && totalPaid > 0 && <span className="mx-1">·</span>}
                      {totalUnpaid > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(totalUnpaid, summary.session.bill.currency)} pending
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold mt-6 mb-4">Individual Breakdowns</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.participants.map((participant) => (
            <SummaryBreakdown 
              key={participant.id}
              participant={participant}
              currency={summary.session.bill.currency}
              onTogglePayment={() => togglePaymentStatus(participant.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
