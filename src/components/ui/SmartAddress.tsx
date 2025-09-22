import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

interface SmartAddressProps {
  address: string;
  maxLength?: number;
  className?: string;
  showCopyButton?: boolean;
  showExpandButton?: boolean;
}

export function SmartAddress({ 
  address, 
  maxLength = 12, 
  className = '',
  showCopyButton = true,
  showExpandButton = true 
}: SmartAddressProps) {
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

  const displayAddress = expanded ? address : `${address.slice(0, maxLength)}...${address.slice(-maxLength)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm text-[#57606a] dark:text-[#8b949e] break-all">
        {displayAddress}
      </span>
      
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="p-1 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] transition-colors touch-target"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
          )}
        </button>
      )}
      
      {showExpandButton && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#21262d] transition-colors touch-target"
          title={expanded ? 'Collapse' : 'Expand address'}
        >
          {expanded ? (
            <EyeOff className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
          ) : (
            <Eye className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
          )}
        </button>
      )}
    </div>
  );
}
