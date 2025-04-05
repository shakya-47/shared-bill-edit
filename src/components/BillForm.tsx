
import { useState } from 'react';
import { Bill, BillItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TrashIcon, PlusIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';

interface BillFormProps {
  initialBill?: Bill;
  onSave: (bill: Bill) => void;
}

const emptyBill: Bill = {
  merchant: '',
  date: new Date().toISOString().split('T')[0],
  currency: 'INR',
  items: [],
  charges: {
    subTotal: 0,
    tax: 0,
    serviceCharge: 0,
    discount: 0,
    total: 0
  }
};

const BillForm = ({ initialBill = emptyBill, onSave }: BillFormProps) => {
  const [bill, setBill] = useState<Bill>(initialBill);

  const addItem = () => {
    const newItem: BillItem = {
      id: `item${bill.items.length + 1}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    
    setBill({
      ...bill,
      items: [...bill.items, newItem]
    });
  };

  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const updatedItems = [...bill.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    };
    
    // Recalculate total price if quantity or unit price changed
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : updatedItems[index].quantity;
      const price = field === 'unitPrice' ? Number(value) : updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = qty * price;
    }
    
    setBill({ 
      ...bill, 
      items: updatedItems 
    });
    
    // Recalculate subtotal and total
    updateSubtotalAndTotal(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = bill.items.filter((_, i) => i !== index);
    setBill({ 
      ...bill, 
      items: updatedItems 
    });
    
    // Recalculate subtotal and total
    updateSubtotalAndTotal(updatedItems);
  };

  const updateSubtotalAndTotal = (items: BillItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subTotal + bill.charges.tax + bill.charges.serviceCharge - bill.charges.discount;
    
    setBill({
      ...bill,
      charges: {
        ...bill.charges,
        subTotal,
        total
      }
    });
  };

  const updateCharges = (field: keyof Omit<Bill['charges'], 'subTotal' | 'total'>, value: number) => {
    const updatedCharges = {
      ...bill.charges,
      [field]: value
    };
    
    const total = bill.charges.subTotal + updatedCharges.tax + updatedCharges.serviceCharge - updatedCharges.discount;
    
    setBill({
      ...bill,
      charges: {
        ...updatedCharges,
        total
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bill);
  };

  // Update billing details
  const updateBillInfo = (field: keyof Bill, value: string) => {
    setBill({
      ...bill,
      [field]: value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant">Restaurant/Store Name</Label>
              <Input
                id="merchant"
                placeholder="e.g. Pizza Palace"
                value={bill.merchant}
                onChange={(e) => updateBillInfo('merchant', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={bill.date}
                onChange={(e) => updateBillInfo('date', e.target.value)}
                required
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Items</h3>
            {bill.items.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No items yet. Add an item to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 font-medium text-sm hidden md:grid">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Items */}
                {bill.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-5 space-y-1">
                      <Label className="md:hidden">Item Name</Label>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <Label className="md:hidden">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <Label className="md:hidden">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <Label className="md:hidden">Total</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.totalPrice}
                        onChange={(e) => updateItem(index, 'totalPrice', parseFloat(e.target.value) || 0)}
                        disabled
                      />
                    </div>
                    
                    <div className="md:col-span-1 flex justify-end">
                      <Button 
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={addItem}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Charges</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={bill.charges.tax}
                    onChange={(e) => updateCharges('tax', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceCharge">Service Charge</Label>
                  <Input
                    id="serviceCharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={bill.charges.serviceCharge}
                    onChange={(e) => updateCharges('serviceCharge', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={bill.charges.discount}
                    onChange={(e) => updateCharges('discount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="Currency code (e.g. INR)"
                    value={bill.currency}
                    onChange={(e) => updateBillInfo('currency', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(bill.charges.subTotal, bill.currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(bill.charges.tax, bill.currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service Charge:</span>
                  <span>{formatCurrency(bill.charges.serviceCharge, bill.currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(bill.charges.discount, bill.currency)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(bill.charges.total, bill.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2 pb-6">
          <Button type="submit" className="px-8">Save Bill</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default BillForm;
