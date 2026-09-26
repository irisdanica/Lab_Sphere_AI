import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

/* ------------------------------------------------------------------ */
/*  Reference Dimensions & Positioning                                 */
/* ------------------------------------------------------------------ */
export const REF_W = 739;
export const REF_H = 501;

export const pos = (x: number, y: number, w: number, h: number) => ({
  position: "absolute" as const,
  left: x,
  top: y,
  width: w,
  height: h,
});

/* ------------------------------------------------------------------ */
/*  Standard Lab Palette (Identical to DNA Master Reference)           */
/* ------------------------------------------------------------------ */
export const LAB_COLORS = {
  bgTopEdge: "#0a3a44",
  bgCenter: "#2c8b8f",
  bgCenterLight: "#3fa3a0",
  pillarGlow: "#3fe9cf",
  pillarCore: "#0b3238",
  benchTop1: "#586e7d",
  benchTop2: "#2f414d",
  benchFront: "#12191f",
  benchFrontTrim: "#3c4b57",
  benchShadowEdge: "#060a0d",
  badgeBlue: "#2f74b8",
  badgeBlueDark: "#1c4d80",
  navyIcon: "#173a55",
  timerBlue1: "#5a95dd",
  timerBlue2: "#1c4a8a",
  timerFace: "#eef3f7",
  timerBezel: "#132a4a",
  bow: "#f2a0c0",
  startPink: "#f6aba1",
  startPinkDark: "#df8378",
  startText: "#7a2a20",
  dialoguePink: "#f6cac8",
  navCircle1: "#3d84c4",
  navCircle2: "#1c4d80",
  speakerBg: "#bcd9ea",
  chromeLight: "#d4dade",
  chromeDark: "#7d878d",
  chromeOutline: "#4c565c",
  glassFill: "rgba(255,255,255,0.13)",
  glassEdge: "rgba(255,255,255,0.75)",
  glassShine: "rgba(255,255,255,0.35)",
  water: "#8ed0e8",
  alcohol: "#3f7fd6",
  washing: "#3fae63",
  pcrPink: "#ff5983",
  pcrBlue: "#4596fa",
  pcrAmber: "#f5a623",
  gelBlue: "#3b82f6",
  uvPurple: "#a855f7",
  gramPurple: "#5b21b6",
  gramPink: "#ec4899",
  elisaBlue: "#2563eb",
  elisaYellow: "#eab308",
} as const;

