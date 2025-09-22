import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';

interface HighRiskCardProps {
  partId: string;
  address: string;
  probabilityScore: number;
  recommendedAction: string;
  timeToFailure: string;
  className?: string;
}

export function HighRiskCard({
  partId,
  address,
  probabilityScore,
  recommendedAction,
  timeToFailure,
  className = ''
}: HighRiskCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Smart truncation based on screen size
  const getTruncatedAddress = () => {
    if (expanded) return address;
    // More aggressive truncation for mobile
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className={`bg-white dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-3 w-full max-w-full overflow-hidden ${className}`}>
      {/* Header with Part ID and Risk Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {partId}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-red-700 dark:text-red-300">
            {(probabilityScore * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">Risk Score</p>
        </div>
      </div>

      {/* Smart Address Display - Mobile First */}
      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
        <div className="space-y-2">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Blockchain Address:</p>
          
          {/* Mobile-optimized address display */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-red-900/10 rounded border border-red-200 dark:border-red-700 p-2 address-container">
                <p className="font-mono text-xs text-red-700 dark:text-red-300 leading-relaxed address-mobile">
                  {expanded ? (
                    <span className="address-container">{address}</span>
                  ) : (
                    <span className="address-truncated">
                      {getTruncatedAddress()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors touch-target"
                title={copied ? 'Copied!' : 'Copy address'}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-red-500" />
                )}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors touch-target"
                title={expanded ? 'Collapse' : 'Expand address'}
              >
                {expanded ? (
                  <EyeOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Eye className="h-4 w-4 text-red-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Time to Failure */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3 w-3 text-red-500" />
        <p className="text-xs text-red-600 dark:text-red-400">
          Estimated failure: <span className="font-medium">{timeToFailure}</span>
        </p>
      </div>

      {/* Recommended Action */}
      <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-2">
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
          <span className="font-medium">Action Required:</span> {recommendedAction}
        </p>
      </div>
    </div>
  );
}
