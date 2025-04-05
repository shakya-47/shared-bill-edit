import { useState, useEffect } from 'react';
import { 
  Bill, 
  BillItem, 
  Participant, 
  ParticipantSelection,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/calculations';
import { PlusIcon, MinusIcon } from 'lucide-react';

interface ItemListProps {
  bill: Bill;
  participant: Participant;
  locked?: boolean;
  onChange: (selections: ParticipantSelection[]) => void;
}

const ItemList = ({ bill, participant, locked = false, onChange }: ItemListProps) => {
  const [selections, setSelections] = useState<ParticipantSelection[]>(
    participant.selections || []
  );
  
  // Keep track of available quantities for each item
  const [availableQuantity, setAvailableQuantity] = useState<Record<string, number>>({});

  useEffect(() => {
    // Calculate available quantities for each item
    const quantities: Record<string, number> = {};
    bill.items.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    
    setAvailableQuantity(quantities);
  }, [bill.items]);
  
  const getSelectedQuantity = (itemId: string): number => {
    const selection = selections.find(s => s.itemId === itemId);
    return selection?.quantity || 0;
  };
  
  const updateSelection = (itemId: string, change: number): void => {
    const currentQty = getSelectedQuantity(itemId);
    const newQty = Math.max(0, Math.min(currentQty + change, availableQuantity[itemId] || 0));
    
    // Update or remove the selection
    let newSelections = [...selections];
    const selectionIndex = newSelections.findIndex(s => s.itemId === itemId);
    
    if (newQty === 0) {
      // Remove selection if quantity is 0
      if (selectionIndex >= 0) {
        newSelections.splice(selectionIndex, 1);
      }
    } else {
      // Add or update selection
      if (selectionIndex >= 0) {
        newSelections[selectionIndex] = { itemId, quantity: newQty };
      } else {
        newSelections.push({ itemId, quantity: newQty });
      }
    }
    
    setSelections(newSelections);
    onChange(newSelections);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Select Your Items</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bill.items.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No items available yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items list header */}
            <div className="grid grid-cols-12 gap-2 font-medium text-sm hidden md:grid">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-3">Quantity</div>
              <div className="col-span-2">Total</div>
            </div>
            
            {/* Items */}
            {bill.items.map((item) => {
              const selectedQty = getSelectedQuantity(item.id);
              
              return (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-2 items-center py-2 border-b">
                  <div className="md:col-span-5 font-medium">
                    <div>{item.name}</div>
                    <div className="text-muted-foreground text-xs md:hidden">
                      {formatCurrency(item.unitPrice, bill.currency)} each
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 hidden md:block">
                    {formatCurrency(item.unitPrice, bill.currency)}
                  </div>
                  
                  <div className="md:col-span-3 flex items-center space-x-2">
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={selectedQty <= 0 || locked}
                      onClick={() => updateSelection(item.id, -1)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-8 text-center">{selectedQty}</span>
                    
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={selectedQty >= item.quantity || locked}
                      onClick={() => updateSelection(item.id, 1)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-xs text-muted-foreground">
                      of {item.quantity}
                    </span>
                  </div>
                  
                  <div className="md:col-span-2 text-right md:text-left">
                    {formatCurrency(item.unitPrice * selectedQty, bill.currency)}
                  </div>
                </div>
              );
            })}
            
            <Separator />
            
            {/* Summary of selected items */}
            <div className="pt-2">
              <div className="font-medium text-lg mb-2">Your Selection</div>
              
              {selections.length === 0 ? (
                <div className="text-muted-foreground">
                  You haven't selected any items yet
                </div>
              ) : (
                <div className="space-y-2">
                  {selections.map((selection) => {
                    const item = bill.items.find(i => i.id === selection.itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={selection.itemId} className="flex justify-between">
                        <span>
                          {selection.quantity} × {item.name}
                        </span>
                        <span>
                          {formatCurrency(item.unitPrice * selection.quantity, bill.currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemList;
