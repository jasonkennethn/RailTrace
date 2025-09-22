import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SmartAddressDisplayProps {
  address: string;
  prefix?: string;
  maxLength?: number;
  className?: string;
  showCopyButton?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export function SmartAddressDisplay({ 
  address, 
  prefix = '0x',
  maxLength = 4,
  className = '',
  showCopyButton = true,
  variant = 'default'
}: SmartAddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Smart truncation: first 3-5 chars + ... + last 3-5 chars
  const getTruncatedAddress = () => {
    if (address.length <= maxLength * 2 + 3) return address;
    return `${address.slice(0, maxLength)}...${address.slice(-maxLength)}`;
  };

  const displayAddress = getTruncatedAddress();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="font-mono text-xs text-[#57606a] dark:text-[#8b949e]">
          {displayAddress}
        </span>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] transition-colors touch-target"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-[#57606a] dark:text-[#8b949e]" />
            )}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-2 bg-[#f0f2f5] dark:bg-[#21262d] rounded-lg ${className}`}>
        <span className="font-mono text-sm text-[#0d1117] dark:text-[#c9d1d9]">
          {displayAddress}
        </span>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-[#ffffff] dark:hover:bg-[#30363d] transition-colors touch-target"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
            )}
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#57606a] dark:text-[#8b949e] font-medium">
          Blockchain Address:
        </span>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] transition-colors touch-target"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
            )}
          </button>
        )}
      </div>
      <div className="bg-[#f0f2f5] dark:bg-[#21262d] rounded-lg p-3">
        <span className="font-mono text-sm text-[#0d1117] dark:text-[#c9d1d9] break-all">
          {displayAddress}
        </span>
      </div>
    </div>
  );
}
