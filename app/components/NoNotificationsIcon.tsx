import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface NoNotificationsIconProps {
  size?: number;
  color?: string;
}

export default function NoNotificationsIcon({ size = 80, color = '#B0B0B0' }: NoNotificationsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Background circle */}
      <Circle cx="40" cy="40" r="38" fill={color} opacity="0.1" stroke={color} strokeWidth="2" />
      
      {/* Bell icon */}
      <Path
        d="M25 30C25 20 32 12 40 12C48 12 55 20 55 30C55 42 60 45 60 45V48H20V45C20 45 25 42 25 30Z"
        fill={color}
        opacity="0.8"
      />
      
      {/* Bell clapper */}
      <Circle cx="40" cy="52" r="2" fill={color} opacity="0.6" />
      
      {/* Bell bottom curve */}
      <Path
        d="M30 48C30 48 35 52 40 52C45 52 50 48 50 48"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* "No" indicator - diagonal line */}
      <Line
        x1="20"
        y1="20"
        x2="60"
        y2="60"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Small notification dot (crossed out) */}
      <Circle cx="55" cy="25" r="4" fill="#FF5252" opacity="0.8" />
      <Line
        x1="52"
        y1="22"
        x2="58"
        y2="28"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
} 