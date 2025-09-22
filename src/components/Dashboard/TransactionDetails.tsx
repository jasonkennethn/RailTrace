import React from 'react';
import { TransactionWizard } from '../ui/TransactionWizard';

// Sample transaction data
const sampleTransaction = {
  partId: 'AXLE-BR-54321A',
  partHash: '0x32d66592a1469a72e5c5531d4a14360925665edb46',
  transactionHash: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  blockNumber: 123456,
  eventType: 'Installation',
  depotId: 'Depot 789',
  officerId: 'Officer 456',
  location: 'Track 10',
  condition: 'Good',
  dateTime: '2024-07-26 14:30',
  status: 'confirmed' as const,
  additionalData: {
    temperature: '25°C',
    humidity: '60%',
    notes: 'Routine maintenance completed successfully'
  }
};

interface TransactionDetailsProps {
  onBack?: () => void;
}

export function TransactionDetails({ onBack }: TransactionDetailsProps) {
  return (
    <TransactionWizard 
      transaction={sampleTransaction} 
      onBack={onBack}
    />
  );
}
