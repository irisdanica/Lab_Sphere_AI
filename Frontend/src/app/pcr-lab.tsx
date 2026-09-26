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
  ArrowIcon,
} from "@/components/virtual-lab/engine";
import { saveProgress } from "@/services/api";
import { useAuth } from "@/context/auth";

/* ------------------------------------------------------------------ */
/*  Equipment SVG Components                                           */
/* ------------------------------------------------------------------ */

// Microtube in rack
const ReagentTube: React.FC<{
  label: string;
  capColor: string;
  liquidColor: string;
  used: boolean;
}> = ({ label, capColor, liquidColor, used }) => (
  <Svg width={44} height={70} viewBox="0 0 44 70">
    <Defs>
      <LinearGradient id={`tubeGrad-${label}`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
        <Stop offset="0.5" stopColor="rgba(255,255,255,0.15)" />
        <Stop offset="1" stopColor="rgba(255,255,255,0.3)" />
      </LinearGradient>
    </Defs>
    {/* Cap */}
    <Rect x={10} y={4} width={24} height={9} rx={3} fill={capColor} stroke="#0f172a" strokeWidth={1} />
    <Rect x={14} y={1} width={16} height={4} rx={1} fill={capColor} />
    {/* Body */}
    <Path
      d="M12 13 h20 v36 l-5 12 a6 6 0 0 1 -10 0 l-5 -12 z"
      fill={`url(#tubeGrad-${label})`}
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={1.5}
    />
    {/* Liquid */}
    {!used && (
      <Path
        d="M14 34 h16 v16 l-4 9 a5 5 0 0 1 -8 0 l-4 -9 z"
        fill={liquidColor}
        opacity={0.88}
      />
    )}
    {/* Graduation & label */}
    <Line x1={26} y1={25} x2={30} y2={25} stroke="#fff" strokeWidth={1} opacity={0.6} />
    <Line x1={24} y1={35} x2={30} y2={35} stroke="#fff" strokeWidth={1} opacity={0.6} />
    <Rect x={10} y={48} width={24} height={12} rx={2} fill="#fff" opacity={0.92} />
    <SvgText x={22} y={57} fontSize={6.5} fontWeight="800" fill="#0f172a" textAnchor="middle">
      {label}
    </SvgText>
  </Svg>
);

// PCR 0.2ml reaction tube
const PcrReactionTube: React.FC<{
  isOpen: boolean;
  liquidVolume: number;
  inCycler: boolean;
}> = ({ isOpen, liquidVolume, inCycler }) => {
  if (inCycler) return null;
  const liquidHeight = Math.min(22, liquidVolume * 4);
  return (
    <Svg width={36} height={60} viewBox="0 0 36 60">
      <Defs>
        <LinearGradient id="pcrTubeGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0.15)" />
        </LinearGradient>
      </Defs>
      {/* Cap - open or closed */}
      {isOpen ? (
        <Path d="M8 8 Q 2 0 6 -4 Q 16 -6 18 2 L12 8 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth={1} />
      ) : (
        <Rect x={8} y={4} width={20} height={6} rx={2} fill="#38bdf8" stroke="#0284c7" strokeWidth={1} />
      )}
      {/* Conical PCR body */}
      <Path
        d="M10 10 h16 v22 l-6 20 a3 3 0 0 1 -4 0 l-6 -20 z"
        fill="url(#pcrTubeGrad)"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1.4}
      />
      {liquidVolume > 0 && (
        <Path
          d={`M12 ${48 - liquidHeight} h12 l-4 ${liquidHeight + 2} a2 2 0 0 1 -4 0 z`}
          fill="#a5b4fc"
          opacity={0.9}
        />
      )}
      <Line x1={12} y1={12} x2={13} y2={40} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
    </Svg>
  );
};

