import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
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
} from "react-native-svg";
import {
  REF_W,
  REF_H,
  pos,
  LAB_COLORS,
  LabBackground,
  LabBench,
  ScoreBadge,
  TimerHousing,
  Draggable,
  DropTarget,
  InstructionDialogue,
  FeedbackToast,
  LabCompletionOverlay,
} from "@/components/virtual-lab/engine";
import { saveProgress } from "@/services/api";
import { useAuth } from "@/context/auth";

/* ------------------------------------------------------------------ */
/*  Equipment SVG Components                                           */
/* ------------------------------------------------------------------ */

// Glass microscope slide
const MicroscopeSlide: React.FC<{
  smearCreated: boolean;
  heatFixed: boolean;
  crystalViolet: boolean;
  iodineAdded: boolean;
  decolorized: boolean;
  safraninAdded: boolean;
  washed: boolean;
}> = ({
  smearCreated,
  crystalViolet,
  iodineAdded,
  decolorized,
  safraninAdded,
}) => {
  let spotColor = "rgba(255,255,255,0.05)";
  if (smearCreated) spotColor = "rgba(240, 240, 250, 0.45)";
  if (crystalViolet) spotColor = "#6d28d9"; // vivid purple
  if (iodineAdded) spotColor = "#4c1d95"; // deep purple-brown CV-I complex
  if (decolorized) spotColor = "rgba(109, 40, 217, 0.65)"; // partial decolorization
  if (safraninAdded) spotColor = "#be185d"; // purple + pink mix

  return (
    <Svg width={120} height={42} viewBox="0 0 120 42">
      <Defs>
        <LinearGradient id="glassSlideGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
          <Stop offset="0.5" stopColor="rgba(255,255,255,0.18)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0.35)" />
        </LinearGradient>
      </Defs>
      {/* Slide body */}
      <Rect
        x={2}
        y={4}
        width={116}
        height={34}
        rx={3}
        fill="url(#glassSlideGrad)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.5}
      />
      {/* Frosted labeling end */}
      <Rect x={4} y={6} width={26} height={30} rx={2} fill="rgba(255,255,255,0.5)" />
      <SvgText x={17} y={23} fontSize={5.5} fontWeight="800" fill="#334155" textAnchor="middle">
        SMEAR
      </SvgText>
      {/* Smear circle target */}
      <Circle cx={72} cy={21} r={12} fill="none" stroke="rgba(255,255,255,0.35)" strokeDasharray="3,3" strokeWidth={1} />
      {/* Dynamic bacterial smear state */}
      {smearCreated && <Circle cx={72} cy={21} r={10} fill={spotColor} opacity={0.92} />}
      <Line x1={32} y1={8} x2={114} y2={8} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
    </Svg>
  );
};

