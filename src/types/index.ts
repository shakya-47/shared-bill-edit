
// Bill types
export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  participants?: ParticipantSelection[];
}

export interface BillCharges {
  subTotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
}

export interface Bill {
  merchant: string;
  date: string;
  currency: string;
  items: BillItem[];
  charges: BillCharges;
}

// Session types
export interface Session {
  id: string;
  bill: Bill;
  organizer: string;
  participants: Participant[];
  expiresAt: number; // timestamp
  locked: boolean;
  created: number; // timestamp
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  selections?: ParticipantSelection[];
  amountDue?: number;
  paid?: boolean;
}

export interface ParticipantSelection {
  itemId: string;
  quantity: number;
}

// Summary types
export interface ParticipantSummary extends Participant {
  items: BillItem[];
  subTotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
}

export interface SessionSummary {
  session: Session;
  participants: ParticipantSummary[];
}