// Tube Rack holding reagents
const TubeRack: React.FC = () => (
  <Svg width={180} height={50} viewBox="0 0 180 50">
    <Defs>
      <LinearGradient id="rackGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#334155" />
        <Stop offset="1" stopColor="#1e293b" />
      </LinearGradient>
    </Defs>
    <Path d="M4 14 L176 14 L168 36 L16 36 Z" fill="url(#rackGrad)" stroke="#475569" strokeWidth={1.5} />
    <Rect x={16} y={36} width={152} height={12} fill="#0f172a" />
    {/* Rack wells */}
    {[26, 56, 86, 116, 146].map((cx, i) => (
      <Ellipse key={i} cx={cx} cy={22} rx={11} ry={5} fill="#0f172a" stroke="#64748b" strokeWidth={1} />
    ))}
  </Svg>
);

// High-Tech Thermal Cycler
const ThermalCycler: React.FC<{
  lidOpen: boolean;
  running: boolean;
  phase: string;
  temp: number;
  cycle: number;
  hasTube: boolean;
}> = ({ lidOpen, running, phase, temp, cycle, hasTube }) => (
  <Svg width={200} height={170} viewBox="0 0 200 170">
    <Defs>
      <LinearGradient id="cyclerBody" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#475569" />
        <Stop offset="0.5" stopColor="#1e293b" />
        <Stop offset="1" stopColor="#0f172a" />
      </LinearGradient>
      <LinearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#0284c7" />
        <Stop offset="1" stopColor="#0369a1" />
      </LinearGradient>
    </Defs>

    {/* Main chassis */}
    <Path
      d="M10 40 L190 40 L180 165 L20 165 Z"
      fill="url(#cyclerBody)"
      stroke="#64748b"
      strokeWidth={2}
    />
    <Rect x={20} y={160} width={160} height={6} rx={2} fill="#020617" />

    {/* Heated Lid Block */}
    {lidOpen ? (
      <G>
        {/* Open lid flipped back */}
        <Path d="M25 40 L175 40 L165 15 L35 15 Z" fill="#334155" stroke="#94a3b8" strokeWidth={1.5} />
        {/* Exposed 96-well silver heat block */}
        <Rect x={45} y={44} width={110} height={40} rx={4} fill="#cbd5e1" stroke="#475569" strokeWidth={1.5} />
        {[60, 80, 100, 120, 140].map((bx, i) => (
          <Circle key={i} cx={bx} cy={64} r={6} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
        ))}
        {hasTube && (
          <G>
            <Circle cx={100} cy={64} r={6.5} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
            <Circle cx={100} cy={64} r={3} fill="#bae6fd" />
          </G>
        )}
      </G>
    ) : (
      <G>
        {/* Closed silver lid */}
        <Path d="M30 40 L170 40 L160 55 L40 55 Z" fill="#64748b" stroke="#94a3b8" strokeWidth={1.5} />
        <Rect x={85} y={48} width={30} height={5} rx={2} fill="#0ea5e9" />
      </G>
    )}

    {/* LCD Display Screen */}
    <Rect x={35} y={92} width={130} height={58} rx={6} fill="#0f172a" stroke="#38bdf8" strokeWidth={1.5} />
    <Rect x={38} y={95} width={124} height={52} rx={4} fill="url(#screenGrad)" />

    {/* LCD Screen Content */}
    <SvgText x={45} y={108} fontSize={8} fontWeight="800" fill="#bae6fd">
      CYCLER 3000
    </SvgText>
    <SvgText x={155} y={108} fontSize={8} fontWeight="800" fill={running ? "#4ade80" : "#facc15"} textAnchor="end">
      {running ? "RUNNING" : "STANDBY"}
    </SvgText>

    <Line x1={42} y1={112} x2={158} y2={112} stroke="#38bdf8" strokeWidth={0.8} opacity={0.6} />

    <SvgText x={45} y={124} fontSize={12} fontWeight="900" fill="#ffffff">
      {temp}°C
    </SvgText>
    <SvgText x={100} y={124} fontSize={9} fontWeight="700" fill="#f0f9ff">
      {phase.toUpperCase()}
    </SvgText>

    <SvgText x={45} y={139} fontSize={8} fontWeight="700" fill="#e0f2fe">
      Cycle: {cycle}/30
    </SvgText>

    {/* Tiny real-time cycle graph */}
    <Path
      d="M115 138 L125 130 L135 142 L145 134 L155 138"
      fill="none"
      stroke={running ? "#4ade80" : "#ffffff"}
      strokeWidth={1.6}
    />
  </Svg>
);

