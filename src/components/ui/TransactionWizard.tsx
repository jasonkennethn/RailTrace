import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ExternalLink, Receipt, Tag, Calendar, Warehouse, Shield, User, MapPin } from 'lucide-react';

interface TransactionData {
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
  additionalData?: Record<string, any>;
}

interface TransactionWizardProps {
  transaction: TransactionData;
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

export function TransactionWizard({ transaction, onBack, className = '' }: TransactionWizardProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['basic']));
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const truncateHash = (hash: string, startChars: number = 4, endChars: number = 4) => {
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: ReceiptLong,
      fields: [
        {
          key: 'partId',
          label: 'Part ID',
          value: transaction.partId,
          icon: Tag,
          copyable: true
        },
        {
          key: 'dateTime',
          label: 'Date/Time',
          value: transaction.dateTime,
          icon: Calendar
        },
        {
          key: 'status',
          label: 'Status',
          value: transaction.status,
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
          value: transaction.transactionHash,
          icon: Receipt,
          copyable: true
        },
        {
          key: 'blockNumber',
          label: 'Block Number',
          value: transaction.blockNumber,
          icon: Tag
        },
        {
          key: 'eventType',
          label: 'Event Type',
          value: transaction.eventType,
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
          value: transaction.partHash,
          icon: Tag,
          copyable: true
        },
        {
          key: 'condition',
          label: 'Condition',
          value: transaction.condition,
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
          value: transaction.depotId,
          icon: Warehouse
        },
        {
          key: 'officerId',
          label: 'Officer ID',
          value: transaction.officerId,
          icon: User
        },
        {
          key: 'location',
          label: 'Location',
          value: transaction.location,
          icon: MapPin
        }
      ]
    }
  ];

  const statusConfig = getStatusConfig(transaction.status);

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
          Transaction Details
        </h1>
      </header>

      <main className="p-4">
        {/* Main Transaction Card */}
        <div className="flex flex-col gap-6 rounded-xl bg-[#f6f7f8] dark:bg-[#111a21]/50 glass-effect p-4 shadow-lg mb-6">
          {/* Part Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1773cf]/20 text-[#1773cf]">
              <span className="material-symbols-outlined">qr_code_2</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Part</p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{transaction.partId}</h2>
            </div>
          </div>

          {/* Status and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Date/Time</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 break-words">{transaction.dateTime}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <div className={`inline-flex items-center gap-2 rounded-full ${statusConfig.bgColor} px-3 py-1 text-sm font-semibold ${statusConfig.textColor} w-fit`}>
                <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`}></span>
                {statusConfig.label}
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
                className="rounded-xl bg-[#f6f7f8] dark:bg-[#111a21]/50 glass-effect shadow-lg overflow-hidden"
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full p-4 flex items-center justify-between touch-target active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1773cf]/20 text-[#1773cf]">
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Step Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-4 space-y-4">
                    {step.fields.map((field, index) => {
                      const FieldIcon = field.icon;
                      const displayValue = field.key === 'transactionHash' || field.key === 'partHash' 
                        ? truncateHash(String(field.value)) 
                        : field.value;

                      return (
                        <div
                          key={field.key}
                          className={`flex items-start justify-between gap-4 ${
                            index > 0 ? 'border-t border-slate-200/50 dark:border-slate-700/50 pt-4' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FieldIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <p className="text-slate-600 dark:text-slate-300 text-sm">{field.label}</p>
                          </div>
                          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                            <p className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all text-right">
                              {displayValue}
                            </p>
                            {field.copyable && (
                              <button
                                onClick={() => copyToClipboard(String(field.value), field.key)}
                                className="text-slate-500 dark:text-slate-400 hover:text-[#1773cf] transition-colors touch-target p-1 active:scale-95"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
