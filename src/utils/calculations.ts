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

  // First, calculate amounts for non-owner participants
  const nonOwnerParticipants = participants.filter(p => p.name !== 'Owner');
  const ownerParticipant = participants.find(p => p.name === 'Owner');

  if (!ownerParticipant) {
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
  }

  // Calculate amounts for non-owner participants
  let totalNonOwnerSubtotal = 0;
  let totalNonOwnerTax = 0;
  let totalNonOwnerServiceCharge = 0;
  let totalNonOwnerDiscount = 0;

  nonOwnerParticipants.forEach((participant) => {
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

    // Add to totals for non-owner participants
    totalNonOwnerSubtotal += subTotal;
    totalNonOwnerTax += tax;
    totalNonOwnerServiceCharge += serviceCharge;
    totalNonOwnerDiscount += discount;

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

  // Calculate owner's amounts (remaining amounts)
  const ownerSubtotal = bill.charges.subTotal - totalNonOwnerSubtotal;
  const ownerTax = bill.charges.tax - totalNonOwnerTax;
  const ownerServiceCharge = bill.charges.serviceCharge - totalNonOwnerServiceCharge;
  const ownerDiscount = bill.charges.discount - totalNonOwnerDiscount;
  const ownerTotal = ownerSubtotal + ownerTax + ownerServiceCharge - ownerDiscount;

  // Add owner's summary
  participantSummaries.push({
    ...ownerParticipant,
    items: ownerParticipant.selections ? getParticipantItems(bill, ownerParticipant.selections) : [],
    subTotal: ownerSubtotal,
    tax: ownerTax,
    serviceCharge: ownerServiceCharge,
    discount: ownerDiscount,
    total: ownerTotal
  });

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
