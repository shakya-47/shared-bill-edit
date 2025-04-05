
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateSessionSummary, formatCurrency } from '@/utils/calculations';
import { Session, SessionSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SummaryBreakdown from '@/components/SummaryBreakdown';
import { CheckIcon, AlertCircleIcon } from 'lucide-react';

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
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Participant</th>
                    <th className="pb-2 text-right">Status</th>
                    <th className="pb-2 text-right">Items Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.participants.map((participant) => (
                    <tr key={participant.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {participant.submitted ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckIcon className="h-4 w-4 mr-1" /> Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-yellow-600">
                            <AlertCircleIcon className="h-4 w-4 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {participant.items?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Participant</th>
                    <th className="pb-2 text-right">Items</th>
                    <th className="pb-2 text-right">Tax & Service</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.participants.map((participant) => (
                    <tr key={participant.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="text-xs text-muted-foreground">{participant.email}</div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(participant.subTotal, summary.session.bill.currency)}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(
                          participant.tax + participant.serviceCharge - participant.discount, 
                          summary.session.bill.currency
                        )}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(participant.total, summary.session.bill.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-3 font-medium">Total</td>
                    <td className="pt-3 text-right font-medium">
                      {formatCurrency(summary.session.bill.charges.total, summary.session.bill.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
