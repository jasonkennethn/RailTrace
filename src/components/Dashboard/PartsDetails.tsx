import React from 'react';
import { PartsWizard } from '../ui/PartsWizard';

interface PartsDetailsProps {
  partData: any; // BlockchainRecord from BlockchainAudit
  onBack?: () => void;
}

export function PartsDetails({ partData, onBack }: PartsDetailsProps) {
  // Transform BlockchainRecord to PartData format
  const transformedData = {
    partId: partData.fittingId || partData.partId || 'Unknown',
    partHash: partData.partHash || partData.fittingId || 'N/A',
    transactionHash: partData.transactionHash || 'N/A',
    blockNumber: partData.blockNumber || 0,
    eventType: partData.eventType || 'unknown',
    depotId: partData.depotId || 'N/A',
    officerId: partData.officerId || 'N/A',
    location: partData.location || 'N/A',
    condition: partData.condition || 'Good',
    dateTime: partData.timestamp ? partData.timestamp.toLocaleString() : new Date().toLocaleString(),
    status: partData.verificationStatus || 'confirmed',
    metadata: partData.metadata || {},
    fittingId: partData.fittingId,
    verificationStatus: partData.verificationStatus,
    timestamp: partData.timestamp
  };

  return (
    <PartsWizard 
      partData={transformedData} 
      onBack={onBack}
    />
  );
}
