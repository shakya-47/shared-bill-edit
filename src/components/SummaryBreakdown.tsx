
import { ParticipantSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/calculations';
import { CheckIcon } from 'lucide-react';

interface SummaryBreakdownProps {
  participant: ParticipantSummary;
  showDetails?: boolean;
  currency: string;
}

const SummaryBreakdown = ({ 
  participant, 
  showDetails = true,
  currency
}: SummaryBreakdownProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{participant.name}</CardTitle>
          {participant.email && (
            <div className="text-sm text-muted-foreground">{participant.email}</div>
          )}
        </div>
        {participant.paid && (
          <div className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <CheckIcon className="h-3 w-3 mr-1" />
            Paid
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {showDetails && participant.items.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {participant.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>{formatCurrency(item.totalPrice, currency)}</span>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatCurrency(participant.subTotal, currency)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(participant.tax, currency)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span>{formatCurrency(participant.serviceCharge, currency)}</span>
              </div>
              
              {participant.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(participant.discount, currency)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground text-sm">
            {participant.items.length === 0 
              ? "No items selected" 
              : "Payment summary"}
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-medium">
          <span>Total Due</span>
          <span className={`${participant.total > 0 ? "text-primary" : ""}`}>
            {formatCurrency(participant.total, currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryBreakdown;
