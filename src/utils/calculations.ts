
import { Bill, BillItem, Participant, ParticipantSelection, ParticipantSummary, SessionSummary } from '@/types';

// Get participant's bill items based on their selections
export const getParticipantItems = (
  bill: Bill,
  participantSelections: ParticipantSelection[]
): BillItem[] => {
  if (!participantSelections?.length) return [];
  
  return bill.items
    .map((item) => {
      const selection = participantSelections.find((s) => s.itemId === item.id);
      if (!selection || selection.quantity <= 0) return null;

      return {
        ...item,
        quantity: selection.quantity,
        totalPrice: item.unitPrice * selection.quantity
      };
    })
    .filter((item): item is BillItem => item !== null);
};

// Calculate subtotal for a participant
export const calculateParticipantSubtotal = (
  participantItems: BillItem[]
): number => {
  return participantItems.reduce((sum, item) => sum + item.totalPrice, 0);
};

// Calculate proportional amount for tax, service charge, etc.
export const calculateProportionalAmount = (
  amount: number,
  participantSubtotal: number,
  billSubtotal: number
): number => {
  if (billSubtotal === 0) return 0;
  return (participantSubtotal / billSubtotal) * amount;
};

// Calculate full summary for a session
export const calculateSessionSummary = (
  bill: Bill,
  participants: Participant[]
): SessionSummary => {
  const participantSummaries: ParticipantSummary[] = [];
  let totalCalculatedAmount = 0;

  // Calculate amount for each participant
  participants.forEach((participant) => {
    if (!participant.selections?.length) {
      // Participant hasn't selected anything
      participantSummaries.push({
        ...participant,
        items: [],
        subTotal: 0,
        tax: 0,
        serviceCharge: 0,
        discount: 0,
        total: 0
      });
      return;
    }

    const participantItems = getParticipantItems(bill, participant.selections);
    const subTotal = calculateParticipantSubtotal(participantItems);
    
    // Calculate proportional amounts
    const tax = calculateProportionalAmount(
      bill.charges.tax,
      subTotal,
      bill.charges.subTotal
    );
    
    const serviceCharge = calculateProportionalAmount(
      bill.charges.serviceCharge,
      subTotal,
      bill.charges.subTotal
    );
    
    const discount = calculateProportionalAmount(
      bill.charges.discount,
      subTotal,
      bill.charges.subTotal
    );
    
    const total = subTotal + tax + serviceCharge - discount;
    totalCalculatedAmount += total;

    participantSummaries.push({
      ...participant,
      items: participantItems,
      subTotal,
      tax,
      serviceCharge,
      discount,
      total,
    });
  });

  // Handle rounding errors by adjusting the last participant's amount
  const billTotal = bill.charges.total;
  const roundingError = billTotal - totalCalculatedAmount;
  
  if (Math.abs(roundingError) > 0.01 && participantSummaries.length > 0) {
    // Find participant with highest total to adjust
    const highestTotalParticipant = [...participantSummaries]
      .sort((a, b) => b.total - a.total)[0];
    
    const index = participantSummaries.findIndex(p => p.id === highestTotalParticipant.id);
    if (index >= 0) {
      participantSummaries[index].total += roundingError;
    }
  }

  return {
    session: {
      id: '',
      bill,
      organizer: '',
      participants,
      expiresAt: 0,
      locked: false,
      created: 0
    },
    participants: participantSummaries
  };
};

// Generate a random session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};