/* ------------------------------------------------------------------ */
/*  Lab Background & Bench                                             */
/* ------------------------------------------------------------------ */
export const LabBackground: React.FC = () => (
  <Svg width={REF_W} height={REF_H} style={StyleSheet.absoluteFill}>
    <Defs>
      <RadialGradient id="sky" cx="50%" cy="20%" r="75%">
        <Stop offset="0" stopColor={LAB_COLORS.bgCenterLight} />
        <Stop offset="0.55" stopColor={LAB_COLORS.bgCenter} />
        <Stop offset="1" stopColor={LAB_COLORS.bgTopEdge} />
      </RadialGradient>
      <LinearGradient id="pillar" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={LAB_COLORS.pillarGlow} stopOpacity={0.95} />
        <Stop offset="0.45" stopColor={LAB_COLORS.pillarCore} stopOpacity={0.85} />
        <Stop offset="0.55" stopColor={LAB_COLORS.pillarCore} stopOpacity={0.85} />
        <Stop offset="1" stopColor={LAB_COLORS.pillarGlow} stopOpacity={0.95} />
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

export const LabBench: React.FC = () => {
  const benchTop = REF_H * 0.42;
  return (
    <Svg width={REF_W} height={REF_H - benchTop} style={pos(0, benchTop, REF_W, REF_H - benchTop)}>
      <Defs>
        <LinearGradient id="benchTopGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={LAB_COLORS.benchTop1} />
          <Stop offset="1" stopColor={LAB_COLORS.benchTop2} />
        </LinearGradient>
      </Defs>
      <Path d={`M0,32 L${REF_W},32 L${REF_W - 22},0 L22,0 Z`} fill="url(#benchTopGrad)" />
      <Rect x={0} y={32} width={REF_W} height={16} fill={LAB_COLORS.benchFrontTrim} />
      <Rect x={0} y={48} width={REF_W} height={150} fill={LAB_COLORS.benchFront} />
      <Rect x={0} y={48} width={REF_W} height={3} fill="rgba(255,255,255,0.08)" />
      <Rect x={0} y={REF_H - benchTop - 4} width={REF_W} height={4} fill={LAB_COLORS.benchShadowEdge} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Score Badge & Timer                                                */
/* ------------------------------------------------------------------ */
export const ScoreBadgeShape: React.FC = () => (
  <Svg width={92} height={40} viewBox="0 0 92 40" style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="badge" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={LAB_COLORS.badgeBlue} />
        <Stop offset="1" stopColor={LAB_COLORS.badgeBlueDark} />
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

export const CoinIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Circle cx={10} cy={10} r={9} fill="#ffd34d" stroke="#c98a12" strokeWidth={1.4} />
    <SvgText x={10} y={14} fontSize={10} fontWeight="700" fill="#8a5a05" textAnchor="middle">
      $
    </SvgText>
  </Svg>
);

export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => (
  <View style={pos(8, 12, 92, 40)}>
    <ScoreBadgeShape />
    <View style={styles.scoreContent}>
      <CoinIcon />
      <Text style={styles.scoreText}>{score}</Text>
    </View>
  </View>
);

export const TimerHousing: React.FC<{ seconds: number }> = ({ seconds }) => {
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = Math.floor(seconds % 60).toString().padStart(2, "0");
  return (
    <Svg width={100} height={96} viewBox="0 0 100 96">
      <Defs>
        <RadialGradient id="timerBall" cx="38%" cy="30%" r="75%">
          <Stop offset="0" stopColor={LAB_COLORS.timerBlue1} />
          <Stop offset="1" stopColor={LAB_COLORS.timerBlue2} />
        </RadialGradient>
      </Defs>
      <Rect x={30} y={40} width={8} height={20} rx={2} fill={LAB_COLORS.timerBezel} />
      <Rect x={62} y={40} width={8} height={20} rx={2} fill={LAB_COLORS.timerBezel} />
      <Rect x={22} y={58} width={56} height={8} rx={4} fill={LAB_COLORS.timerBezel} />
      <Rect x={44} y={0} width={12} height={10} rx={2} fill={LAB_COLORS.timerBezel} />
      <Circle cx={50} cy={38} r={36} fill="url(#timerBall)" stroke={LAB_COLORS.timerBezel} strokeWidth={3} />
      <Circle cx={50} cy={38} r={27} fill={LAB_COLORS.timerFace} stroke={LAB_COLORS.timerBezel} strokeWidth={2} />
      <SvgText x={50} y={30} fontSize={7} fontWeight="700" fontStyle="italic" fill="#33507a" textAnchor="middle">
        Vlaby
      </SvgText>
      <Rect x={30} y={33} width={40} height={16} rx={2} fill="#dfe6ec" />
      <SvgText x={50} y={45} fontSize={11} fontWeight="700" fill="#20242b" textAnchor="middle">
        {mm}:{ss}
      </SvgText>
      <Circle cx={22} cy={16} r={9} fill={LAB_COLORS.bow} opacity={0.95} />
      <Circle cx={16} cy={10} r={5} fill={LAB_COLORS.bow} opacity={0.95} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Dialogue Bar & Nav Buttons                                         */
/* ------------------------------------------------------------------ */
export const SpeakerIcon: React.FC<{ muted: boolean }> = ({ muted }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path d="M2 7 h3.5 l5.5-4.5 v15 l-5.5-4.5 h-3.5z" fill={LAB_COLORS.navCircle2} />
    {!muted ? (
      <Path d="M13 6 q3 4 0 8" stroke={LAB_COLORS.navCircle2} strokeWidth={2} fill="none" strokeLinecap="round" />
    ) : (
      <Path d="M13 6 l5 8 M18 6 l-5 8" stroke="#c23b3b" strokeWidth={2} strokeLinecap="round" />
    )}
  </Svg>
);

export const ArrowIcon: React.FC<{ direction: "left" | "right" }> = ({ direction }) => (
  <Svg width={18} height={22} viewBox="0 0 18 22">
    <Path
      d={direction === "left" ? "M13 2 L4 11 L13 20" : "M5 2 L14 11 L5 20"}
      stroke="#fff"
      strokeWidth={3.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const InstructionDialogue: React.FC<{
  text: string;
  muted: boolean;
  onToggleMute: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ text, muted, onToggleMute, onPrev, onNext }) => (
  <>
    <View style={pos(95, 402, 468, 52)}>
      <View style={styles.dialogueBox}>
        <Pressable style={styles.speakerCircle} onPress={onToggleMute}>
          <SpeakerIcon muted={muted} />
        </Pressable>
        <Text style={styles.dialogueText} numberOfLines={2}>
          {text}
        </Text>
      </View>
    </View>
    <Pressable style={[pos(38, 405, 58, 58), styles.navCircle]} onPress={onPrev}>
      <ArrowIcon direction="left" />
    </Pressable>
    <Pressable style={[pos(559, 405, 58, 58), styles.navCircle]} onPress={onNext}>
      <ArrowIcon direction="right" />
    </Pressable>
  </>
);

/* ------------------------------------------------------------------ */
/*  Draggable Interaction Component                                    */
/* ------------------------------------------------------------------ */
export interface DropTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DraggableProps {
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

export const Draggable: React.FC<DraggableProps> = ({
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
/*  Feedback Toast                                                     */
/* ------------------------------------------------------------------ */
export const FeedbackToast: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastIcon}>⚠️</Text>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Completion Overlay                                                 */
/* ------------------------------------------------------------------ */
export interface CompletionOverlayProps {
  visible: boolean;
  title?: string;
  score: number;
  timeSeconds: number;
  stepsCompleted: number;
  totalSteps: number;
  mistakes: number;
  onTakeQuiz: () => void;
  onAskMentor: () => void;
  onTryAgain: () => void;
  onBackToLibrary: () => void;
}

export const LabCompletionOverlay: React.FC<CompletionOverlayProps> = ({
  visible,
  title = "Experiment Completed!",
  score,
  timeSeconds,
  stepsCompleted,
  totalSteps,
  mistakes,
  onTakeQuiz,
  onAskMentor,
  onTryAgain,
  onBackToLibrary,
}) => {
  if (!visible) return null;

  const mm = Math.floor(timeSeconds / 60).toString().padStart(2, "0");
  const ss = Math.floor(timeSeconds % 60).toString().padStart(2, "0");

  return (
    <View style={styles.overlayBackdrop}>
      <View style={styles.overlayCard}>
        <View style={styles.badgeCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.overlayTitle}>{title}</Text>
        <Text style={styles.overlaySubtitle}>
          You have successfully performed all virtual laboratory steps with scientific precision.
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{score}</Text>
            <Text style={styles.metricLbl}>SCORE</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{mm}:{ss}</Text>
            <Text style={styles.metricLbl}>TIME</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{stepsCompleted}/{totalSteps}</Text>
            <Text style={styles.metricLbl}>STEPS</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: mistakes > 0 ? "#ea580c" : "#16a34a" }]}>
              {mistakes}
            </Text>
            <Text style={styles.metricLbl}>MISTAKES</Text>
          </View>
        </View>

        <View style={styles.overlayActions}>
          <Pressable style={styles.primaryQuizBtn} onPress={onTakeQuiz}>
            <Text style={styles.primaryQuizBtnText}>Take Knowledge Check →</Text>
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable style={styles.secondaryBtn} onPress={onAskMentor}>
              <Text style={styles.secondaryBtnText}>Ask Lab Mentor</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onTryAgain}>
              <Text style={styles.secondaryBtnText}>Try Again</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onBackToLibrary}>
              <Text style={styles.secondaryBtnText}>Library</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  scoreContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    gap: 6,
  },
  scoreText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  dialogueBox: {
    flex: 1,
    backgroundColor: LAB_COLORS.dialoguePink,
    borderRadius: 26,
    paddingLeft: 46,
    paddingRight: 16,
    paddingVertical: 8,
    justifyContent: "center",
    boxShadow: "0px 3px 4px rgba(0, 0, 0, 0.25)",
    elevation: 4,
  },
  speakerCircle: {
    position: "absolute",
    left: 10,
    top: "50%",
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LAB_COLORS.speakerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogueText: {
    color: "#2c2c2c",
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 15,
    fontWeight: "600",
  },
  navCircle: {
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LAB_COLORS.navCircle1,
    borderWidth: 2,
    borderColor: "#ffffff",
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.3)",
    elevation: 4,
  },
  toastContainer: {
    position: "absolute",
    top: 55,
    alignSelf: "center",
    backgroundColor: "rgba(30, 20, 45, 0.92)",
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 999,
  },
  toastIcon: {
    fontSize: 14,
  },
  toastText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  overlayBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 18, 25, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  overlayCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.35)",
    elevation: 10,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dcfce7",
    borderWidth: 3,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 32,
    color: "#16a34a",
    fontWeight: "900",
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  metricLbl: {
    fontSize: 8,
    fontWeight: "800",
    color: "#9ca3af",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  overlayActions: {
    width: "100%",
    gap: 10,
  },
  primaryQuizBtn: {
    backgroundColor: "#8E70E9",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    boxShadow: "0px 3px 6px rgba(142, 112, 233, 0.3)",
  },
  primaryQuizBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  secondaryBtnText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "700",
  },
});
