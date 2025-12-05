// Payment Processor Service - Modular payment system
// All functions are placeholders until real API keys are added

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  platformFee: number;
  organizerPayout: number;
  message: string;
}

export interface PaymentRequest {
  amount: number;
  customerEmail: string;
  customerPhone?: string;
  eventId: string;
  organizerId: string;
}

// Get commission rate (default 10%)
export const getCommissionRate = (): number => {
  return 10; // Placeholder - will be fetched from platform_settings
};

// Calculate platform fee and organizer payout
export const calculateSplit = (amount: number): { platformFee: number; organizerPayout: number } => {
  const commissionRate = getCommissionRate();
  const platformFee = (amount * commissionRate) / 100;
  const organizerPayout = amount - platformFee;
  return { platformFee, organizerPayout };
};

// Generate fake transaction ID
const generateTransactionId = (prefix: string): string => {
  return `${prefix}_TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

// MPESA Payment Placeholder
export const processMpesaPaymentPlaceholder = async (request: PaymentRequest): Promise<PaymentResult> => {
  console.log('Processing MPESA payment (TEST MODE):', request);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { platformFee, organizerPayout } = calculateSplit(request.amount);
  
  return {
    success: true,
    transactionId: generateTransactionId('MPESA'),
    amount: request.amount,
    platformFee,
    organizerPayout,
    message: 'MPESA payment processed successfully (Test Mode)'
  };
};

// Stripe Split Payment Placeholder
export const processStripeSplitPaymentPlaceholder = async (request: PaymentRequest): Promise<PaymentResult> => {
  console.log('Processing Stripe payment (TEST MODE):', request);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { platformFee, organizerPayout } = calculateSplit(request.amount);
  
  return {
    success: true,
    transactionId: generateTransactionId('STRIPE'),
    amount: request.amount,
    platformFee,
    organizerPayout,
    message: 'Stripe payment processed successfully (Test Mode)'
  };
};

// PayPal Split Payment Placeholder
export const processPayPalSplitPaymentPlaceholder = async (request: PaymentRequest): Promise<PaymentResult> => {
  console.log('Processing PayPal payment (TEST MODE):', request);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { platformFee, organizerPayout } = calculateSplit(request.amount);
  
  return {
    success: true,
    transactionId: generateTransactionId('PAYPAL'),
    amount: request.amount,
    platformFee,
    organizerPayout,
    message: 'PayPal payment processed successfully (Test Mode)'
  };
};

// Main payment processor that routes to appropriate gateway
export const processPayment = async (
  method: 'mpesa' | 'stripe' | 'paypal',
  request: PaymentRequest
): Promise<PaymentResult> => {
  switch (method) {
    case 'mpesa':
      return processMpesaPaymentPlaceholder(request);
    case 'stripe':
      return processStripeSplitPaymentPlaceholder(request);
    case 'paypal':
      return processPayPalSplitPaymentPlaceholder(request);
    default:
      throw new Error('Invalid payment method');
  }
};
