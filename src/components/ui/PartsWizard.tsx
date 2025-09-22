import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ExternalLink, Receipt, Tag, Calendar, Warehouse, Shield, User, MapPin, QrCode } from 'lucide-react';

interface PartData {
  partId: string;
  partHash: string;
  transactionHash: string;
  blockNumber: number;
  eventType: string;
  depotId: string;
  officerId: string;
  location: string;
  condition: string;
  dateTime: string;
  status: 'confirmed' | 'pending' | 'failed';
  metadata?: Record<string, any>;
  fittingId?: string;
  verificationStatus?: string;
  timestamp?: Date;
}

interface PartsWizardProps {
  partData: PartData;
  onBack?: () => void;
  className?: string;
}

interface WizardStep {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Array<{
    key: string;
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    copyable?: boolean;
  }>;
}

export function PartsWizard({ partData, onBack, className = '' }: PartsWizardProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['basic']));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(true);

  const copyToClipboard = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-700 dark:text-green-400',
          dotColor: 'bg-green-500',
          label: 'Confirmed'
        };
      case 'pending':
        return {
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-700 dark:text-amber-400',
          dotColor: 'bg-amber-500',
          label: 'Pending'
        };
      case 'failed':
        return {
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-700 dark:text-red-400',
          dotColor: 'bg-red-500',
          label: 'Failed'
        };
      default:
        return {
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-700 dark:text-gray-400',
          dotColor: 'bg-gray-500',
          label: 'Unknown'
        };
    }
  };

  const truncateHash = (hash: string, startChars: number = 6, endChars: number = 4) => {
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  };

  const formatDateTime = (dateTime: string | Date) => {
    if (dateTime instanceof Date) {
      return dateTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    // If it's a string, try to parse it and format
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateTime;
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: QrCode,
      fields: [
        {
          key: 'partId',
          label: 'Part ID',
          value: partData.partId || partData.fittingId || 'N/A',
          icon: Tag,
          copyable: true
        },
        {
          key: 'dateTime',
          label: 'Date',
          value: formatDateTime(partData.dateTime || partData.timestamp || new Date()),
          icon: Calendar
        },
        {
          key: 'status',
          label: 'Status',
          value: partData.status || partData.verificationStatus || 'confirmed',
          icon: Shield
        }
      ]
    },
    {
      id: 'transaction',
      title: 'Transaction Details',
      icon: Receipt,
      fields: [
        {
          key: 'transactionHash',
          label: 'Transaction Hash',
          value: partData.transactionHash || 'N/A',
          icon: Receipt,
          copyable: true
        },
        {
          key: 'blockNumber',
          label: 'Block Number',
          value: partData.blockNumber || 'N/A',
          icon: Tag
        },
        {
          key: 'eventType',
          label: 'Event Type',
          value: partData.eventType || 'N/A',
          icon: Tag
        }
      ]
    },
    {
      id: 'part',
      title: 'Part Information',
      icon: Tag,
      fields: [
        {
          key: 'partHash',
          label: 'Part Hash',
          value: partData.partHash || 'N/A',
          icon: Tag,
          copyable: true
        },
        {
          key: 'condition',
          label: 'Condition',
          value: partData.condition || 'Good',
          icon: Shield
        }
      ]
    },
    {
      id: 'location',
      title: 'Location & Personnel',
      icon: MapPin,
      fields: [
        {
          key: 'depotId',
          label: 'Depot ID',
          value: partData.depotId || 'N/A',
          icon: Warehouse
        },
        {
          key: 'officerId',
          label: 'Officer ID',
          value: partData.officerId || 'N/A',
          icon: User
        },
        {
          key: 'location',
          label: 'Location',
          value: partData.location || 'N/A',
          icon: MapPin
        }
      ]
    }
  ];

  const statusConfig = getStatusConfig(partData.status || partData.verificationStatus || 'confirmed');

  return (
    <div className={`min-h-screen bg-[#f6f7f8] dark:bg-[#111a21] ${className}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-[#f6f7f8]/80 dark:bg-[#111a21]/80 p-4 backdrop-blur-sm">
        <button 
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              // Fallback navigation
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="touch-target text-slate-800 dark:text-white p-2 -ml-2 active:scale-95 transition-transform hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-6">
          Part Details
        </h1>
      </header>

      <main className="p-4">
        {/* Main Part Card as collapsible */}
        <div className="rounded-xl bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] shadow-sm mb-4 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsSummaryExpanded((v) => !v)}
            className="w-full p-4 flex items-center justify-between touch-target hover:bg-[#f0f2f5] dark:hover:bg-[#0f141a] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1773cf]/10 text-[#1773cf] flex-shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#57606a] dark:text-[#8b949e] font-medium">Part ID</p>
                <p className="text-sm font-mono text-[#0d1117] dark:text-[#c9d1d9] truncate">
                  {truncateHash(partData.partId || partData.fittingId || 'Unknown Part', 4, 4)}
                </p>
              </div>
            </div>
            <div className="text-[#57606a] dark:text-[#8b949e]">
              {isSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          <div className={`transition-all duration-200 ease-in-out overflow-hidden ${isSummaryExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="text-right ml-auto">
                  <p className="text-xs text-[#57606a] dark:text-[#8b949e] font-medium">Date</p>
                  <p className="text-sm text-[#0d1117] dark:text-[#c9d1d9]">
                    {formatDateTime(partData.dateTime || partData.timestamp || new Date())}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full ${statusConfig.bgColor} px-2.5 py-1 text-xs font-medium ${statusConfig.textColor} ml-2`}> 
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}></span>
                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="space-y-4">
          {wizardSteps.map((step) => {
            const isExpanded = expandedSteps.has(step.id);
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className="rounded-lg bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] overflow-hidden"
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-3 flex items-center justify-between touch-target hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1773cf]/10 text-[#1773cf]">
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#0d1117] dark:text-[#c9d1d9]">{step.title}</h3>
                  </div>
                  <div className="text-[#57606a] dark:text-[#8b949e]">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Step Content */}
                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 py-2">
                    <div className="space-y-0">
                      {step.fields.map((field, index) => {
                        const FieldIcon = field.icon;
                        const displayValue = field.key === 'transactionHash' || field.key === 'partHash' || field.key === 'partId'
                          ? truncateHash(String(field.value)) 
                          : field.value;

                        return (
                          <div
                            key={field.key}
                            className={`py-2.5 ${
                              index > 0 ? 'border-t border-[#d0d7de] dark:border-[#30363d]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FieldIcon className="h-3.5 w-3.5 text-[#57606a] dark:text-[#8b949e] flex-shrink-0" />
                                <span className="text-[#57606a] dark:text-[#8b949e] text-xs font-medium">{field.label}</span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                                <p className="font-mono text-xs text-[#0d1117] dark:text-[#c9d1d9] text-right">
                                  {displayValue}
                                </p>
                                {field.copyable && (
                                  <button
                                    onClick={() => copyToClipboard(String(field.value), field.key)}
                                    className="text-[#57606a] dark:text-[#8b949e] hover:text-[#1773cf] transition-colors touch-target p-0.5 active:scale-95 flex-shrink-0 rounded"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1773cf] h-12 px-4 text-white text-base font-bold shadow-lg shadow-[#1773cf]/30 transition-transform active:scale-95 touch-target">
            <ExternalLink className="h-5 w-5" />
            <span>View on BSCScan</span>
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1773cf]/20 dark:bg-[#1773cf]/30 h-12 px-4 text-[#1773cf] text-base font-bold transition-transform active:scale-95 touch-target">
            <Copy className="h-5 w-5" />
            <span>Copy Details</span>
          </button>
        </div>

        {/* Toast Notification */}
        {copiedField && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            <p className="text-sm">Copied to clipboard!</p>
          </div>
        )}
      </main>
    </div>
  );
}
