import React, { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

interface RealTimeChartProps {
  collectionName: string;
  dataField: string;
  labelField?: string;
  maxDataPoints?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  showDrillDown?: boolean;
  onDataPointClick?: (data: ChartDataPoint) => void;
  className?: string;
}

export function RealTimeChart({
  collectionName,
  dataField,
  labelField = 'timestamp',
  maxDataPoints = 20,
  height = 200,
  color = '#1773cf',
  showTooltip = true,
  showDrillDown = true,
  onDataPointClick,
  className = ''
}: RealTimeChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Real-time data subscription
  useEffect(() => {
    const q = query(
      collection(db, collectionName),
      orderBy('timestamp', 'desc'),
      limit(maxDataPoints)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          timestamp: docData.timestamp?.toDate() || new Date(),
          value: docData[dataField] || 0,
          label: docData[labelField] || ''
        };
      }).reverse();

      setData(newData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, dataField, labelField, maxDataPoints]);

  // Chart rendering with smooth animations
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderChart = () => {
      const { width, height: canvasHeight } = canvas;
      ctx.clearRect(0, 0, width, canvasHeight);

      if (data.length === 0) {
        // Show loading state
        ctx.fillStyle = '#57606a';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading data...', width / 2, canvasHeight / 2);
        return;
      }

      // Calculate chart dimensions
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = canvasHeight - padding * 2;

      // Find min/max values for scaling
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const valueRange = maxValue - minValue || 1;

      // Draw grid lines
      ctx.strokeStyle = '#d0d7de';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw data line with smooth curve
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          // Smooth curve using quadratic bezier
          const prevX = padding + (chartWidth / (data.length - 1)) * (index - 1);
          const prevY = padding + chartHeight - ((data[index - 1].value - minValue) / valueRange) * chartHeight;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      });
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = color;
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Add hover effect
        if (hoveredPoint === point) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Draw tooltip
      if (hoveredPoint && showTooltip) {
        const pointIndex = data.indexOf(hoveredPoint);
        const x = padding + (chartWidth / (data.length - 1)) * pointIndex;
        const y = padding + chartHeight - ((hoveredPoint.value - minValue) / valueRange) * chartHeight;

        // Tooltip background
        const tooltipText = `${hoveredPoint.value}`;
        const textMetrics = ctx.measureText(tooltipText);
        const tooltipWidth = textMetrics.width + 16;
        const tooltipHeight = 24;

        ctx.fillStyle = '#0d1117';
        ctx.fillRect(x - tooltipWidth / 2, y - tooltipHeight - 8, tooltipWidth, tooltipHeight);

        // Tooltip text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tooltipText, x, y - 2);
      }
    };

    renderChart();
  }, [data, hoveredPoint, color, showTooltip]);

  // Handle mouse events for interactivity
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const pointIndex = Math.round(((x - padding) / chartWidth) * (data.length - 1));
    
    if (pointIndex >= 0 && pointIndex < data.length) {
      setHoveredPoint(data[pointIndex]);
    } else {
      setHoveredPoint(null);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredPoint && onDataPointClick && showDrillDown) {
      onDataPointClick(hoveredPoint);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ 
          maxWidth: '100%',
          height: `${height}px`
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#0d1117]/80">
          <div className="flex items-center gap-2 text-sm text-[#57606a] dark:text-[#8b949e]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1773cf] border-t-transparent"></div>
            Loading real-time data...
          </div>
        </div>
      )}

      {data.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-[#57606a] dark:text-[#8b949e]">
            No data available
          </div>
        </div>
      )}
    </div>
  );
}
