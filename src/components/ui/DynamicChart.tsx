import React, { useMemo } from 'react';

interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  value?: number;
}

interface DynamicChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'area' | 'radar' | 'bar';
  width?: number;
  height?: number;
  color?: string;
  gradientId?: string;
  showPoints?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function DynamicChart({
  data,
  type,
  width = 400,
  height = 200,
  color = '#1773cf',
  gradientId = 'chartGradient',
  showPoints = true,
  showGrid = true,
  className = ''
}: DynamicChartProps) {
  const chartElements = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxX = Math.max(...data.map(d => d.x));
    const maxY = Math.max(...data.map(d => d.y));
    const minX = Math.min(...data.map(d => d.x));
    const minY = Math.min(...data.map(d => d.y));

    const scaleX = (value: number) => ((value - minX) / (maxX - minX)) * (width - 40) + 20;
    const scaleY = (value: number) => height - 20 - ((value - minY) / (maxY - minY)) * (height - 40);

    switch (type) {
      case 'line':
        const linePath = data.map((point, index) => {
          const x = scaleX(point.x);
          const y = scaleY(point.y);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        const areaPath = `${linePath} L ${scaleX(data[data.length - 1].x)} ${height - 20} L ${scaleX(data[0].x)} ${height - 20} Z`;

        return (
          <g>
            {showGrid && (
              <g className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" strokeDasharray="2,2">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1="20"
                    y1={20 + ratio * (height - 40)}
                    x2={width - 20}
                    y2={20 + ratio * (height - 40)}
                  />
                ))}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1={20 + ratio * (width - 40)}
                    y1="20"
                    x2={20 + ratio * (width - 40)}
                    y2={height - 20}
                  />
                ))}
              </g>
            )}
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
            />
            <path
              d={linePath}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showPoints && data.map((point, index) => (
              <circle
                key={index}
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r="3"
                fill={color}
                className="hover:r-4 transition-all cursor-pointer"
              >
                <title>{point.label || `Value: ${point.value || point.y}`}</title>
              </circle>
            ))}
          </g>
        );

      case 'radar':
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2 - 20;
        
        const radarPath = data.map((point, index) => {
          const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
          const radius = (point.y / maxY) * maxRadius;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';

        return (
          <g>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {showGrid && (
              <g className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" strokeDasharray="2,2">
                {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
                  <circle
                    key={index}
                    cx={centerX}
                    cy={centerY}
                    r={maxRadius * ratio}
                    fill="none"
                  />
                ))}
                {data.map((_, index) => {
                  const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
                  const x = centerX + maxRadius * Math.cos(angle);
                  const y = centerY + maxRadius * Math.sin(angle);
                  return (
                    <line
                      key={index}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                    />
                  );
                })}
              </g>
            )}
            <path
              d={radarPath}
              fill={`url(#${gradientId})`}
              stroke={color}
              strokeWidth="2"
            />
            {showPoints && data.map((point, index) => {
              const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
              const radius = (point.y / maxY) * maxRadius;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="hover:r-4 transition-all cursor-pointer"
                >
                  <title>{point.label || `Value: ${point.value || point.y}`}</title>
                </circle>
              );
            })}
          </g>
        );

      case 'bar':
        const barWidth = (width - 40) / data.length - 4;
        
        return (
          <g>
            {showGrid && (
              <g className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" strokeDasharray="2,2">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1="20"
                    y1={20 + ratio * (height - 40)}
                    x2={width - 20}
                    y2={20 + ratio * (height - 40)}
                  />
                ))}
              </g>
            )}
            {data.map((point, index) => {
              const x = 20 + index * (barWidth + 4);
              const barHeight = (point.y / maxY) * (height - 40);
              const y = height - 20 - barHeight;
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <title>{point.label || `Value: ${point.value || point.y}`}</title>
                  </rect>
                </g>
              );
            })}
          </g>
        );

      default:
        return null;
    }
  }, [data, type, width, height, color, gradientId, showPoints, showGrid]);

  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ minHeight: `${height}px` }}
      >
        {chartElements}
      </svg>
    </div>
  );
}