// Chemical Stain Bottle
const ReagentBottle: React.FC<{
  label: string;
  capColor: string;
  liquidColor: string;
  empty?: boolean;
}> = ({ label, capColor, liquidColor, empty }) => (
  <Svg width={46} height={82} viewBox="0 0 46 82">
    <Defs>
      <LinearGradient id={`stainGrad-${label}`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="rgba(255,255,255,0.3)" />
        <Stop offset="0.5" stopColor="rgba(255,255,255,0.1)" />
        <Stop offset="1" stopColor="rgba(255,255,255,0.25)" />
      </LinearGradient>
    </Defs>
    {/* Cap */}
    <Rect x={14} y={2} width={18} height={12} rx={2} fill={capColor} stroke="#0f172a" strokeWidth={1} />
    <Rect x={17} y={14} width={12} height={6} fill="#475569" />
    {/* Bottle Body */}
    <Path
      d="M10 20 h26 l4 10 v44 a4 4 0 0 1 -4 4 h-26 a4 4 0 0 1 -4 -4 v-44 l4 -10 z"
      fill={`url(#stainGrad-${label})`}
      stroke="rgba(255,255,255,0.6)"
      strokeWidth={1.3}
    />
    {!empty && (
      <Path
        d="M8 44 h30 v28 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 z"
        fill={liquidColor}
        opacity={0.88}
      />
    )}
    {/* Label */}
    <Rect x={8} y={32} width={30} height={16} rx={2} fill="#ffffff" opacity={0.92} />
    <SvgText x={23} y={43} fontSize={5.5} fontWeight="900" fill="#0f172a" textAnchor="middle">
      {label}
    </SvgText>
  </Svg>
);

// Wash Bottle
const WashBottle: React.FC = () => (
  <Svg width={48} height={90} viewBox="0 0 48 90">
    {/* Curved Spout */}
    <Path d="M22 6 Q 16 -4 10 4 L 4 12" fill="none" stroke="#e0f2fe" strokeWidth={3} strokeLinecap="round" />
    {/* Cap */}
    <Rect x={16} y={6} width={16} height={10} rx={2} fill="#0284c7" stroke="#0369a1" strokeWidth={1} />
    {/* Flexible Bottle Body */}
    <Rect x={8} y={16} width={32} height={68} rx={6} fill="rgba(224, 242, 254, 0.4)" stroke="#bae6fd" strokeWidth={1.4} />
    <Rect x={10} y={38} width={28} height={44} rx={4} fill="#38bdf8" opacity={0.5} />
    <SvgText x={24} y={55} fontSize={7} fontWeight="800" fill="#0369a1" textAnchor="middle">
      H2O
    </SvgText>
  </Svg>
);

// Bunsen Burner
const BunsenBurner: React.FC<{ lit: boolean }> = ({ lit }) => (
  <Svg width={54} height={80} viewBox="0 0 54 80">
    <Defs>
      <RadialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor="#67e8f9" />
        <Stop offset="0.6" stopColor="#3b82f6" />
        <Stop offset="1" stopColor="rgba(59, 130, 246, 0)" />
      </RadialGradient>
    </Defs>
    {/* Flame */}
    {lit && (
      <Path
        d="M27 0 Q 34 18 27 28 Q 20 18 27 0 Z"
        fill="url(#flameGrad)"
      />
    )}
    {/* Barrel */}
    <Rect x={23} y={28} width={8} height={36} fill="#94a3b8" stroke="#475569" strokeWidth={1} />
    {/* Air collar */}
    <Rect x={21} y={52} width={12} height={8} fill="#64748b" />
    <Circle cx={27} cy={56} r={2} fill="#0f172a" />
    {/* Heavy base */}
    <Path d="M6 76 L48 76 L42 64 L12 64 Z" fill="#334155" stroke="#1e293b" strokeWidth={1.5} />
  </Svg>
);

// Inoculating Loop
const InoculatingLoop: React.FC = () => (
  <Svg width={90} height={24} viewBox="0 0 90 24">
    {/* Metal handle */}
    <Rect x={4} y={10} width={48} height={4} rx={1} fill="#e2e8f0" stroke="#64748b" strokeWidth={0.8} />
    {/* Wire */}
    <Line x1={52} y1={12} x2={78} y2={12} stroke="#cbd5e1" strokeWidth={1.5} />
    {/* Nichrome loop circle */}
    <Circle cx={82} cy={12} r={3.5} fill="none" stroke="#f59e0b" strokeWidth={1.6} />
  </Svg>
);

// Bacterial Culture Vial
const BacterialCultureVial: React.FC = () => (
  <Svg width={40} height={68} viewBox="0 0 40 68">
    <Rect x={12} y={2} width={16} height={10} rx={2} fill="#ef4444" stroke="#991b1b" strokeWidth={1} />
    <Rect x={8} y={12} width={24} height={52} rx={4} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.7)" strokeWidth={1.3} />
    <Rect x={10} y={32} width={20} height={30} rx={2} fill="#fde047" opacity={0.7} />
    <SvgText x={20} y={48} fontSize={6} fontWeight="900" fill="#854d0e" textAnchor="middle">
      CULTURE
    </SvgText>
  </Svg>
);

