import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const newMetric: PerformanceMetrics = {
        renderTime,
        timestamp: Date.now()
      };
      
      setMetrics(prev => {
        const updated = [...prev, newMetric].slice(-10); // Keep last 10 metrics
        return updated;
      });
    };
  });

  const averageRenderTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length 
    : 0;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 100,
      right: 10,
      backgroundColor: theme.card,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      zIndex: 9999,
    },
    text: {
      fontSize: 10,
      color: theme.text,
      fontFamily: 'monospace',
    },
    performance: {
      color: averageRenderTime < 16 ? theme.success : averageRenderTime < 33 ? theme.warning : theme.error,
    }
  });

  if (!isVisible) {
    return (
      <View style={styles.container}>
        <Text style={styles.text} onPress={() => setIsVisible(true)}>
          Show Perf
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text} onPress={() => setIsVisible(false)}>
        Hide Perf
      </Text>
      <Text style={[styles.text, styles.performance]}>
        Avg: {averageRenderTime.toFixed(1)}ms
      </Text>
      <Text style={styles.text}>
        FPS: {(1000 / Math.max(averageRenderTime, 1)).toFixed(0)}
      </Text>
      <Text style={styles.text}>
        Samples: {metrics.length}
      </Text>
    </View>
  );
};

export default PerformanceMonitor; 