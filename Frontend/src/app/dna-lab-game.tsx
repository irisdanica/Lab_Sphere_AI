import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  PanResponderGestureState,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LabCompletionOverlay, FeedbackToast } from '@/components/virtual-lab/engine';
import { saveProgress } from '@/services/api';
import Svg, {
  Rect,
  Circle,
  Ellipse,
  Path,
  Line,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

/* ------------------------------------------------------------------ */
/*  Reference canvas                                                   */
/* ------------------------------------------------------------------ */

const REF_W = 739;
const REF_H = 501;

const pos = (x: number, y: number, w: number, h: number) => ({
  position: 'absolute' as const,
  left: x,
  top: y,
  width: w,
  height: h,
});

/* ------------------------------------------------------------------ */
/*  Palette (sampled from the screenshot)                              */
/* ------------------------------------------------------------------ */

const COLORS = {
  bgTopEdge: '#0a3a44',
  bgCenter: '#2c8b8f',
  bgCenterLight: '#3fa3a0',
  pillarGlow: '#3fe9cf',
  pillarCore: '#0b3238',
  benchTop1: '#586e7d',
  benchTop2: '#2f414d',
  benchFront: '#12191f',
  benchFrontTrim: '#3c4b57',
  benchShadowEdge: '#060a0d',
  badgeBlue: '#2f74b8',
  badgeBlueDark: '#1c4d80',
  navyIcon: '#173a55',
  timerBlue1: '#5a95dd',
  timerBlue2: '#1c4a8a',
  timerFace: '#eef3f7',
  timerBezel: '#132a4a',
  bow: '#f2a0c0',
  startPink: '#f6aba1',
  startPinkDark: '#df8378',
  startText: '#7a2a20',
  dialoguePink: '#f6cac8',
  navCircle1: '#3d84c4',
  navCircle2: '#1c4d80',
  speakerBg: '#bcd9ea',
  chromeLight: '#d4dade',
  chromeDark: '#7d878d',
  chromeOutline: '#4c565c',
  glassFill: 'rgba(255,255,255,0.13)',
  glassEdge: 'rgba(255,255,255,0.75)',
  glassShine: 'rgba(255,255,255,0.35)',
  water: '#8ed0e8',
  alcohol: '#3f7fd6',
  washing: '#3fae63',
  saltBowl1: '#efece3',
  saltBowl2: '#d3cdb9',
  strawberryRed1: '#ea3a54',
  strawberryRed2: '#b81d38',
  strawberryLeaf: '#3c8c4c',
  strawberrySeed: '#f4d35e',
  cloth1: '#f4f1e7',
  cloth2: '#ddd8c9',
  wood1: '#c79a63',
  wood2: '#8f6339',
} as const;

/* ------------------------------------------------------------------ */
/*  Background & bench                                                */
/* ------------------------------------------------------------------ */

const LabBackground: React.FC = () => (
  <Svg width={REF_W} height={REF_H} style={StyleSheet.absoluteFill}>
    <Defs>
      <RadialGradient id="sky" cx="50%" cy="20%" r="75%">
        <Stop offset="0" stopColor={COLORS.bgCenterLight} />
        <Stop offset="0.55" stopColor={COLORS.bgCenter} />
        <Stop offset="1" stopColor={COLORS.bgTopEdge} />
      </RadialGradient>
      <LinearGradient id="pillar" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={COLORS.pillarGlow} stopOpacity={0.95} />
        <Stop offset="0.45" stopColor={COLORS.pillarCore} stopOpacity={0.85} />
        <Stop offset="0.55" stopColor={COLORS.pillarCore} stopOpacity={0.85} />
        <Stop offset="1" stopColor={COLORS.pillarGlow} stopOpacity={0.95} />
      </LinearGradient>
    </Defs>
    <Rect x={0} y={0} width={REF_W} height={REF_H} fill="url(#sky)" />
    {[-10, 165, 545, 715].map((px, i) => (
      <Rect key={i} x={px} y={0} width={26} height={REF_H * 0.66} fill="url(#pillar)" opacity={0.6} />
    ))}
    <Path
      d={`M0 60 Q ${REF_W / 2} -30 ${REF_W} 60`}
      stroke="#ffffff"
      strokeOpacity={0.06}
      strokeWidth={40}
      fill="none"
    />
  </Svg>
);

const Bench: React.FC = () => {
  const benchTop = REF_H * 0.42;
  return (
    <Svg width={REF_W} height={REF_H - benchTop} style={pos(0, benchTop, REF_W, REF_H - benchTop)}>
      <Defs>
        <LinearGradient id="benchTopGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLORS.benchTop1} />
          <Stop offset="1" stopColor={COLORS.benchTop2} />
        </LinearGradient>
      </Defs>
      <Path d={`M0,32 L${REF_W},32 L${REF_W - 22},0 L22,0 Z`} fill="url(#benchTopGrad)" />
      <Rect x={0} y={32} width={REF_W} height={16} fill={COLORS.benchFrontTrim} />
      <Rect x={0} y={48} width={REF_W} height={150} fill={COLORS.benchFront} />
      <Rect x={0} y={48} width={REF_W} height={3} fill="rgba(255,255,255,0.08)" />
      <Rect x={0} y={REF_H - benchTop - 4} width={REF_W} height={4} fill={COLORS.benchShadowEdge} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const CoinIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Circle cx={10} cy={10} r={9} fill="#ffd34d" stroke="#c98a12" strokeWidth={1.4} />
    <SvgText x={10} y={14} fontSize={10} fontWeight="700" fill="#8a5a05" textAnchor="middle">
      $
    </SvgText>
  </Svg>
);

const PencilIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Path d="M3 15 l1-4 8-8 3 3-8 8z" fill="#fff" />
    <Path d="M11 3 l3 3 2-2-3-3z" fill="#fff" />
  </Svg>
);

const NotesIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Rect x={2} y={1} width={13} height={15} rx={2} fill="#fff" />
    <Line x1={5} y1={6} x2={12} y2={6} stroke={COLORS.navyIcon} strokeWidth={1.3} />
    <Line x1={5} y1={9} x2={12} y2={9} stroke={COLORS.navyIcon} strokeWidth={1.3} />
    <Line x1={5} y1={12} x2={10} y2={12} stroke={COLORS.navyIcon} strokeWidth={1.3} />
  </Svg>
);