// Laboratory Compound Microscope
const LaboratoryMicroscope: React.FC<{ hasSlide: boolean }> = ({ hasSlide }) => (
  <Svg width={110} height={140} viewBox="0 0 110 140">
    <Defs>
      <LinearGradient id="scopeGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#e2e8f0" />
        <Stop offset="0.5" stopColor="#94a3b8" />
        <Stop offset="1" stopColor="#475569" />
      </LinearGradient>
    </Defs>
    {/* Eyepiece ocular tubes */}
    <Rect x={46} y={6} width={14} height={20} rx={3} fill="#1e293b" />
    <Circle cx={53} cy={6} r={7} fill="#334155" />
    {/* Arm curved body */}
    <Path d="M50 26 Q 80 40 76 90 L 64 90 Q 66 50 48 42 Z" fill="url(#scopeGrad)" stroke="#334155" strokeWidth={1.5} />
    {/* Revolving Nosepiece / Objectives */}
    <Circle cx={44} cy={54} r={10} fill="#334155" />
    <Rect x={40} y={62} width={6} height={14} fill="#eab308" stroke="#ca8a04" strokeWidth={0.8} />
    <Rect x={48} y={60} width={5} height={16} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={0.8} />
    {/* Stage */}
    <Rect x={18} y={80} width={56} height={8} rx={2} fill="#0f172a" />
    {hasSlide && <Rect x={26} y={76} width={38} height={4} fill="#38bdf8" stroke="#fff" strokeWidth={0.8} />}
    {/* Focus Coarse/Fine Knobs */}
    <Circle cx={68} cy={95} r={8} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1} />
    <Circle cx={68} cy={95} r={4} fill="#64748b" />
    {/* Condenser & Light source */}
    <Rect x={38} y={92} width={16} height={10} fill="#64748b" />
    <Circle cx={46} cy={108} r={6} fill="#fef08a" />
    {/* Horseshoe base */}
    <Path d="M12 134 L92 134 L82 116 L22 116 Z" fill="url(#scopeGrad)" stroke="#334155" strokeWidth={1.5} />
  </Svg>
);