// Micropipette
const Micropipette: React.FC<{ volume: string; hasTip: boolean }> = ({ volume, hasTip }) => (
  <Svg width={40} height={120} viewBox="0 0 40 120">
    <Defs>
      <LinearGradient id="pipetteGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#64748b" />
        <Stop offset="0.5" stopColor="#cbd5e1" />
        <Stop offset="1" stopColor="#475569" />
      </LinearGradient>
    </Defs>
    {/* Plunger */}
    <Rect x={15} y={2} width={10} height={12} rx={2} fill="#ef4444" />
    <Rect x={17} y={14} width={6} height={10} fill="#94a3b8" />
    {/* Body handle */}
    <Path d="M12 24 h16 v42 l-3 18 h-10 l-3 -18 z" fill="url(#pipetteGrad)" stroke="#334155" strokeWidth={1.2} />
    {/* Digital volume window */}
    <Rect x={15} y={34} width={10} height={16} rx={2} fill="#0f172a" />
    <SvgText x={20} y={46} fontSize={7} fontWeight="900" fill="#38bdf8" textAnchor="middle">
      {volume}
    </SvgText>
    {/* Barrel shaft */}
    <Rect x={18} y={84} width={4} height={20} fill="#94a3b8" />
    {/* Tip */}
    {hasTip && (
      <Path d="M18 104 h4 l-1.5 14 a1 1 0 0 1 -1 0 z" fill="#fef08a" stroke="#ca8a04" strokeWidth={0.8} />
    )}
  </Svg>
);

