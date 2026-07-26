import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

// Icon shapes ported 1:1 from the inline SVGs in Trip Expense Tracker.dc.html.

export function GearIcon({ color, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={2.4} fill="none" stroke={color} strokeWidth={1.3} />
      <Path
        d="M7 0.8v1.6M7 11.6v1.6M13.2 7h-1.6M2.4 7H0.8M11.2 2.8l-1.1 1.1M3.9 10.1l-1.1 1.1M11.2 11.2l-1.1-1.1M3.9 3.9L2.8 2.8"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MoonIcon({ color, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M12.5 8.5A5.5 5.5 0 015.5 1.5 5.5 5.5 0 1012.5 8.5z" fill={color} />
    </Svg>
  );
}

export function SunIcon({ color, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={3} fill={color} />
      <Line x1={7} y1={0.5} x2={7} y2={2} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={7} y1={12} x2={7} y2={13.5} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={0.5} y1={7} x2={2} y2={7} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={12} y1={7} x2={13.5} y2={7} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={2.05} y1={2.05} x2={3.1} y2={3.1} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={10.9} y1={10.9} x2={11.95} y2={11.95} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={2.05} y1={11.95} x2={3.1} y2={10.9} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={10.9} y1={3.1} x2={11.95} y2={2.05} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function BackChevronIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Svg width={size * (8 / 12)} height={size} viewBox="0 0 8 12">
      <Path d="M7 1L2 6l5 5" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M10 2v16M2 10h16" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function CloseIcon({ color, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M1 1l12 12M13 1L1 13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ShareIcon({ color, size = 12 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path
        d="M9 3.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM3 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4.3 6.6l3.4-2.2M4.3 6.4l3.4 2.2"
        stroke={color}
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TabDashboardIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x={1} y={1} width={7} height={7} fill={color} />
      <Rect x={10} y={1} width={7} height={7} fill={color} opacity={0.4} />
      <Rect x={1} y={10} width={7} height={7} fill={color} opacity={0.4} />
      <Rect x={10} y={10} width={7} height={7} fill={color} />
    </Svg>
  );
}

export function TabExpensesIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x={1} y={2} width={16} height={2.4} fill={color} />
      <Rect x={1} y={7.8} width={16} height={2.4} fill={color} />
      <Rect x={1} y={13.6} width={10} height={2.4} fill={color} />
    </Svg>
  );
}

export function TabSplitIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M2 6h11M13 6l-3-3M13 6l-3 3" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 12H5M5 12l3-3M5 12l3 3" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TabReportsIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x={1} y={9} width={3.6} height={8} fill={color} />
      <Rect x={7.2} y={4} width={3.6} height={13} fill={color} />
      <Rect x={13.4} y={1} width={3.6} height={16} fill={color} />
    </Svg>
  );
}
