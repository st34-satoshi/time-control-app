// DailyTimePieSolid.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';

type Segment = {
  label: string;     // 例: '就寝'
  start: string;     // "HH:MM" 例: "23:30"（翌日またぎOK）
  end: string;       // "HH:MM" 例: "08:00"
  color: string;     // 例: '#1f6aa5'
};

type Props = {
  size?: number;          // 円の直径（px）
  startAt?: string;       // てっぺん(12時方向)に来る時刻（既定 "00:00"）
  segments: Segment[];    // 扇形データ
  showBoundaryTime?: boolean; // 区切り時刻ラベルを表示
  showCenterDot?: boolean;    // 中央目印
};

const MIN_PER_DAY = 1440;

// ---------- helpers ----------
const hmToMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return ((h % 24) * 60 + (m % 60) + MIN_PER_DAY) % MIN_PER_DAY;
};

function normalize(s: Segment) {
  const a = hmToMin(s.start);
  const b = hmToMin(s.end);
  if (a === b) return [];       // 0分は描かない
  if (a < b)  return [{ ...s, startMin: a, endMin: b }];
  return [
    { ...s, startMin: a, endMin: MIN_PER_DAY },
    { ...s, startMin: 0, endMin: b },
  ];
}

// 扇形パス（中心→外周弧→中心 で閉じる）
const sectorPath = (
  cx: number, cy: number, r: number,
  startRad: number, endRad: number
) => {
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;
  const sx = cx + r * Math.cos(startRad);
  const sy = cy + r * Math.sin(startRad);
  const ex = cx + r * Math.cos(endRad);
  const ey = cy + r * Math.sin(endRad);
  return [
    `M ${cx} ${cy}`,
    `L ${sx} ${sy}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`,
    'Z',
  ].join(' ');
};

export const DailyTimePie: React.FC<Props> = ({
  size = 280,
  startAt = '00:00',
  segments,
  showBoundaryTime = true,
  showCenterDot = false,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2;

  const offsetMin = hmToMin(startAt);
  const toAngle = (min: number) => {
    // 右向き 0:00 を基準 → 起点オフセット → 12時上向きに -90°
    const frac = (((min - offsetMin) % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY / MIN_PER_DAY;
    return frac * Math.PI * 2 - Math.PI / 2;
  };

  const expanded = useMemo(
    () => segments.flatMap(normalize),
    [segments]
  );

  const boundaryMins = useMemo(() => {
    const set = new Set<number>();
    segments.forEach(s => {
      set.add(hmToMin(s.start));
      set.add(hmToMin(s.end));
    });
    return Array.from(set).sort((a,b) => a - b);
  }, [segments]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* 薄い外枠（任意） */}
        <Circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#e5e5e5" strokeWidth={1} />

        {/* 扇形の塗り */}
        <G>
          {expanded.map((s: any, i) => {
            const startRad = toAngle(s.startMin);
            const endRad   = toAngle(s.endMin);
            const d = sectorPath(cx, cy, r, startRad, endRad);

            // ラベル座標（中点をやや内側に）
            const mid = (startRad + endRad) / 2;
            const labelR = r * 0.55;
            const lx = cx + labelR * Math.cos(mid);
            const ly = cy + labelR * Math.sin(mid);

            const minutes = s.endMin - s.startMin;
            const showLabel = minutes >= 45; // 45分未満は窮屈なので非表示

            return (
              <G key={`${s.label}-${i}`}>
                <Path d={d} fill={s.color} />
                {showLabel && (
                  <SvgText
                    x={lx}
                    y={ly}
                    fontSize={13}
                    fontWeight="600"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#fff"
                  >
                    {s.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>

        {/* 区切り線 & 時刻ラベル */}
        <G>
          {boundaryMins.map((m, i) => {
            const a = toAngle(m);
            const x1 = cx + r * Math.cos(a);
            const y1 = cy + r * Math.sin(a);
            const x0 = cx;
            const y0 = cy;

            // 時刻ラベルは円の外側に少し出す
            const rt = r + 16;
            const tx = cx + rt * Math.cos(a);
            const ty = cy + rt * Math.sin(a);

            return (
              <G key={`bd-${i}`}>
                <Path d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke="#ffffff" strokeOpacity={0.9} strokeWidth={2} />
                {showBoundaryTime && (
                  <SvgText
                    x={tx}
                    y={ty}
                    fontSize={11}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="#666"
                  >
                    {`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>

        {/* 中心ドット（任意） */}
        {showCenterDot && <Circle cx={cx} cy={cy} r={2} fill="#777" />}
      </Svg>
    </View>
  );
};