/* ------------------------------------------------------------------ */
/*  Dialogue Steps                                                     */
/* ------------------------------------------------------------------ */
const DIALOGUE_STEPS = [
  "Welcome to the PCR Virtual Lab! Prepare the reaction mixture to amplify target DNA.",
  "Step 1: Tap the PCR reaction tube to open its cap.",
  "Step 2: Drag the 10X PCR Buffer tube into the PCR tube.",
  "Step 3: Drag the dNTPs Master Mix tube into the PCR tube.",
  "Step 4: Drag the Primers tube (Forward + Reverse) into the PCR tube.",
  "Step 5: Drag the DNA Template tube into the PCR tube.",
  "Step 6: Drag the Taq DNA Polymerase tube into the PCR tube.",
  "Step 7: Tap the PCR tube to close its cap, then drag it into the Thermal Cycler block.",
  "Step 8: Tap the Thermal Cycler lid to close it, then press 'START PCR'!",
  "Amplification complete! Over 1,000,000,000 copies of target DNA synthesized.",
];

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function PcrLabScreen() {
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

  // Experiment state
  const [tubeOpen, setTubeOpen] = useState(false);
  const [addedBuffer, setAddedBuffer] = useState(false);
  const [addedDntps, setAddedDntps] = useState(false);
  const [addedPrimers, setAddedPrimers] = useState(false);
  const [addedTemplate, setAddedTemplate] = useState(false);
  const [addedTaq, setAddedTaq] = useState(false);
  const [tubeClosed, setTubeClosed] = useState(false);
  const [tubeInCycler, setTubeInCycler] = useState(false);
  const [cyclerLidOpen, setCyclerLidOpen] = useState(true);
  const [cyclerRunning, setCyclerRunning] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseName, setPhaseName] = useState("Standby");

  const tubeOpenRef = useRef(tubeOpen);
  tubeOpenRef.current = tubeOpen;
  const addedBufferRef = useRef(addedBuffer);
  addedBufferRef.current = addedBuffer;
  const addedDntpsRef = useRef(addedDntps);
  addedDntpsRef.current = addedDntps;
  const addedPrimersRef = useRef(addedPrimers);
  addedPrimersRef.current = addedPrimers;
  const addedTemplateRef = useRef(addedTemplate);
  addedTemplateRef.current = addedTemplate;
  const addedTaqRef = useRef(addedTaq);
  addedTaqRef.current = addedTaq;
  const tubeClosedRef = useRef(tubeClosed);
  tubeClosedRef.current = tubeClosed;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2600);
  };

  // Stopwatch
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
    setTubeOpen(false);
    setAddedBuffer(false);
    setAddedDntps(false);
    setAddedPrimers(false);
    setAddedTemplate(false);
    setAddedTaq(false);
    setTubeClosed(false);
    setTubeInCycler(false);
    setCyclerLidOpen(true);
    setCyclerRunning(false);
    setTemperature(25);
    setCurrentCycle(0);
    setPhaseName("Standby");
    setShowCompletion(false);
  };

  // Liquid volume inside tube
  const liquidVolume =
    (addedBuffer ? 1 : 0) +
    (addedDntps ? 1 : 0) +
    (addedPrimers ? 1 : 0) +
    (addedTemplate ? 1 : 0) +
    (addedTaq ? 1 : 0);

  // Drop targets
  const pcrTubeTarget: DropTarget = { id: "pcrTube", x: 260, y: 260, width: 50, height: 80 };
  const cyclerTarget: DropTarget = { id: "cycler", x: 440, y: 190, width: 140, height: 100 };

  const reagentsTargets = [pcrTubeTarget];
  const tubeTargets = [cyclerTarget];

  // Drop logic
  const handleDrop = useCallback(
    (itemId: string, targetId: string | null) => {
      if (!targetId) return;
      if (!timerRunning) setTimerRunning(true);

      // Dropping reagents into PCR tube
      if (targetId === "pcrTube") {
        if (!tubeOpenRef.current) {
          showFeedback("Tap the PCR reaction tube first to open its cap!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }

        if (itemId === "buffer") {
          if (addedBufferRef.current) return;
          setAddedBuffer(true);
          setScore((s) => s + 10);
          setDialogueIndex((i) => Math.max(i, 2));
          showFeedback("10X PCR Buffer added! (Provides optimal pH and MgCl2 cofactor)");
        } else if (itemId === "dntps") {
          if (!addedBufferRef.current) {
            showFeedback("Add PCR Buffer first before nucleotides!");
            setMistakes((m) => m + 1);
            setScore((s) => Math.max(0, s - 2));
            return;
          }
          if (addedDntpsRef.current) return;
          setAddedDntps(true);
          setScore((s) => s + 10);
          setDialogueIndex((i) => Math.max(i, 3));
          showFeedback("dNTPs Master Mix added! (Building blocks for DNA synthesis)");
        } else if (itemId === "primers") {
          if (!addedDntpsRef.current) {
            showFeedback("Add dNTPs before adding primers!");
            setMistakes((m) => m + 1);
            setScore((s) => Math.max(0, s - 2));
            return;
          }
          if (addedPrimersRef.current) return;
          setAddedPrimers(true);
          setScore((s) => s + 10);
          setDialogueIndex((i) => Math.max(i, 4));
          showFeedback("Forward and Reverse Primers added! (Defines target amplification boundaries)");
        } else if (itemId === "template") {
          if (!addedPrimersRef.current) {
            showFeedback("Add primers before adding the template DNA!");
            setMistakes((m) => m + 1);
            setScore((s) => Math.max(0, s - 2));
            return;
          }
          if (addedTemplateRef.current) return;
          setAddedTemplate(true);
          setScore((s) => s + 10);
          setDialogueIndex((i) => Math.max(i, 5));
          showFeedback("Template DNA added!");
        } else if (itemId === "taq") {
          if (!addedTemplateRef.current) {
            showFeedback("Add template DNA before Taq Polymerase!");
            setMistakes((m) => m + 1);
            setScore((s) => Math.max(0, s - 2));
            return;
          }
          if (addedTaqRef.current) return;
          setAddedTaq(true);
          setScore((s) => s + 15);
          setDialogueIndex((i) => Math.max(i, 6));
          showFeedback("Thermostable Taq DNA Polymerase added! Now tap tube to close cap.");
        }
      }

      // Dropping PCR tube into thermal cycler
      if (itemId === "pcrTube" && targetId === "cycler") {
        if (!tubeClosedRef.current) {
          showFeedback("Close the PCR tube cap before placing it into the cycler!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        setTubeInCycler(true);
        setScore((s) => s + 10);
        setDialogueIndex((i) => Math.max(i, 7));
        showFeedback("Tube securely placed in thermal block! Tap lid to close it.");
      }
    },
    [timerRunning]
  );

  // Toggle tube cap
  const handleTubePress = () => {
    if (tubeInCycler) return;
    if (!timerRunning) setTimerRunning(true);
    if (!tubeOpen) {
      setTubeOpen(true);
      setDialogueIndex((i) => Math.max(i, 1));
      showFeedback("PCR tube open. Add PCR Buffer.");
    } else {
      if (liquidVolume >= 5) {
        setTubeClosed(true);
        setTubeOpen(false);
        showFeedback("Tube closed! Now drag it into the Thermal Cycler block.");
      } else {
        showFeedback("Add all reagents before closing the tube!");
      }
    }
  };

  // Toggle cycler lid
  const handleCyclerLidPress = () => {
    if (!tubeInCycler) {
      showFeedback("Load the PCR tube into the cycler first!");
      return;
    }
    setCyclerLidOpen((o) => !o);
    if (cyclerLidOpen) {
      showFeedback("Heated lid closed! Press 'START PCR' below.");
      setDialogueIndex((i) => Math.max(i, 8));
    }
  };

  // Run thermal cycling simulation
  const handleStartPCR = () => {
    if (!tubeInCycler) {
      showFeedback("Place the reaction tube in the cycler first!");
      return;
    }
    if (cyclerLidOpen) {
      showFeedback("Close the cycler heated lid first!");
      return;
    }
    if (cyclerRunning) return;

    setCyclerRunning(true);
    setScore((s) => s + 15);

    // Thermal cycling sequence
    let currentStep = 0;
    const stages = [
      { temp: 95, phase: "Denaturation", cycle: 1 },
      { temp: 55, phase: "Annealing", cycle: 1 },
      { temp: 72, phase: "Extension", cycle: 1 },
      { temp: 95, phase: "Denaturation", cycle: 15 },
      { temp: 55, phase: "Annealing", cycle: 15 },
      { temp: 72, phase: "Extension", cycle: 15 },
      { temp: 95, phase: "Denaturation", cycle: 30 },
      { temp: 55, phase: "Annealing", cycle: 30 },
      { temp: 72, phase: "Final Extension", cycle: 30 },
      { temp: 4, phase: "Complete (Hold)", cycle: 30 },
    ];

    const interval = setInterval(() => {
      if (currentStep < stages.length) {
        const s = stages[currentStep];
        setTemperature(s.temp);
        setPhaseName(s.phase);
        setCurrentCycle(s.cycle);
        currentStep++;
      } else {
        clearInterval(interval);
        setCyclerRunning(false);
        const finalScore = score + 35;
        setScore(finalScore);
        setTimerRunning(false);
        setDialogueIndex(9);
        setShowCompletion(true);
        saveProgress({
          experiment_id: 2,
          completed_sections: ["Aim", "Theory", "Materials", "Procedure", "Precautions", "Virtual Laboratory"],
          lab_score: finalScore,
          lab_time: elapsed,
          mistakes: mistakes,
          is_completed: true,
        });
      }
    }, 700);
  };

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
            onPress={() => router.push({ pathname: "/experiment", params: { id: "2" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 3 L5 9 L11 15" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <Pressable
            style={[pos(650, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "2" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M3 15 l1-4 8-8 3 3-8 8z" fill="#fff" />
              <Path d="M11 3 l3 3 2-2-3-3z" fill="#fff" />
            </Svg>
          </Pressable>
          <Pressable
            style={[pos(698, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "2" } })}
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

          {/* Reagents Tube Rack */}
          <View style={pos(30, 290, 180, 50)}>
            <TubeRack />
          </View>

          {/* Draggable Reagents */}
          <Draggable
            itemId="buffer"
            x={44}
            y={245}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentsTargets}
            onDrop={handleDrop}
            disabled={addedBuffer}
          >
            <ReagentTube label="Buffer" capColor="#10b981" liquidColor="#6ee7b7" used={addedBuffer} />
          </Draggable>

          <Draggable
            itemId="dntps"
            x={74}
            y={245}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentsTargets}
            onDrop={handleDrop}
            disabled={addedDntps}
          >
            <ReagentTube label="dNTPs" capColor="#f59e0b" liquidColor="#fde047" used={addedDntps} />
          </Draggable>

          <Draggable
            itemId="primers"
            x={104}
            y={245}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentsTargets}
            onDrop={handleDrop}
            disabled={addedPrimers}
          >
            <ReagentTube label="Primers" capColor="#ec4899" liquidColor="#f472b6" used={addedPrimers} />
          </Draggable>

          <Draggable
            itemId="template"
            x={134}
            y={245}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentsTargets}
            onDrop={handleDrop}
            disabled={addedTemplate}
          >
            <ReagentTube label="DNA" capColor="#8b5cf6" liquidColor="#c4b5fd" used={addedTemplate} />
          </Draggable>

          <Draggable
            itemId="taq"
            x={164}
            y={245}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentsTargets}
            onDrop={handleDrop}
            disabled={addedTaq}
          >
            <ReagentTube label="Taq" capColor="#ef4444" liquidColor="#fca5a5" used={addedTaq} />
          </Draggable>

          {/* Reaction PCR Tube (Draggable once closed) */}
          <Draggable
            itemId="pcrTube"
            x={265}
            y={265}
            width={36}
            height={60}
            scaleRef={scaleRef}
            dropTargets={tubeTargets}
            onDrop={handleDrop}
            disabled={!tubeClosed || tubeInCycler}
          >
            <Pressable onPress={handleTubePress} style={{ width: 36, height: 60 }}>
              <PcrReactionTube isOpen={tubeOpen} liquidVolume={liquidVolume} inCycler={tubeInCycler} />
            </Pressable>
          </Draggable>

          {/* Micropipette decorative reference */}
          <View style={pos(215, 175, 40, 120)}>
            <Micropipette volume="20µL" hasTip={liquidVolume < 5} />
          </View>

          {/* Thermal Cycler */}
          <Pressable style={pos(460, 175, 200, 170)} onPress={handleCyclerLidPress}>
            <ThermalCycler
              lidOpen={cyclerLidOpen}
              running={cyclerRunning}
              phase={phaseName}
              temp={temperature}
              cycle={currentCycle}
              hasTube={tubeInCycler}
            />
          </Pressable>

          {/* Start PCR Button */}
          {tubeInCycler && !cyclerLidOpen && !cyclerRunning && (
            <Pressable style={[pos(500, 350, 120, 36), styles.pcrRunBtn]} onPress={handleStartPCR}>
              <Text style={styles.pcrRunBtnText}>START PCR ▶</Text>
            </Pressable>
          )}

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
                onPress={() => router.push({ pathname: "/experiment", params: { id: "2" } })}
              >
                <Text style={styles.dockIconText}>📖</Text>
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: "#d8d8d8" }]}
                onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "2" } })}
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

          <FeedbackToast message={feedback} />

          <LabCompletionOverlay
            visible={showCompletion}
            title="PCR Amplification Complete!"
            score={score}
            timeSeconds={elapsed}
            stepsCompleted={8}
            totalSteps={8}
            mistakes={mistakes}
            onTakeQuiz={() => router.push({ pathname: "/experiment", params: { id: "2", section: "Knowledge Check" } })}
            onAskMentor={() => router.push({ pathname: "/experiment", params: { id: "2", section: "Lab Mentor" } })}
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
  pcrRunBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.4)",
    elevation: 4,
  },
  pcrRunBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
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
    backgroundColor: "#ec4899",
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
});