const SpeakerIcon: React.FC<{ muted: boolean }> = ({ muted }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path d="M2 7 h3.5 l5.5-4.5 v15 l-5.5-4.5 h-3.5z" fill={COLORS.navCircle2} />
    {!muted ? (
      <Path d="M13 6 q3 4 0 8" stroke={COLORS.navCircle2} strokeWidth={2} fill="none" strokeLinecap="round" />
    ) : (
      <Path d="M13 6 l5 8 M18 6 l-5 8" stroke="#c23b3b" strokeWidth={2} strokeLinecap="round" />
    )}
  </Svg>
);

const ArrowIcon: React.FC<{ direction: 'left' | 'right' }> = ({ direction }) => (
  <Svg width={18} height={22} viewBox="0 0 18 22">
    <Path
      d={direction === 'left' ? 'M13 2 L4 11 L13 20' : 'M5 2 L14 11 L5 20'}
      stroke="#fff"
      strokeWidth={3.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DockIcon: React.FC<{ kind: 'book' | 'clipboard' | 'gallery' }> = ({ kind }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    {kind === 'book' && (
      <>
        <Rect x={2} y={3} width={20} height={18} rx={3} fill="#3fae63" stroke="#2c7a45" strokeWidth={1.5} />
        <Line x1={12} y1={3} x2={12} y2={21} stroke="#2c7a45" strokeWidth={1.5} />
      </>
    )}
    {kind === 'clipboard' && (
      <>
        <Rect x={4} y={3} width={16} height={19} rx={2} fill="#f2f2f2" stroke="#c7c7c7" strokeWidth={1.2} />
        <Rect x={9} y={1} width={6} height={4} rx={1} fill="#9aa5ab" />
        <Line x1={7} y1={11} x2={17} y2={11} stroke="#8a8a8a" strokeWidth={1.2} />
        <Line x1={7} y1={15} x2={17} y2={15} stroke="#8a8a8a" strokeWidth={1.2} />
      </>
    )}
    {kind === 'gallery' && (
      <>
        <Rect x={2} y={4} width={20} height={16} rx={3} fill="#4a9fd6" stroke="#2c6ea3" strokeWidth={1.2} />
        <Circle cx={8} cy={10} r={2.2} fill="#fff" />
        <Path d="M4 18 l5.5-5.5 4.5 4.5 3-3 4.5 4.5v0.5h-17.5z" fill="#dff0ff" />
      </>
    )}
  </Svg>
);

const AvatarIcon: React.FC = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40">
    <Circle cx={20} cy={20} r={18} fill="#fff" stroke="#e0334f" strokeWidth={3} />
    <Circle cx={20} cy={16} r={6.5} fill="#2c5f8a" />
    <Path d="M8 33 q12-11 24 0" stroke="#2c5f8a" strokeWidth={3} fill="none" strokeLinecap="round" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Score badge (flag-notched pill, like the screenshot)               */
/* ------------------------------------------------------------------ */

const ScoreBadgeShape: React.FC = () => (
  <Svg width={92} height={40} viewBox="0 0 92 40" style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="badge" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={COLORS.badgeBlue} />
        <Stop offset="1" stopColor={COLORS.badgeBlueDark} />
      </LinearGradient>
    </Defs>
    <Path
      d="M2 20 L14 4 h64 a12 12 0 0 1 12 12 v8 a12 12 0 0 1 -12 12 h-64 z"
      fill="url(#badge)"
      stroke="#ffffff"
      strokeWidth={2.5}
    />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Stopwatch ("Vlaby")                                                */
/* ------------------------------------------------------------------ */

const TimerHousing: React.FC<{ seconds: number }> = ({ seconds }) => {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return (
    <Svg width={100} height={96} viewBox="0 0 100 96">
      <Defs>
        <RadialGradient id="timerBall" cx="38%" cy="30%" r="75%">
          <Stop offset="0" stopColor={COLORS.timerBlue1} />
          <Stop offset="1" stopColor={COLORS.timerBlue2} />
        </RadialGradient>
      </Defs>
      <Rect x={30} y={40} width={8} height={20} rx={2} fill={COLORS.timerBezel} />
      <Rect x={62} y={40} width={8} height={20} rx={2} fill={COLORS.timerBezel} />
      <Rect x={22} y={58} width={56} height={8} rx={4} fill={COLORS.timerBezel} />
      <Rect x={44} y={0} width={12} height={10} rx={2} fill={COLORS.timerBezel} />
      <Circle cx={50} cy={38} r={36} fill="url(#timerBall)" stroke={COLORS.timerBezel} strokeWidth={3} />
      <Circle cx={50} cy={38} r={27} fill={COLORS.timerFace} stroke={COLORS.timerBezel} strokeWidth={2} />
      <SvgText x={50} y={30} fontSize={7} fontWeight="700" fontStyle="italic" fill="#33507a" textAnchor="middle">
        Vlaby
      </SvgText>
      <Rect x={30} y={33} width={40} height={16} rx={2} fill="#dfe6ec" />
      <SvgText x={50} y={45} fontSize={11} fontWeight="700" fill="#20242b" textAnchor="middle">
        {mm}:{ss}
      </SvgText>
      <Circle cx={22} cy={16} r={9} fill={COLORS.bow} opacity={0.95} />
      <Circle cx={16} cy={10} r={5} fill={COLORS.bow} opacity={0.95} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Lab equipment                                                      */
/* ------------------------------------------------------------------ */

const Tap: React.FC<{ pouring: boolean }> = ({ pouring }) => (
  <Svg width={90} height={92} viewBox="0 0 90 92">
    <Defs>
      <LinearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={COLORS.chromeDark} />
        <Stop offset="0.5" stopColor={COLORS.chromeLight} />
        <Stop offset="1" stopColor={COLORS.chromeDark} />
      </LinearGradient>
    </Defs>
    <Rect x={40} y={0} width={12} height={34} fill="url(#chrome)" stroke={COLORS.chromeOutline} strokeWidth={1} />
    <Path
      d="M40 34 q-32 0 -32 30 v6 l10 2 v-8 q0 -22 22 -22 h10 v10 h10 v-18 z"
      fill="url(#chrome)"
      stroke={COLORS.chromeOutline}
      strokeWidth={1.2}
    />
    <Circle cx={20} cy={62} r={9} fill={COLORS.chromeLight} stroke={COLORS.chromeOutline} strokeWidth={1.5} />
    <Line x1={20} y1={56} x2={20} y2={68} stroke={COLORS.chromeOutline} strokeWidth={1.2} />
    <Line x1={14} y1={62} x2={26} y2={62} stroke={COLORS.chromeOutline} strokeWidth={1.2} />
    {pouring && <Rect x={5} y={70} width={4} height={20} fill={COLORS.water} opacity={0.85} />}
  </Svg>
);

const StandDish: React.FC = () => (
  <Svg width={100} height={110} viewBox="0 0 100 110">
    <Rect x={44} y={0} width={5} height={44} fill={COLORS.chromeOutline} />
    <Path d="M44 30 h30 v6 h-30z" fill={COLORS.chromeOutline} />
    <Circle cx={30} cy={70} r={22} fill="#101418" stroke="#000" strokeWidth={1} />
    <Circle cx={30} cy={70} r={17} fill="#1a2126" />
    <Circle cx={16} cy={82} r={11} fill="#e0334f" stroke="#8a1224" strokeWidth={1} />
    <SvgText x={16} y={86} fontSize={11} fontWeight="700" fill="#fff" textAnchor="middle">
      1
    </SvgText>
    <Ellipse cx={72} cy={96} rx={26} ry={9} fill="rgba(220,235,245,0.5)" stroke="rgba(255,255,255,0.6)" strokeWidth={1.3} />
    <Ellipse cx={64} cy={92} rx={9} ry={3} fill="rgba(255,255,255,0.6)" />
  </Svg>
);

const Beaker: React.FC<{ fillPct: number }> = ({ fillPct }) => {
  const liquidH = 96 * (fillPct / 100);
  const marks = [
    { y: 22, label: '300' },
    { y: 38, label: '250' },
    { y: 54, label: '200' },
    { y: 70, label: '150' },
    { y: 86, label: '100' },
    { y: 100, label: '50' },
  ];
  return (
    <Svg width={86} height={128} viewBox="0 0 86 128">
      <Path
        d="M16 6 h54 l-6 96 a9 9 0 0 1 -9 8 h-24 a9 9 0 0 1 -9 -8 z"
        fill={COLORS.glassFill}
        stroke={COLORS.glassEdge}
        strokeWidth={2}
      />
      {fillPct > 0 && (
        <Path
          d={`M21 ${112 - liquidH} h44 l-3.5 ${liquidH - 8} a8 8 0 0 1 -8 7 h-21 a8 8 0 0 1 -8 -7 z`}
          fill={COLORS.water}
          opacity={0.78}
        />
      )}
      <Path d="M22 14 l3 88" stroke={COLORS.glassShine} strokeWidth={3} strokeLinecap="round" />
      {marks.map((m) => (
        <G key={m.label}>
          <Line x1={60} y1={m.y} x2={67} y2={m.y} stroke="#fff" strokeWidth={1} opacity={0.55} />
          <SvgText x={69} y={m.y + 3} fontSize={6.5} fill="#eaf6ff">
            {m.label}
          </SvgText>
        </G>
      ))}
      <Rect x={12} y={0} width={62} height={7} rx={2} fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
};

interface MixState {
  strawberry: boolean;
  water: boolean;
  salt: boolean;
  washingLiquid: boolean;
  stirred: boolean;
  filtered: boolean;
}

const MixCylinder: React.FC<{ mix: MixState }> = ({ mix }) => {
  const layers: { color: string; h: number }[] = [];
  if (mix.strawberry) layers.push({ color: '#c23b52', h: 16 });
  if (mix.water) layers.push({ color: COLORS.water, h: 14 });
  if (mix.salt) layers.push({ color: '#fbfaf6', h: 5 });
  if (mix.washingLiquid) layers.push({ color: COLORS.washing, h: 14 });
  let cursor = 0;
  const totalH = layers.reduce((a, l) => a + l.h, 0);
  return (
    <Svg width={78} height={100} viewBox="0 0 78 100">
      <Path
        d="M8 4 h62 v72 a13 13 0 0 1 -13 13 h-36 a13 13 0 0 1 -13 -13 z"
        fill={COLORS.glassFill}
        stroke={COLORS.glassEdge}
        strokeWidth={2}
      />
      {!mix.filtered &&
        layers.map((l, i) => {
          const y = 82 - cursor - l.h;
          cursor += l.h;
          return <Rect key={i} x={10} y={y} width={58} height={l.h} fill={l.color} opacity={mix.stirred ? 0.92 : 0.78} />;
        })}
      {mix.stirred && !mix.filtered && (
        <Path
          d={`M14 ${82 - totalH + 6} q10 -8 20 0 q10 8 20 0`}
          stroke="#ffffff"
          strokeWidth={1.4}
          fill="none"
          opacity={0.55}
        />
      )}
      <Path d="M14 10 l2 66" stroke={COLORS.glassShine} strokeWidth={2.4} strokeLinecap="round" />
      <Rect x={4} y={0} width={70} height={6} rx={2} fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
};

const TestTube: React.FC<{ filled: boolean; dnaVisible: boolean }> = ({ filled, dnaVisible }) => (
  <Svg width={42} height={100} viewBox="0 0 42 100">
    <Path d="M11 4 h20 v68 a10 10 0 0 1 -20 0 z" fill={COLORS.glassFill} stroke={COLORS.glassEdge} strokeWidth={1.8} />
    {filled && <Path d="M12 48 h18 v24 a9 9 0 0 1 -18 0 z" fill="#cfe3a5" opacity={0.82} />}
    {dnaVisible && (
      <G>
        <Path d="M16 44 q3 -10 5.5 0 q2.5 10 5.5 0" stroke="#ffffff" strokeWidth={1.6} fill="none" opacity={0.95} />
        <Path d="M18 50 q2.5 -7 4 0 q1.5 7 4 0" stroke="#ffffff" strokeWidth={1.3} fill="none" opacity={0.8} />
      </G>
    )}
    <Rect x={8} y={0} width={26} height={6} rx={2} fill="rgba(255,255,255,0.4)" />
  </Svg>
);

const PetriStrawberry: React.FC<{ mashed: boolean }> = ({ mashed }) => (
  <Svg width={90} height={56} viewBox="0 0 90 56">
    <Ellipse cx={45} cy={40} rx={40} ry={13} fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} />
    <Ellipse cx={45} cy={37} rx={34} ry={9} fill="rgba(255,255,255,0.08)" />
    {!mashed ? (
      <G>
        <Path
          d="M45 12 C31 12 20 24 30 35 C36 42 54 42 60 35 C70 24 59 12 45 12 Z"
          fill={COLORS.strawberryRed1}
          stroke={COLORS.strawberryRed2}
          strokeWidth={0.6}
        />
        <Path d="M45 9 l-5 -7 l5 3.5 l5 -3.5z" fill={COLORS.strawberryLeaf} />
        {[...Array(6)].map((_, i) => (
          <Circle key={i} cx={36 + i * 3.2} cy={22 + (i % 2) * 8} r={1.1} fill={COLORS.strawberrySeed} />
        ))}
      </G>
    ) : (
      <Ellipse cx={45} cy={33} rx={26} ry={9} fill="#d1445e" opacity={0.88} />
    )}
  </Svg>
);

const Bottle: React.FC<{ label: string; liquidColor: string; empty: boolean }> = ({ label, liquidColor, empty }) => (
  <Svg width={62} height={100} viewBox="0 0 62 100">
    <Rect x={20} y={0} width={22} height={12} rx={3} fill="#1c2733" />
    <Path
      d="M18 12 h26 v9 l6 10 v52 a5 5 0 0 1 -5 5 h-28 a5 5 0 0 1 -5 -5 v-52 l6 -10 z"
      fill="rgba(255,255,255,0.18)"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth={1.3}
    />
    {!empty && <Path d="M13 52 h36 v28 a5 5 0 0 1 -5 5 h-26 a5 5 0 0 1 -5 -5 z" fill={liquidColor} opacity={0.9} />}
    <Rect x={13} y={36} width={36} height={19} rx={3} fill="#fff" opacity={0.94} />
    <SvgText x={31} y={48} fontSize={8} fontWeight="700" fill="#1c3d6b" textAnchor="middle">
      {label}
    </SvgText>
  </Svg>
);

const SaltBowl: React.FC = () => (
  <Svg width={76} height={48} viewBox="0 0 76 48">
    <Defs>
      <LinearGradient id="saltBowlGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={COLORS.saltBowl1} />
        <Stop offset="1" stopColor={COLORS.saltBowl2} />
      </LinearGradient>
    </Defs>
    <Path d="M6 20 a32 15 0 0 0 64 0 z" fill="url(#saltBowlGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} />
    <Ellipse cx={38} cy={20} rx={29} ry={9} fill="#fbfaf6" />
    <SvgText x={38} y={24} fontSize={9} fontWeight="700" fill="#7a7461" textAnchor="middle">
      Salt
    </SvgText>
  </Svg>
);

const Spoon: React.FC = () => (
  <Svg width={92} height={38} viewBox="0 0 92 38">
    <Defs>
      <LinearGradient id="spoonGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={COLORS.chromeLight} />
        <Stop offset="1" stopColor={COLORS.chromeDark} />
      </LinearGradient>
    </Defs>
    <Ellipse cx={14} cy={19} rx={13} ry={9} fill="url(#spoonGrad)" stroke={COLORS.chromeOutline} strokeWidth={1} />
    <Rect x={23} y={16} width={62} height={6} rx={3} fill="url(#spoonGrad)" />
    <Ellipse cx={14} cy={17} rx={9} ry={5.4} fill="#fbfaf6" />
  </Svg>
);

const StirStick: React.FC = () => (
  <Svg width={120} height={30} viewBox="0 0 120 30">
    <Defs>
      <LinearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={COLORS.wood1} />
        <Stop offset="1" stopColor={COLORS.wood2} />
      </LinearGradient>
    </Defs>
    <G rotation={-8} origin="60,15">
      <Rect x={0} y={12} width={120} height={6} rx={3} fill="url(#woodGrad)" />
    </G>
  </Svg>
);

const Cloth: React.FC = () => (
  <Svg width={72} height={46} viewBox="0 0 72 46">
    <Ellipse cx={36} cy={40} rx={32} ry={5} fill="rgba(0,0,0,0.18)" />
    <Defs>
      <LinearGradient id="clothGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={COLORS.cloth1} />
        <Stop offset="1" stopColor={COLORS.cloth2} />
      </LinearGradient>
    </Defs>
    <Path d="M4 8 h32 l32 26 v4 h-58 z" fill="url(#clothGrad)" stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
    <Path d="M4 8 h32 l-6 10 h-26z" fill={COLORS.cloth2} />
    <Line x1={20} y1={12} x2={38} y2={30} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Draggable wrapper                                                  */
/* ------------------------------------------------------------------ */

interface DropTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DraggableProps {
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleRef: React.MutableRefObject<number>;
  dropTargets: DropTarget[];
  onDrop: (itemId: string, targetId: string | null) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Draggable: React.FC<DraggableProps> = ({
  itemId,
  x,
  y,
  width,
  height,
  scaleRef,
  dropTargets,
  onDrop,
  disabled,
  children,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => !disabledRef.current && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
      onPanResponderMove: (_, g: PanResponderGestureState) => {
        const s = scaleRef.current || 1;
        pan.setValue({ x: g.dx / s, y: g.dy / s });
      },
      onPanResponderRelease: (_, g: PanResponderGestureState) => {
        const s = scaleRef.current || 1;
        const centerX = x + width / 2 + g.dx / s;
        const centerY = y + height / 2 + g.dy / s;
        const target = dropTargets.find(
          (t) => centerX >= t.x && centerX <= t.x + t.width && centerY >= t.y && centerY <= t.y + t.height
        );
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
        onDrop(itemId, target ? target.id : null);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[pos(x, y, width, height), { transform: pan.getTranslateTransform() }]}
      {...(disabled ? {} : responder.panHandlers)}
    >
      {children}
    </Animated.View>
  );
};

/* ------------------------------------------------------------------ */
/*  Dialogue steps                                                    */
/* ------------------------------------------------------------------ */

const DIALOGUE_STEPS = [
  'Welcome to an experiment aimed at extracting DNA from\nstrawberry cells and observing it with the naked eye.',
  'Step 1: Tap the strawberry to mash it, then drag it into the mixing cylinder.',
  'Step 2: Tap the faucet to fill the beaker, then drag the beaker onto the cylinder to add water.',
  'Step 3: Drag the salt bowl (or spoon) onto the cylinder to add salt.',
  'Step 4: Drag the washing-liquid bottle onto the cylinder to break down cell membranes.',
  'Step 5: Drag the stir stick onto the cylinder to mix everything together.',
  'Step 6: Drag the cloth onto the cylinder to filter the mixture into the test tube.',
  'Step 7: Drag the cold alcohol bottle onto the test tube and watch the DNA strands appear!',
];

/* ------------------------------------------------------------------ */
/*  Main screen                                                        */
/* ------------------------------------------------------------------ */

export default function DnaLabGameScreen() {
  const { width: winW, height: winH } = useWindowDimensions();
  const scale = Math.min(winW / REF_W, winH / REF_H, 1.5);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const scaledW = REF_W * scale;
  const scaledH = REF_H * scale;

  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleReset = () => {
    setScore(0);
    setElapsed(0);
    setTimerRunning(false);
    setDialogueIndex(0);
    setBeakerWater(0);
    setPouring(false);
    setMashed(false);
    setBeakerUsed(false);
    setStrawberryUsed(false);
    setWashingUsed(false);
    setSaltUsed(false);
    setClothUsed(false);
    setAlcoholUsed(false);
    setTestTubeFilled(false);
    setDnaVisible(false);
    setShowCompletion(false);
    setMistakes(0);
    setMix({
      strawberry: false,
      water: false,
      salt: false,
      washingLiquid: false,
      stirred: false,
      filtered: false,
    });
  };

  const [beakerWater, setBeakerWater] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [mashed, setMashed] = useState(false);
  const [beakerUsed, setBeakerUsed] = useState(false);
  const [strawberryUsed, setStrawberryUsed] = useState(false);
  const [washingUsed, setWashingUsed] = useState(false);
  const [saltUsed, setSaltUsed] = useState(false);
  const [clothUsed, setClothUsed] = useState(false);
  const [alcoholUsed, setAlcoholUsed] = useState(false);
  const [testTubeFilled, setTestTubeFilled] = useState(false);
  const [dnaVisible, setDnaVisible] = useState(false);

  const [mix, setMix] = useState<MixState>({
    strawberry: false,
    water: false,
    salt: false,
    washingLiquid: false,
    stirred: false,
    filtered: false,
  });
  const mixRef = useRef(mix);
  mixRef.current = mix;
  const beakerWaterRef = useRef(beakerWater);
  beakerWaterRef.current = beakerWater;
  const mashedRef = useRef(mashed);
  mashedRef.current = mashed;
  const testTubeFilledRef = useRef(testTubeFilled);
  testTubeFilledRef.current = testTubeFilled;

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const fillTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleTapPress = useCallback(() => {
    if (beakerUsed || beakerWaterRef.current >= 100) return;
    setPouring(true);
    if (!timerRunning) setTimerRunning(true);
    if (fillTimerRef.current) clearInterval(fillTimerRef.current);
    fillTimerRef.current = setInterval(() => {
      setBeakerWater((w) => {
        const next = Math.min(100, w + 8);
        if (next >= 100 && fillTimerRef.current) {
          clearInterval(fillTimerRef.current);
          fillTimerRef.current = null;
          setPouring(false);
        }
        return next;
      });
    }, 45);
  }, [beakerUsed, timerRunning]);

  useEffect(() => {
    return () => {
      if (fillTimerRef.current) clearInterval(fillTimerRef.current);
    };
  }, []);

  const handleMashStrawberry = useCallback(() => {
    if (strawberryUsed) return;
    if (!timerRunning) setTimerRunning(true);
    setMashed(true);
    showFeedback("Strawberry mashed into smooth paste! Now drag it into the mixing cylinder.");
  }, [strawberryUsed, timerRunning]);

  const cylinderTarget: DropTarget = { id: 'cylinder', x: 400, y: 280, width: 78, height: 100 };
  const testTubeTarget: DropTarget = { id: 'testTube', x: 320, y: 235, width: 42, height: 100 };
  const mixTargets = [cylinderTarget];
  const alcoholTargets = [testTubeTarget];

  const handleDrop = useCallback(
    (itemId: string, targetId: string | null) => {
      if (!targetId) return;

      if (!timerRunning) setTimerRunning(true);

      if (itemId === 'strawberry' && targetId === 'cylinder') {
        if (!mashedRef.current) {
          showFeedback("Tap the strawberry first to crush it into a smooth paste!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (mixRef.current.strawberry) return;
        setMix((m) => ({ ...m, strawberry: true }));
        setStrawberryUsed(true);
        setScore((s) => s + 10);
        setDialogueIndex((i) => Math.max(i, 2));
      }

      if (itemId === 'beaker' && targetId === 'cylinder') {
        if (beakerWaterRef.current < 50) {
          showFeedback("Fill the beaker with water from the faucet first!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (mixRef.current.water) return;
        setMix((m) => ({ ...m, water: true }));
        setBeakerUsed(true);
        setScore((s) => s + 5);
        setDialogueIndex((i) => Math.max(i, 3));
      }

      if ((itemId === 'saltBowl' || itemId === 'spoon') && targetId === 'cylinder') {
        if (mixRef.current.salt) return;
        setMix((m) => ({ ...m, salt: true }));
        setSaltUsed(true);
        setScore((s) => s + 5);
        setDialogueIndex((i) => Math.max(i, 4));
      }

      if (itemId === 'washingLiquid' && targetId === 'cylinder') {
        if (mixRef.current.washingLiquid) return;
        setMix((m) => ({ ...m, washingLiquid: true }));
        setWashingUsed(true);
        setScore((s) => s + 10);
        setDialogueIndex((i) => Math.max(i, 5));
      }

      if (itemId === 'stirStick' && targetId === 'cylinder') {
        const m = mixRef.current;
        if (!(m.strawberry && m.water && m.salt && m.washingLiquid)) {
          showFeedback("Add strawberry, water, salt, and washing liquid before stirring!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (m.stirred) return;
        setMix((prev) => ({ ...prev, stirred: true }));
        setScore((s) => s + 10);
        setDialogueIndex((i) => Math.max(i, 6));
      }

      if (itemId === 'cloth' && targetId === 'cylinder') {
        const m = mixRef.current;
        if (!m.stirred) {
          showFeedback("Stir the extraction mixture thoroughly before filtering!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (m.filtered) return;
        setMix((prev) => ({ ...prev, filtered: true }));
        setClothUsed(true);
        setTestTubeFilled(true);
        setScore((s) => s + 15);
        setDialogueIndex((i) => Math.max(i, 7));
      }

      if (itemId === 'alcohol' && targetId === 'testTube') {
        if (!testTubeFilledRef.current) {
          showFeedback("Filter the mixture into the test tube before adding alcohol!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (alcoholUsed) return;
        setAlcoholUsed(true);
        setScore((s) => s + 20);
        setTimeout(() => {
          setDnaVisible(true);
          const finalScore = score + 50;
          setScore(finalScore);
          setTimerRunning(false);
          setShowCompletion(true);
          saveProgress({
            experiment_id: 1,
            completed_sections: ["Aim", "Theory", "Materials", "Procedure", "Precautions", "Virtual Laboratory"],
            lab_score: finalScore,
            lab_time: elapsed,
            mistakes: mistakes,
            is_completed: true,
          });
        }, 900);
      }
    },
    [alcoholUsed, score, elapsed, mistakes, timerRunning]
  );

  const goPrev = () => setDialogueIndex((i) => Math.max(0, i - 1));
  const goNext = () => setDialogueIndex((i) => Math.min(DIALOGUE_STEPS.length - 1, i + 1));

  return (
    <View style={styles.outer}>
      <View style={[styles.viewport, { width: scaledW, height: scaledH }]}>
        <View
          style={{
            position: 'absolute',
            left: (scaledW - REF_W) / 2,
            top: (scaledH - REF_H) / 2,
            width: REF_W,
            height: REF_H,
            transform: [{ scale }],
          }}
        >
          <LabBackground />
          <Bench />

          {/* top bar */}
          <View style={pos(8, 12, 92, 40)}>
            <ScoreBadgeShape />
            <View style={styles.scoreContent}>
              <CoinIcon />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          {/* back button */}
          <Pressable
            style={[pos(108, 12, 38, 40), styles.iconBtn]}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.push({ pathname: "/experiment", params: { id: "1" } });
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 3 L5 9 L11 15" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <Pressable
            style={[pos(650, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "1" } })}
          >
            <PencilIcon />
          </Pressable>
          <Pressable
            style={[pos(698, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "1" } })}
          >
            <NotesIcon />
          </Pressable>

          {/* timer */}
          <View style={pos(367, 6, 100, 96)}>
            <TimerHousing seconds={elapsed} />
          </View>
          <Pressable style={[pos(361, 128, 112, 30), styles.startBtn]} onPress={() => setTimerRunning((r) => !r)}>
            <Text style={styles.startBtnText}>{timerRunning ? 'Pause' : 'Start'}</Text>
          </Pressable>

          {/* fixed equipment */}
          <Pressable style={pos(28, 118, 90, 92)} onPress={handleTapPress}>
            <Tap pouring={pouring} />
          </Pressable>

          <View style={pos(38, 250, 100, 110)}>
            <StandDish />
          </View>

          <View style={pos(320, 235, 42, 100)}>
            <TestTube filled={testTubeFilled} dnaVisible={dnaVisible} />
          </View>

          <View style={pos(400, 280, 78, 100)}>
            <MixCylinder mix={mix} />
          </View>

          {/* draggable equipment */}
          <Draggable
            itemId="beaker"
            x={218}
            y={222}
            width={86}
            height={128}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={beakerUsed}
          >
            <Beaker fillPct={beakerWater} />
          </Draggable>

          <Draggable
            itemId="strawberry"
            x={480}
            y={294}
            width={90}
            height={56}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={strawberryUsed || !mashed}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleMashStrawberry}>
              <PetriStrawberry mashed={mashed} />
            </Pressable>
          </Draggable>

          <Draggable
            itemId="alcohol"
            x={503}
            y={188}
            width={62}
            height={100}
            scaleRef={scaleRef}
            dropTargets={alcoholTargets}
            onDrop={handleDrop}
            disabled={alcoholUsed}
          >
            <Bottle label="Alcohol" liquidColor={COLORS.alcohol} empty={alcoholUsed} />
          </Draggable>

          <Draggable
            itemId="washingLiquid"
            x={563}
            y={163}
            width={62}
            height={100}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={washingUsed}
          >
            <Bottle label="Washing liquid" liquidColor={COLORS.washing} empty={washingUsed} />
          </Draggable>

          <Draggable
            itemId="saltBowl"
            x={598}
            y={274}
            width={76}
            height={48}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={saltUsed}
          >
            <SaltBowl />
          </Draggable>

          <Draggable
            itemId="spoon"
            x={578}
            y={328}
            width={92}
            height={38}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={saltUsed}
          >
            <Spoon />
          </Draggable>

          <Draggable
            itemId="cloth"
            x={368}
            y={238}
            width={72}
            height={46}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={clothUsed}
          >
            <Cloth />
          </Draggable>

          <Draggable
            itemId="stirStick"
            x={283}
            y={318}
            width={120}
            height={30}
            scaleRef={scaleRef}
            dropTargets={mixTargets}
            onDrop={handleDrop}
            disabled={mix.stirred}
          >
            <StirStick />
          </Draggable>

          {/* dialogue bar */}
          <View style={pos(95, 402, 468, 52)}>
            <View style={styles.dialogueBox}>
              <Pressable style={styles.speakerCircle} onPress={() => setMuted((m) => !m)}>
                <SpeakerIcon muted={muted} />
              </Pressable>
              <Text style={styles.dialogueText}>{DIALOGUE_STEPS[dialogueIndex]}</Text>
            </View>
          </View>
          <Pressable style={[pos(38, 405, 58, 58), styles.navCircle]} onPress={goPrev}>
            <ArrowIcon direction="left" />
          </Pressable>
          <Pressable style={[pos(559, 405, 58, 58), styles.navCircle]} onPress={goNext}>
            <ArrowIcon direction="right" />
          </Pressable>

          {/* bottom-right dock */}
          <View style={pos(605, 448, 132, 46)}>
            <View style={styles.dockRow}>
              <Pressable
                style={[styles.dockTile, { borderColor: '#3fae63' }]}
                onPress={() => router.push({ pathname: "/experiment", params: { id: "1" } })}
              >
                <DockIcon kind="book" />
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: '#d8d8d8' }]}
                onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "1" } })}
              >
                <DockIcon kind="clipboard" />
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: '#4a9fd6' }]}
                onPress={() => router.push("/explore")}
              >
                <DockIcon kind="gallery" />
              </Pressable>
            </View>
          </View>

          {/* bottom-left avatar */}
          <Pressable
            style={pos(6, 436, 46, 46)}
            onPress={() => router.push("/profile" as any)}
          >
            <AvatarIcon />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>1</Text>
            </View>
          </Pressable>

          <FeedbackToast message={feedback} />

          <LabCompletionOverlay
            visible={showCompletion}
            title="DNA Extraction Complete!"
            score={score}
            timeSeconds={elapsed}
            stepsCompleted={7}
            totalSteps={7}
            mistakes={mistakes}
            onTakeQuiz={() => router.push({ pathname: "/experiment", params: { id: "1", section: "Knowledge Check" } })}
            onAskMentor={() => router.push({ pathname: "/experiment", params: { id: "1", section: "Lab Mentor" } })}
            onTryAgain={handleReset}
            onBackToLibrary={() => router.push("/explore")}
          />
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Static styles                                                      */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#03151a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    overflow: 'hidden',
    backgroundColor: COLORS.bgTopEdge,
    borderRadius: 18,
  },
  scoreContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 6,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  iconBtn: {
    backgroundColor: COLORS.navyIcon,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    elevation: 3,
  },
  startBtn: {
    backgroundColor: COLORS.startPink,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: COLORS.startPinkDark,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    elevation: 3,
  },
  startBtnText: {
    color: COLORS.startText,
    fontWeight: '800',
    fontSize: 15,
  },
  dialogueBox: {
    flex: 1,
    backgroundColor: COLORS.dialoguePink,
    borderRadius: 26,
    paddingLeft: 46,
    paddingRight: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)',
    elevation: 4,
  },
  speakerCircle: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.speakerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogueText: {
    color: '#2c2c2c',
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '600',
  },
  navCircle: {
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navCircle1,
    borderWidth: 2,
    borderColor: '#ffffff',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  dockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dockTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    top: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e0334f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
