import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { styles } from './PieChart.styles';

export type PieChartData = {
  categoryId: string;
  categoryName: string;
  totalDurationSeconds: number;
  icon: string;
  color: string;
  percentage: number;
};

interface PieChartProps {
  data: PieChartData[];
  size?: number;
}

export const PieChart = ({ data, size = 200 }: PieChartProps) => {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>データがありません</Text>
      </View>
    );
  }

  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // パイチャートのパスを生成する関数
  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', centerX, centerY,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  // 極座標からデカルト座標に変換
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // ラベルの位置を計算（アイコン用）
  const getIconPosition = (angle: number) => {
    const iconRadius = radius * 0.5;
    const position = polarToCartesian(centerX, centerY, iconRadius, angle);
    return position;
  };

  let currentAngle = 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {data.map((item, index) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + (item.percentage * 360 / 100);
            const path = createPath(startAngle, endAngle);
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const iconPosition = getIconPosition(midAngle);
            
            currentAngle = endAngle;

            return (
              <G key={item.categoryId}>
                <Path
                  d={path}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                {/* カテゴリ表示 */}
                {item.percentage > 3 && (
                  <SvgText
                    x={iconPosition.x}
                    y={iconPosition.y + 4}
                    fontSize="16"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {item.icon}
                    {item.percentage >= 8 ? (item.categoryName.length > 6 ? item.categoryName.substring(0, 6) + '...' : item.categoryName) : ''}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
      
      {/* 凡例 */}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.categoryId} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.icon} {item.categoryName}
            </Text>
            <Text style={styles.legendPercentage}>
              {item.percentage.toFixed(1)}% ({Math.floor(item.totalDurationSeconds / 3600)}h{Math.floor((item.totalDurationSeconds % 3600) / 60)}m)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
