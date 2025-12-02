import { useEffect, useRef, useState } from "react";

interface GaugeChartProps {
  value: number;
  maxValue: number;
  label: string;
  unit?: string;
  thresholds?: {
    low: number;  // Below this = red
    mid: number;  // Below this = yellow, above = green
  };
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  animated?: boolean;
}

const defaultThresholds = {
  low: 33,
  mid: 66,
};

export function GaugeChart({
  value,
  maxValue,
  label,
  unit = "",
  thresholds = defaultThresholds,
  size = "md",
  showPercentage = true,
  animated = true,
}: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Animate the value on mount/change
  useEffect(() => {
    if (!animated) {
      setAnimatedValue(percentage);
      return;
    }

    const duration = 1000;
    const startTime = Date.now();
    const startValue = animatedValue;
    const endValue = percentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setAnimatedValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percentage, animated]);

  // Get color based on value
  const getColor = (pct: number) => {
    if (pct < thresholds.low) return { main: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }; // Red
    if (pct < thresholds.mid) return { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }; // Yellow/Amber
    return { main: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" }; // Green
  };

  const color = getColor(animatedValue);

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 80, strokeWidth: 8, fontSize: "text-lg", labelSize: "text-xs" },
    md: { width: 180, height: 110, strokeWidth: 12, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { width: 240, height: 140, strokeWidth: 16, fontSize: "text-3xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const centerX = config.width / 2;
  const centerY = config.height - 10;

  // Calculate arc path (180 degree arc)
  const startAngle = Math.PI;
  const endAngle = 0;
  const valueAngle = startAngle - (animatedValue / 100) * Math.PI;

  // Arc path helper
  const describeArc = (startAng: number, endAng: number) => {
    const startX = centerX + radius * Math.cos(startAng);
    const startY = centerY + radius * Math.sin(startAng);
    const endX = centerX + radius * Math.cos(endAng);
    const endY = centerY + radius * Math.sin(endAng);
    const largeArcFlag = endAng - startAng <= Math.PI ? 0 : 1;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Background arc (full semicircle)
  const bgArcPath = describeArc(startAngle, endAngle);
  
  // Value arc
  const valueArcPath = describeArc(startAngle, valueAngle);

  // Needle position
  const needleLength = radius - 15;
  const needleX = centerX + needleLength * Math.cos(valueAngle);
  const needleY = centerY + needleLength * Math.sin(valueAngle);

  // Color zone arcs
  const lowEndAngle = startAngle - (thresholds.low / 100) * Math.PI;
  const midEndAngle = startAngle - (thresholds.mid / 100) * Math.PI;

  return (
    <div className="flex flex-col items-center">
      <svg width={config.width} height={config.height} className="overflow-visible">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`gauge-gradient-${label.replace(/\s/g, "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className="text-secondary"
        />

        {/* Color zones (subtle background) */}
        <path
          d={describeArc(startAngle, lowEndAngle)}
          fill="none"
          stroke="rgba(239, 68, 68, 0.2)"
          strokeWidth={config.strokeWidth - 2}
          strokeLinecap="round"
        />
        <path
          d={describeArc(lowEndAngle, midEndAngle)}
          fill="none"
          stroke="rgba(245, 158, 11, 0.2)"
          strokeWidth={config.strokeWidth - 2}
          strokeLinecap="round"
        />
        <path
          d={describeArc(midEndAngle, endAngle)}
          fill="none"
          stroke="rgba(34, 197, 94, 0.2)"
          strokeWidth={config.strokeWidth - 2}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={valueArcPath}
          fill="none"
          stroke={color.main}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            transition: animated ? "none" : "stroke 0.3s ease",
          }}
        />

        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={color.main}
          strokeWidth={3}
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r={6}
          fill={color.main}
          filter="url(#glow)"
        />

        {/* Min/Max labels */}
        <text
          x={centerX - radius - 5}
          y={centerY + 15}
          className="fill-muted-foreground text-[10px]"
          textAnchor="start"
        >
          0
        </text>
        <text
          x={centerX + radius + 5}
          y={centerY + 15}
          className="fill-muted-foreground text-[10px]"
          textAnchor="end"
        >
          {maxValue}{unit}
        </text>
      </svg>

      {/* Value display */}
      <div className="text-center -mt-2">
        <div className={`${config.fontSize} font-bold`} style={{ color: color.main }}>
          {showPercentage ? `${Math.round(animatedValue)}%` : `${value.toLocaleString()}${unit}`}
        </div>
        <div className={`${config.labelSize} text-muted-foreground mt-1`}>{label}</div>
      </div>
    </div>
  );
}

// KPI Card wrapper for consistent styling
interface KPIGaugeCardProps extends GaugeChartProps {
  description?: string;
  trend?: { value: number; isPositive: boolean };
}

export function KPIGaugeCard({
  description,
  trend,
  ...gaugeProps
}: KPIGaugeCardProps) {
  const color = gaugeProps.value / gaugeProps.maxValue >= 0.66 
    ? "text-green-500" 
    : gaugeProps.value / gaugeProps.maxValue >= 0.33 
    ? "text-amber-500" 
    : "text-red-500";

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
      <GaugeChart {...gaugeProps} />
      {description && (
        <p className="text-xs text-muted-foreground text-center mt-2">{description}</p>
      )}
      {trend && (
        <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
          <span>{trend.isPositive ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value)}% vs last period</span>
        </div>
      )}
    </div>
  );
}