// High-Resolution Microscopic Viewport
const MicroscopicViewport: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => (
  <View style={styles.microscopeModal}>
    <View style={styles.scopeReticle}>
      <Svg width={250} height={250} viewBox="0 0 250 250">
        <Defs>
          <RadialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#f8fafc" />
            <Stop offset="0.75" stopColor="#e2e8f0" />
            <Stop offset="1" stopColor="#94a3b8" />
          </RadialGradient>
        </Defs>
        {/* Optical circle */}
        <Circle cx={125} cy={125} r={118} fill="url(#fieldGrad)" stroke="#0f172a" strokeWidth={12} />

        {/* GRAM-POSITIVE COCCI (Purple clusters of S. aureus) */}
        {[
          { cx: 80, cy: 90 },
          { cx: 88, cy: 85 },
          { cx: 95, cy: 92 },
          { cx: 86, cy: 98 },
          { cx: 96, cy: 102 },
          { cx: 78, cy: 100 },
          { cx: 85, cy: 108 },
          { cx: 160, cy: 140 },
          { cx: 168, cy: 135 },
          { cx: 174, cy: 144 },
          { cx: 165, cy: 150 },
        ].map((pt, i) => (
          <Circle key={`pos-${i}`} cx={pt.cx} cy={pt.cy} r={5} fill="#5b21b6" stroke="#3b0764" strokeWidth={0.8} />
        ))}

        {/* GRAM-NEGATIVE BACILLI (Pink rods of E. coli) */}
        {[
          { x: 120, y: 70, rot: 15 },
          { x: 140, y: 85, rot: -25 },
          { x: 70, y: 150, rot: 40 },
          { x: 95, y: 165, rot: -10 },
          { x: 130, y: 160, rot: 30 },
          { x: 110, y: 120, rot: -45 },
        ].map((b, i) => (
          <G key={`neg-${i}`} transform={`rotate(${b.rot}, ${b.x + 10}, ${b.y + 4})`}>
            <Rect x={b.x} y={b.y} width={20} height={7} rx={3.5} fill="#ec4899" stroke="#9d174d" strokeWidth={0.8} />
          </G>
        ))}

        {/* Reticle crosshair lines */}
        <Line x1={125} y1={20} x2={125} y2={40} stroke="#64748b" strokeWidth={1} />
        <Line x1={125} y1={210} x2={125} y2={230} stroke="#64748b" strokeWidth={1} />
        <Line x1={20} y1={125} x2={40} y2={125} stroke="#64748b" strokeWidth={1} />
        <Line x1={210} y1={125} x2={230} y2={125} stroke="#64748b" strokeWidth={1} />
      </Svg>
    </View>

    {/* Legend Callouts */}
    <View style={styles.legendBox}>
      <Text style={styles.legendTitle}>🔬 Microscopic Field (1000X Oil Immersion)</Text>
      <View style={styles.legendItem}>
        <View style={[styles.colorDot, { backgroundColor: "#5b21b6" }]} />
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: "800", color: "#5b21b6" }}>Gram-Positive (Purple): </Text>
          Staphylococcus aureus (cocci clusters, thick peptidoglycan).
        </Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.colorDot, { backgroundColor: "#ec4899" }]} />
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: "800", color: "#ec4899" }}>Gram-Negative (Pink): </Text>
          Escherichia coli (bacilli rods, thin peptidoglycan + outer LPS membrane).
        </Text>
      </View>
      <Pressable style={styles.closeScopeBtn} onPress={onClose}>
        <Text style={styles.closeScopeBtnText}>Close Microscopic View</Text>
      </Pressable>
    </View>
  </View>
);

/* ------------------------------------------------------------------ */
/*  Dialogue Steps                                                     */
/* ------------------------------------------------------------------ */
const DIALOGUE_STEPS = [
  "Welcome to the Gram Staining Lab! Differentiate bacteria by cell wall characteristics.",
  "Step 1: Drag the inoculating loop onto the culture vial, then drag to the slide to create a smear.",
  "Step 2: Drag the glass slide over the Bunsen burner flame to heat-fix the bacteria.",
  "Step 3: Drag the Crystal Violet bottle onto the slide (Primary purple stain, 60s).",
  "Step 4: Drag the Wash Bottle onto the slide to rinse excess crystal violet.",
  "Step 5: Drag the Gram's Iodine bottle onto the slide (Mordant forms CV-I complex, 60s).",
  "Step 6: Drag the Wash Bottle onto the slide to rinse excess iodine.",
  "Step 7: Drag the Decolorizer alcohol onto the slide (10–15s critical decolorization).",
  "Step 8: Drag the Wash Bottle immediately to stop decolorization.",
  "Step 9: Drag the Safranin bottle onto the slide (Pink counterstain, 45s).",
  "Step 10: Drag the Wash Bottle for the final rinse.",
  "Step 11: Drag the prepared slide onto the Microscope stage to examine bacterial morphology!",
];

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function GramStainingLabScreen() {
  const { user } = useAuth();
  const { width: winW, height: winH } = useWindowDimensions();
  const scale = Math.min(winW / REF_W, winH / REF_H, 1.5);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const scaledW = REF_W * scale;
  const scaledH = REF_H * scale;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "LS";

  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showMicroscopeModal, setShowMicroscopeModal] = useState(false);

  // Experiment state
  const [loopLoaded, setLoopLoaded] = useState(false);
  const [smearCreated, setSmearCreated] = useState(false);
  const [heatFixed, setHeatFixed] = useState(false);
  const [crystalVioletAdded, setCrystalVioletAdded] = useState(false);
  const [washed1, setWashed1] = useState(false);
  const [iodineAdded, setIodineAdded] = useState(false);
  const [washed2, setWashed2] = useState(false);
  const [decolorized, setDecolorized] = useState(false);
  const [washed3, setWashed3] = useState(false);
  const [safraninAdded, setSafraninAdded] = useState(false);
  const [washed4, setWashed4] = useState(false);
  const [slideOnScope, setSlideOnScope] = useState(false);

  const loopLoadedRef = useRef(loopLoaded);
  loopLoadedRef.current = loopLoaded;
  const smearCreatedRef = useRef(smearCreated);
  smearCreatedRef.current = smearCreated;
  const heatFixedRef = useRef(heatFixed);
  heatFixedRef.current = heatFixed;
  const crystalVioletRef = useRef(crystalVioletAdded);
  crystalVioletRef.current = crystalVioletAdded;
  const washed1Ref = useRef(washed1);
  washed1Ref.current = washed1;
  const iodineRef = useRef(iodineAdded);
  iodineRef.current = iodineAdded;
  const washed2Ref = useRef(washed2);
  washed2Ref.current = washed2;
  const decolorizedRef = useRef(decolorized);
  decolorizedRef.current = decolorized;
  const washed3Ref = useRef(washed3);
  washed3Ref.current = washed3;
  const safraninRef = useRef(safraninAdded);
  safraninRef.current = safraninAdded;
  const washed4Ref = useRef(washed4);
  washed4Ref.current = washed4;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2600);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const handleReset = () => {
    setScore(0);
    setElapsed(0);
    setTimerRunning(false);
    setDialogueIndex(0);
    setMistakes(0);
    setLoopLoaded(false);
    setSmearCreated(false);
    setHeatFixed(false);
    setCrystalVioletAdded(false);
    setWashed1(false);
    setIodineAdded(false);
    setWashed2(false);
    setDecolorized(false);
    setWashed3(false);
    setSafraninAdded(false);
    setWashed4(false);
    setSlideOnScope(false);
    setShowMicroscopeModal(false);
    setShowCompletion(false);
  };

  // Drop targets
  const slideTarget: DropTarget = { id: "slide", x: 250, y: 280, width: 120, height: 50 };
  const burnerTarget: DropTarget = { id: "burner", x: 140, y: 250, width: 60, height: 80 };
  const scopeTarget: DropTarget = { id: "scope", x: 440, y: 220, width: 110, height: 130 };
  const cultureTarget: DropTarget = { id: "culture", x: 40, y: 260, width: 50, height: 70 };

  const loopTargets = [cultureTarget, slideTarget];
  const slideTargets = [burnerTarget, scopeTarget];
  const reagentTargets = [slideTarget];

  // Drop logic
  const handleDrop = useCallback(
    (itemId: string, targetId: string | null) => {
      if (!targetId) return;
      if (!timerRunning) setTimerRunning(true);

      // Inoculating loop actions
      if (itemId === "loop" && targetId === "culture") {
        setLoopLoaded(true);
        showFeedback("Loop loaded with bacterial culture! Now drag it to the slide to create a smear.");
        return;
      }
      if (itemId === "loop" && targetId === "slide") {
        if (!loopLoadedRef.current) {
          showFeedback("Dip loop into the culture vial first to collect bacteria!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (smearCreatedRef.current) return;
        setSmearCreated(true);
        setScore((s) => s + 10);
        setDialogueIndex(2);
        showFeedback("Thin bacterial smear created! Now drag slide over Bunsen burner to heat-fix.");
        return;
      }

      // Heat fixation
      if (itemId === "slide" && targetId === "burner") {
        if (!smearCreatedRef.current) {
          showFeedback("Create the bacterial smear before heat-fixing!");
          setMistakes((m) => m + 1);
          return;
        }
        if (heatFixedRef.current) return;
        setHeatFixed(true);
        setScore((s) => s + 10);
        setDialogueIndex(3);
        showFeedback("Slide heat-fixed! Surface proteins coagulated. Now apply Crystal Violet.");
        return;
      }

      // Staining steps on slide
      if (itemId === "crystalViolet" && targetId === "slide") {
        if (!heatFixedRef.current) {
          showFeedback("Heat-fix the smear over the burner first!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (crystalVioletRef.current) return;
        setCrystalVioletAdded(true);
        setScore((s) => s + 10);
        setDialogueIndex(4);
        showFeedback("Crystal Violet applied for 60s! All cells stained purple. Rinse with water.");
        return;
      }

      if (itemId === "wash" && targetId === "slide") {
        if (!crystalVioletRef.current) {
          showFeedback("Apply crystal violet before washing!");
          return;
        }
        if (crystalVioletRef.current && !washed1Ref.current) {
          setWashed1(true);
          setScore((s) => s + 5);
          setDialogueIndex(5);
          showFeedback("Rinsed! Now apply Gram's Iodine mordant.");
          return;
        }
        if (iodineRef.current && !washed2Ref.current) {
          setWashed2(true);
          setScore((s) => s + 5);
          setDialogueIndex(7);
          showFeedback("Rinsed! Now apply Decolorizer alcohol for 10–15 seconds.");
          return;
        }
        if (decolorizedRef.current && !washed3Ref.current) {
          setWashed3(true);
          setScore((s) => s + 5);
          setDialogueIndex(9);
          showFeedback("Decolorization stopped! Now apply Safranin counterstain.");
          return;
        }
        if (safraninRef.current && !washed4Ref.current) {
          setWashed4(true);
          setScore((s) => s + 5);
          setDialogueIndex(11);
          showFeedback("Final rinse complete! Slide is stained and ready. Drag it to the microscope.");
          return;
        }
      }

      if (itemId === "iodine" && targetId === "slide") {
        if (!washed1Ref.current) {
          showFeedback("Rinse off excess crystal violet before adding iodine!");
          setMistakes((m) => m + 1);
          return;
        }
        if (iodineRef.current) return;
        setIodineAdded(true);
        setScore((s) => s + 10);
        setDialogueIndex(6);
        showFeedback("Gram's Iodine added! CV-I complexes formed in peptidoglycan. Rinse with water.");
        return;
      }

      if (itemId === "decolorizer" && targetId === "slide") {
        if (!washed2Ref.current) {
          showFeedback("Rinse after iodine before decolorizing!");
          setMistakes((m) => m + 1);
          return;
        }
        if (decolorizedRef.current) return;
        setDecolorized(true);
        setScore((s) => s + 15);
        setDialogueIndex(8);
        showFeedback("Decolorized with 95% ethanol! Thin LPS membranes dissolved. Rinse immediately!");
        return;
      }

      if (itemId === "safranin" && targetId === "slide") {
        if (!washed3Ref.current) {
          showFeedback("Rinse slide with water to halt decolorizer before safranin!");
          setMistakes((m) => m + 1);
          return;
        }
        if (safraninRef.current) return;
        setSafraninAdded(true);
        setScore((s) => s + 10);
        setDialogueIndex(10);
        showFeedback("Safranin applied! Decolorized Gram-negative cells counterstained pink. Rinse now.");
        return;
      }

      // Drag slide onto microscope
      if (itemId === "slide" && targetId === "scope") {
        if (!washed4Ref.current) {
          showFeedback("Complete all staining and wash steps before placing on the microscope!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        setSlideOnScope(true);
        const finalScore = score + 25;
        setScore(finalScore);
        setTimerRunning(false);
        setShowMicroscopeModal(true);
        saveProgress({
          experiment_id: 3,
          completed_sections: ["Aim", "Theory", "Materials", "Procedure", "Precautions", "Virtual Laboratory"],
          lab_score: finalScore,
          lab_time: elapsed,
          mistakes: mistakes,
          is_completed: true,
        });
      }
    },
    [score, elapsed, mistakes, timerRunning]
  );

  return (
    <View style={styles.outer}>
      <View style={[styles.viewport, { width: scaledW, height: scaledH }]}>
        <View
          style={{
            position: "absolute",
            left: (scaledW - REF_W) / 2,
            top: (scaledH - REF_H) / 2,
            width: REF_W,
            height: REF_H,
            transform: [{ scale }],
          }}
        >
          <LabBackground />
          <LabBench />

          {/* Top Bar */}
          <ScoreBadge score={score} />

          {/* Back button */}
          <Pressable
            style={[pos(108, 12, 38, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/experiment", params: { id: "3" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 3 L5 9 L11 15" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <Pressable
            style={[pos(650, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "3" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M3 15 l1-4 8-8 3 3-8 8z" fill="#fff" />
              <Path d="M11 3 l3 3 2-2-3-3z" fill="#fff" />
            </Svg>
          </Pressable>
          <Pressable
            style={[pos(698, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "3" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Rect x={2} y={1} width={13} height={15} rx={2} fill="#fff" />
              <Line x1={5} y1={6} x2={12} y2={6} stroke={LAB_COLORS.navyIcon} strokeWidth={1.3} />
              <Line x1={5} y1={9} x2={12} y2={9} stroke={LAB_COLORS.navyIcon} strokeWidth={1.3} />
            </Svg>
          </Pressable>

          {/* Timer Housing */}
          <View style={pos(367, 6, 100, 96)}>
            <TimerHousing seconds={elapsed} />
          </View>
          <Pressable
            style={[pos(361, 128, 112, 30), styles.startBtn]}
            onPress={() => setTimerRunning((r) => !r)}
          >
            <Text style={styles.startBtnText}>{timerRunning ? "Pause" : "Start"}</Text>
          </Pressable>

          {/* Fixed Bacterial Culture Vial */}
          <View style={pos(40, 260, 40, 68)}>
            <BacterialCultureVial />
          </View>

          {/* Fixed Bunsen Burner */}
          <View style={pos(140, 250, 54, 80)}>
            <BunsenBurner lit={true} />
          </View>

          {/* Fixed Compound Microscope */}
          <Pressable
            style={pos(450, 205, 110, 140)}
            onPress={() => {
              if (slideOnScope) setShowMicroscopeModal(true);
            }}
          >
            <LaboratoryMicroscope hasSlide={slideOnScope} />
          </Pressable>

          {/* Draggable Inoculating Loop */}
          <Draggable
            itemId="loop"
            x={25}
            y={340}
            width={90}
            height={24}
            scaleRef={scaleRef}
            dropTargets={loopTargets}
            onDrop={handleDrop}
            disabled={smearCreated}
          >
            <InoculatingLoop />
          </Draggable>

          {/* Draggable Microscope Slide */}
          <Draggable
            itemId="slide"
            x={240}
            y={285}
            width={120}
            height={42}
            scaleRef={scaleRef}
            dropTargets={slideTargets}
            onDrop={handleDrop}
            disabled={slideOnScope}
          >
            <MicroscopeSlide
              smearCreated={smearCreated}
              heatFixed={heatFixed}
              crystalViolet={crystalVioletAdded}
              iodineAdded={iodineAdded}
              decolorized={decolorized}
              safraninAdded={safraninAdded}
              washed={washed4}
            />
          </Draggable>

          {/* Draggable Staining Bottles */}
          <Draggable
            itemId="crystalViolet"
            x={570}
            y={180}
            width={46}
            height={82}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={crystalVioletAdded}
          >
            <ReagentBottle label="Crystal V" capColor="#6d28d9" liquidColor="#7c3aed" empty={crystalVioletAdded} />
          </Draggable>

          <Draggable
            itemId="iodine"
            x={620}
            y={180}
            width={46}
            height={82}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={iodineAdded}
          >
            <ReagentBottle label="Iodine" capColor="#b45309" liquidColor="#d97706" empty={iodineAdded} />
          </Draggable>

          <Draggable
            itemId="decolorizer"
            x={570}
            y={270}
            width={46}
            height={82}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={decolorized}
          >
            <ReagentBottle label="Ethanol" capColor="#0284c7" liquidColor="#e0f2fe" empty={decolorized} />
          </Draggable>

          <Draggable
            itemId="safranin"
            x={620}
            y={270}
            width={46}
            height={82}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={safraninAdded}
          >
            <ReagentBottle label="Safranin" capColor="#be185d" liquidColor="#ec4899" empty={safraninAdded} />
          </Draggable>

          <Draggable
            itemId="wash"
            x={672}
            y={230}
            width={48}
            height={90}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
          >
            <WashBottle />
          </Draggable>

          {/* Dialogue Bar */}
          <InstructionDialogue
            text={DIALOGUE_STEPS[dialogueIndex]}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onPrev={() => setDialogueIndex((i) => Math.max(0, i - 1))}
            onNext={() => setDialogueIndex((i) => Math.min(DIALOGUE_STEPS.length - 1, i + 1))}
          />

          {/* Bottom Dock */}
          <View style={pos(605, 448, 132, 46)}>
            <View style={styles.dockRow}>
              <Pressable
                style={[styles.dockTile, { borderColor: "#3fae63" }]}
                onPress={() => router.push({ pathname: "/experiment", params: { id: "3" } })}
              >
                <Text style={styles.dockIconText}>📖</Text>
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: "#d8d8d8" }]}
                onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "3" } })}
              >
                <Text style={styles.dockIconText}>📋</Text>
              </Pressable>
              <Pressable style={[styles.dockTile, { borderColor: "#4a9fd6" }]} onPress={() => router.push("/explore")}>
                <Text style={styles.dockIconText}>🖼</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom-left Avatar */}
          <Pressable style={pos(6, 436, 46, 46)} onPress={() => router.push("/profile" as any)}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </Pressable>

          {/* Feedback Toast */}
          <FeedbackToast message={feedback} />

          {/* Microscope Modal */}
          {showMicroscopeModal && (
            <MicroscopicViewport
              onClose={() => {
                setShowMicroscopeModal(false);
                setShowCompletion(true);
              }}
            />
          )}

          {/* Completion Overlay */}
          <LabCompletionOverlay
            visible={showCompletion}
            title="Gram Staining Complete!"
            score={score}
            timeSeconds={elapsed}
            stepsCompleted={10}
            totalSteps={10}
            mistakes={mistakes}
            onTakeQuiz={() => router.push({ pathname: "/experiment", params: { id: "3", section: "Knowledge Check" } })}
            onAskMentor={() => router.push({ pathname: "/experiment", params: { id: "3", section: "Lab Mentor" } })}
            onTryAgain={handleReset}
            onBackToLibrary={() => router.push("/explore")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#03151a",
    alignItems: "center",
    justifyContent: "center",
  },
  viewport: {
    overflow: "hidden",
    backgroundColor: LAB_COLORS.bgTopEdge,
    borderRadius: 18,
  },
  iconBtn: {
    backgroundColor: LAB_COLORS.navyIcon,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.3)",
    elevation: 3,
  },
  startBtn: {
    backgroundColor: LAB_COLORS.startPink,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    borderBottomColor: LAB_COLORS.startPinkDark,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.3)",
    elevation: 3,
  },
  startBtnText: {
    color: LAB_COLORS.startText,
    fontWeight: "800",
    fontSize: 15,
  },
  dockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dockTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  dockIconText: {
    fontSize: 16,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#a855f7",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  microscopeModal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.94)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: 24,
    zIndex: 900,
  },
  scopeReticle: {
    boxShadow: "0px 0px 18px rgba(56, 189, 248, 0.5)",
  },
  legendBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    maxWidth: 360,
    gap: 12,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
  },
  legendText: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    lineHeight: 16,
  },
  closeScopeBtn: {
    backgroundColor: "#8E70E9",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  closeScopeBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
});
