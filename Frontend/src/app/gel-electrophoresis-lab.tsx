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

// Microfuge Tube for Gel Lab
const GelSampleTube: React.FC<{
  label: string;
  capColor: string;
  used: boolean;
}> = ({ label, capColor, used }) => (
  <Svg width={42} height={66} viewBox="0 0 42 66">
    <Defs>
      <LinearGradient id={`tubeGrad-${label}`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
        <Stop offset="0.5" stopColor="rgba(255,255,255,0.15)" />
        <Stop offset="1" stopColor="rgba(255,255,255,0.3)" />
      </LinearGradient>
    </Defs>
    <Rect x={10} y={4} width={22} height={8} rx={2} fill={capColor} stroke="#0f172a" strokeWidth={1} />
    <Path
      d="M11 12 h20 v32 l-5 14 a5 5 0 0 1 -10 0 l-5 -14 z"
      fill={`url(#tubeGrad-${label})`}
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={1.4}
    />
    {!used && (
      <Path
        d="M13 32 h16 v12 l-4 10 a4 4 0 0 1 -8 0 l-4 -10 z"
        fill="#3b82f6"
        opacity={0.85}
      />
    )}
    <Rect x={8} y={44} width={26} height={12} rx={2} fill="#fff" opacity={0.92} />
    <SvgText x={21} y={53} fontSize={6} fontWeight="800" fill="#0f172a" textAnchor="middle">
      {label}
    </SvgText>
  </Svg>
);

// TAE Running Buffer Flask
const BufferFlask: React.FC<{ used: boolean }> = ({ used }) => (
  <Svg width={64} height={90} viewBox="0 0 64 90">
    <Defs>
      <LinearGradient id="flaskGrad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="rgba(255,255,255,0.35)" />
        <Stop offset="0.5" stopColor="rgba(255,255,255,0.1)" />
        <Stop offset="1" stopColor="rgba(255,255,255,0.25)" />
      </LinearGradient>
    </Defs>
    {/* Neck */}
    <Rect x={24} y={4} width={16} height={26} fill="url(#flaskGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth={1.3} />
    <Rect x={20} y={2} width={24} height={5} rx={2} fill="rgba(255,255,255,0.5)" />
    {/* Conical base */}
    <Path
      d="M24 30 L6 76 a6 6 0 0 0 5 8 h42 a6 6 0 0 0 5 -8 L40 30 Z"
      fill="url(#flaskGrad)"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={1.5}
    />
    {!used && (
      <Path
        d="M17 56 L10 74 a4 4 0 0 0 4 6 h36 a4 4 0 0 0 4 -6 L47 56 Z"
        fill="#67e8f9"
        opacity={0.7}
      />
    )}
    <Rect x={20} y={62} width={24} height={12} rx={2} fill="#ffffff" opacity={0.92} />
    <SvgText x={32} y={71} fontSize={6.5} fontWeight="900" fill="#0e7490" textAnchor="middle">
      1X TAE
    </SvgText>
  </Svg>
);

// Electrophoresis Tank with submerged agarose gel
const ElectrophoresisChamber: React.FC<{
  hasBuffer: boolean;
  well1Loaded: boolean;
  well2Loaded: boolean;
  well3Loaded: boolean;
  lidClosed: boolean;
  running: boolean;
  migrationProgress: number; // 0..100
}> = ({
  hasBuffer,
  well1Loaded,
  well2Loaded,
  well3Loaded,
  lidClosed,
  running,
  migrationProgress,
}) => {
  const dyeY = 22 + (migrationProgress / 100) * 58;

  return (
    <Svg width={240} height={150} viewBox="0 0 240 150">
      <Defs>
        <LinearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgba(255,255,255,0.3)" />
          <Stop offset="0.5" stopColor="rgba(255,255,255,0.08)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0.25)" />
        </LinearGradient>
      </Defs>

      {/* Main Tank Box */}
      <Rect
        x={10}
        y={20}
        width={220}
        height={115}
        rx={6}
        fill="url(#tankGrad)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={2}
      />

      {/* Buffer Liquid */}
      {hasBuffer && (
        <Rect x={12} y={24} width={216} height={109} rx={4} fill="#06b6d4" opacity={0.25} />
      )}

      {/* Cathode wire (Black / Negative - Top) */}
      <Line x1={20} y1={28} x2={220} y2={28} stroke="#0f172a" strokeWidth={2.5} />
      <Circle cx={25} cy={28} r={5} fill="#0f172a" stroke="#fff" strokeWidth={1} />
      <SvgText x={35} y={32} fontSize={8} fontWeight="900" fill="#0f172a">
        (-) CATHODE
      </SvgText>

      {/* Anode wire (Red / Positive + Bottom) */}
      <Line x1={20} y1={126} x2={220} y2={126} stroke="#ef4444" strokeWidth={2.5} />
      <Circle cx={25} cy={126} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1} />
      <SvgText x={35} y={130} fontSize={8} fontWeight="900" fill="#ef4444">
        (+) ANODE
      </SvgText>

      {/* Submerged Agarose Gel Slab */}
      <Rect
        x={40}
        y={40}
        width={160}
        height={76}
        rx={4}
        fill="rgba(224, 242, 254, 0.45)"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={1.5}
      />

      {/* 5 Sample Wells */}
      {[58, 88, 118, 148, 178].map((wx, i) => (
        <G key={i}>
          <Rect x={wx - 7} y={44} width={14} height={8} rx={1} fill="#1e293b" opacity={0.65} />
          {/* Loaded indicator */}
          {i === 0 && well1Loaded && (
            <Rect x={wx - 6} y={45} width={12} height={6} rx={1} fill="#3b82f6" />
          )}
          {i === 1 && well2Loaded && (
            <Rect x={wx - 6} y={45} width={12} height={6} rx={1} fill="#8b5cf6" />
          )}
          {i === 2 && well3Loaded && (
            <Rect x={wx - 6} y={45} width={12} height={6} rx={1} fill="#06b6d4" />
          )}
        </G>
      ))}

      {/* Migrating tracking dye bands */}
      {migrationProgress > 0 && (
        <G>
          {well1Loaded && <Rect x={52} y={44 + dyeY * 0.75} width={12} height={3} rx={1} fill="#2563eb" opacity={0.9} />}
          {well2Loaded && <Rect x={82} y={44 + dyeY * 0.75} width={12} height={3} rx={1} fill="#2563eb" opacity={0.9} />}
          {well3Loaded && <Rect x={112} y={44 + dyeY * 0.75} width={12} height={3} rx={1} fill="#2563eb" opacity={0.9} />}
        </G>
      )}

      {/* Electrolysis Bubbles while running */}
      {running && (
        <G>
          {[45, 85, 125, 165, 205].map((bx, i) => (
            <Circle key={`b1-${i}`} cx={bx} cy={32} r={1.8} fill="#ffffff" opacity={0.8} />
          ))}
          {[45, 85, 125, 165, 205].map((bx, i) => (
            <Circle key={`b2-${i}`} cx={bx} cy={122} r={1.8} fill="#ffffff" opacity={0.8} />
          ))}
        </G>
      )}

      {/* Chamber Safety Lid */}
      {lidClosed ? (
        <G>
          <Rect x={8} y={16} width={224} height={12} rx={3} fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth={1} />
          <Line x1={20} y1={16} x2={10} y2={4} stroke="#0f172a" strokeWidth={2} />
          <Line x1={220} y1={16} x2={230} y2={4} stroke="#ef4444" strokeWidth={2} />
        </G>
      ) : (
        <Rect x={8} y={6} width={224} height={8} rx={2} fill="rgba(255,255,255,0.2)" opacity={0.6} />
      )}
    </Svg>
  );
};

// Power Supply Unit
const PowerSupplyUnit: React.FC<{
  voltage: number;
  powerOn: boolean;
  onTogglePower: () => void;
}> = ({ voltage, powerOn, onTogglePower }) => (
  <Svg width={120} height={100} viewBox="0 0 120 100">
    <Defs>
      <LinearGradient id="psGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#334155" />
        <Stop offset="0.5" stopColor="#1e293b" />
        <Stop offset="1" stopColor="#0f172a" />
      </LinearGradient>
    </Defs>
    {/* Body */}
    <Rect x={4} y={6} width={112} height={88} rx={8} fill="url(#psGrad)" stroke="#475569" strokeWidth={1.8} />
    {/* Brand */}
    <SvgText x={12} y={20} fontSize={6.5} fontWeight="800" fill="#94a3b8">
      ELECTRO-POWER
    </SvgText>
    {/* LED Display */}
    <Rect x={12} y={26} width={96} height={30} rx={4} fill="#020617" stroke="#334155" strokeWidth={1} />
    <SvgText x={60} y={48} fontSize={18} fontWeight="900" fill={powerOn ? "#22c55e" : "#64748b"} textAnchor="middle">
      {powerOn ? `${voltage} V` : "0 V"}
    </SvgText>
    {/* Terminals */}
    <Circle cx={26} cy={76} r={7} fill="#0f172a" stroke="#fff" strokeWidth={1} />
    <SvgText x={26} y={79} fontSize={8} fontWeight="900" fill="#fff" textAnchor="middle">
      -
    </SvgText>
    <Circle cx={48} cy={76} r={7} fill="#ef4444" stroke="#fff" strokeWidth={1} />
    <SvgText x={48} y={79} fontSize={8} fontWeight="900" fill="#fff" textAnchor="middle">
      +
    </SvgText>
    {/* Power Switch */}
    <Rect x={76} y={68} width={28} height={16} rx={4} fill={powerOn ? "#22c55e" : "#ef4444"} />
    <SvgText x={90} y={79} fontSize={7} fontWeight="900" fill="#fff" textAnchor="middle">
      {powerOn ? "ON" : "OFF"}
    </SvgText>
  </Svg>
);

// UV Transilluminator Modal View
const UVTransilluminatorModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => (
  <View style={styles.uvModal}>
    <View style={styles.uvBox}>
      <Svg width={320} height={200} viewBox="0 0 320 200">
        <Defs>
          <RadialGradient id="uvGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#3b0764" />
            <Stop offset="0.7" stopColor="#1e1b4b" />
            <Stop offset="1" stopColor="#0f172a" />
          </RadialGradient>
        </Defs>

        {/* UV Transilluminator Glass Bed */}
        <Rect x={10} y={10} width={300} height={180} rx={8} fill="url(#uvGlow)" stroke="#c084fc" strokeWidth={3} />

        {/* Wells */}
        {[50, 110, 170, 230].map((wx, i) => (
          <Rect key={i} x={wx - 10} y={24} width={20} height={6} rx={1} fill="#475569" opacity={0.8} />
        ))}

        {/* WELL 1: DNA LADDER BANDS */}
        <G>
          <SvgText x={50} y={20} fontSize={7} fontWeight="800" fill="#c084fc" textAnchor="middle">
            LADDER
          </SvgText>
          {/* 1000 bp */}
          <Rect x={42} y={50} width={16} height={3.5} rx={1.5} fill="#4ade80" />
          <SvgText x={36} y={53} fontSize={6} fontWeight="700" fill="#93c5fd" textAnchor="end">
            1000 bp
          </SvgText>
          {/* 750 bp */}
          <Rect x={42} y={80} width={16} height={3.5} rx={1.5} fill="#4ade80" />
          <SvgText x={36} y={83} fontSize={6} fontWeight="700" fill="#93c5fd" textAnchor="end">
            750 bp
          </SvgText>
          {/* 500 bp */}
          <Rect x={42} y={115} width={16} height={4} rx={1.5} fill="#4ade80" />
          <SvgText x={36} y={118} fontSize={6} fontWeight="700" fill="#93c5fd" textAnchor="end">
            500 bp
          </SvgText>
          {/* 250 bp */}
          <Rect x={42} y={155} width={16} height={3.5} rx={1.5} fill="#4ade80" />
          <SvgText x={36} y={158} fontSize={6} fontWeight="700" fill="#93c5fd" textAnchor="end">
            250 bp
          </SvgText>
        </G>

        {/* WELL 2: SAMPLE A (PCR Amplicon - Single 500bp band) */}
        <G>
          <SvgText x={110} y={20} fontSize={7} fontWeight="800" fill="#c084fc" textAnchor="middle">
            SAMPLE A
          </SvgText>
          <Rect x={102} y={115} width={16} height={5} rx={1.5} fill="#22c55e" stroke="#bbf7d0" strokeWidth={0.8} />
          <SvgText x={124} y={118} fontSize={6} fontWeight="800" fill="#86efac">
            500 bp (PCR Product)
          </SvgText>
        </G>

        {/* WELL 3: SAMPLE B (Digested DNA - 750bp and 250bp bands) */}
        <G>
          <SvgText x={170} y={20} fontSize={7} fontWeight="800" fill="#c084fc" textAnchor="middle">
            SAMPLE B
          </SvgText>
          <Rect x={162} y={80} width={16} height={4} rx={1.5} fill="#22c55e" />
          <Rect x={162} y={155} width={16} height={4} rx={1.5} fill="#22c55e" />
          <SvgText x={184} y={83} fontSize={6} fontWeight="800" fill="#86efac">
            750 bp
          </SvgText>
          <SvgText x={184} y={158} fontSize={6} fontWeight="800" fill="#86efac">
            250 bp
          </SvgText>
        </G>

        {/* Polarities */}
        <SvgText x={290} y={35} fontSize={10} fontWeight="900" fill="#64748b">
          (-)
        </SvgText>
        <SvgText x={290} y={175} fontSize={10} fontWeight="900" fill="#ef4444">
          (+)
        </SvgText>
      </Svg>
    </View>

    {/* Band Analysis Legend */}
    <View style={styles.uvLegendBox}>
      <Text style={styles.uvLegendTitle}>⚡ UV Transilluminator Gel Results</Text>
      <Text style={styles.uvLegendDesc}>
        DNA molecules migrated toward the positive (+) anode. Fluorescent dye confirms successful separation:
      </Text>
      <View style={styles.uvRow}>
        <Text style={styles.uvBullet}>•</Text>
        <Text style={styles.uvRowText}>
          <Text style={{ fontWeight: "800", color: "#22c55e" }}>Well 1 (Ladder): </Text>
          Reference standard with bands at 1000, 750, 500, and 250 bp.
        </Text>
      </View>
      <View style={styles.uvRow}>
        <Text style={styles.uvBullet}>•</Text>
        <Text style={styles.uvRowText}>
          <Text style={{ fontWeight: "800", color: "#22c55e" }}>Well 2 (Sample A): </Text>
          Clean amplicon at 500 bp (matches expected PCR target).
        </Text>
      </View>
      <View style={styles.uvRow}>
        <Text style={styles.uvBullet}>•</Text>
        <Text style={styles.uvRowText}>
          <Text style={{ fontWeight: "800", color: "#22c55e" }}>Well 3 (Sample B): </Text>
          Two restriction digestion fragments (750 bp and 250 bp).
        </Text>
      </View>
      <Pressable style={styles.closeUvBtn} onPress={onClose}>
        <Text style={styles.closeUvBtnText}>Finish & Record Results</Text>
      </Pressable>
    </View>
  </View>
);

/* ------------------------------------------------------------------ */
/*  Dialogue Steps                                                     */
/* ------------------------------------------------------------------ */
const DIALOGUE_STEPS = [
  "Welcome to Gel Electrophoresis! Separate DNA fragments by molecular size.",
  "Step 1: Drag the 1X TAE Running Buffer flask to flood the electrophoresis tank.",
  "Step 2: Drag the DNA Ladder tube to load the standard marker into Well 1.",
  "Step 3: Drag Sample A tube (PCR Product) to load into Well 2.",
  "Step 4: Drag Sample B tube (Digested DNA) to load into Well 3.",
  "Step 5: Tap the safety lid to close the electrophoresis chamber.",
  "Step 6: Tap the Power Supply switch to apply 100 Volts and begin DNA migration!",
  "DNA migration in progress! Negatively charged fragments run toward positive anode.",
  "Electrophoresis complete! Tap the chamber to transfer gel to UV Transilluminator.",
];

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function GelElectrophoresisLabScreen() {
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
  const [showUvModal, setShowUvModal] = useState(false);

  // Experiment state
  const [hasBuffer, setHasBuffer] = useState(false);
  const [well1Loaded, setWell1Loaded] = useState(false);
  const [well2Loaded, setWell2Loaded] = useState(false);
  const [well3Loaded, setWell3Loaded] = useState(false);
  const [lidClosed, setLidClosed] = useState(false);
  const [powerOn, setPowerOn] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const hasBufferRef = useRef(hasBuffer);
  hasBufferRef.current = hasBuffer;
  const well1Ref = useRef(well1Loaded);
  well1Ref.current = well1Loaded;
  const well2Ref = useRef(well2Loaded);
  well2Ref.current = well2Loaded;
  const well3Ref = useRef(well3Loaded);
  well3Ref.current = well3Loaded;
  const lidClosedRef = useRef(lidClosed);
  lidClosedRef.current = lidClosed;

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
    setHasBuffer(false);
    setWell1Loaded(false);
    setWell2Loaded(false);
    setWell3Loaded(false);
    setLidClosed(false);
    setPowerOn(false);
    setMigrationProgress(0);
    setShowUvModal(false);
    setShowCompletion(false);
  };

  // Drop targets
  const chamberTarget: DropTarget = { id: "chamber", x: 250, y: 190, width: 240, height: 150 };
  const reagentTargets = [chamberTarget];

  // Drop logic
  const handleDrop = useCallback(
    (itemId: string, targetId: string | null) => {
      if (!targetId) return;
      if (!timerRunning) setTimerRunning(true);

      if (itemId === "buffer" && targetId === "chamber") {
        if (hasBufferRef.current) return;
        setHasBuffer(true);
        setScore((s) => s + 10);
        setDialogueIndex(1);
        showFeedback("1X TAE buffer flooded over gel! Ions will conduct electrical current.");
        return;
      }

      if (itemId === "ladder" && targetId === "chamber") {
        if (!hasBufferRef.current) {
          showFeedback("Pour running buffer into tank before loading samples!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (well1Ref.current) return;
        setWell1Loaded(true);
        setScore((s) => s + 10);
        setDialogueIndex(2);
        showFeedback("DNA Ladder (100–1000 bp) loaded into Well 1!");
        return;
      }

      if (itemId === "sampleA" && targetId === "chamber") {
        if (!well1Ref.current) {
          showFeedback("Load DNA Ladder into Well 1 first!");
          setMistakes((m) => m + 1);
          return;
        }
        if (well2Ref.current) return;
        setWell2Loaded(true);
        setScore((s) => s + 10);
        setDialogueIndex(3);
        showFeedback("Sample A (PCR Product) loaded into Well 2!");
        return;
      }

      if (itemId === "sampleB" && targetId === "chamber") {
        if (!well2Ref.current) {
          showFeedback("Load Sample A before Sample B!");
          setMistakes((m) => m + 1);
          return;
        }
        if (well3Ref.current) return;
        setWell3Loaded(true);
        setScore((s) => s + 10);
        setDialogueIndex(4);
        showFeedback("Sample B (Digested DNA) loaded into Well 3! Now tap lid to close chamber.");
        return;
      }
    },
    [timerRunning]
  );

  // Toggle Lid
  const handleLidToggle = () => {
    if (!well3Loaded) {
      showFeedback("Load all samples before closing the chamber!");
      return;
    }
    setLidClosed((c) => !c);
    if (!lidClosed) {
      setDialogueIndex(5);
      showFeedback("Chamber closed and electrodes connected! Switch on Power Supply.");
    }
  };

  // Toggle Power Supply
  const handlePowerToggle = () => {
    if (!lidClosed) {
      showFeedback("Close the chamber safety lid before turning on the power supply!");
      return;
    }
    if (powerOn) return;

    setPowerOn(true);
    setScore((s) => s + 15);
    setDialogueIndex(6);
    showFeedback("100 Volts applied! Bubbles visible at electrodes. DNA fragments migrating to red anode.");

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setMigrationProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setPowerOn(false);
        setDialogueIndex(7);
        const finalScore = score + 35;
        setScore(finalScore);
        setTimerRunning(false);
        setShowUvModal(true);
        saveProgress({
          experiment_id: 4,
          completed_sections: ["Aim", "Theory", "Materials", "Procedure", "Precautions", "Virtual Laboratory"],
          lab_score: finalScore,
          lab_time: elapsed,
          mistakes: mistakes,
          is_completed: true,
        });
      }
    }, 600);
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
            onPress={() => router.push({ pathname: "/experiment", params: { id: "4" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 3 L5 9 L11 15" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <Pressable
            style={[pos(650, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "4" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M3 15 l1-4 8-8 3 3-8 8z" fill="#fff" />
              <Path d="M11 3 l3 3 2-2-3-3z" fill="#fff" />
            </Svg>
          </Pressable>
          <Pressable
            style={[pos(698, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "4" } })}
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

          {/* Draggable Buffer Flask */}
          <Draggable
            itemId="buffer"
            x={30}
            y={240}
            width={64}
            height={90}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={hasBuffer}
          >
            <BufferFlask used={hasBuffer} />
          </Draggable>

          {/* Draggable Reagent Tubes */}
          <Draggable
            itemId="ladder"
            x={105}
            y={260}
            width={42}
            height={66}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={well1Loaded}
          >
            <GelSampleTube label="Ladder" capColor="#ef4444" used={well1Loaded} />
          </Draggable>

          <Draggable
            itemId="sampleA"
            x={150}
            y={260}
            width={42}
            height={66}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={well2Loaded}
          >
            <GelSampleTube label="Smpl A" capColor="#8b5cf6" used={well2Loaded} />
          </Draggable>

          <Draggable
            itemId="sampleB"
            x={195}
            y={260}
            width={42}
            height={66}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={well3Loaded}
          >
            <GelSampleTube label="Smpl B" capColor="#06b6d4" used={well3Loaded} />
          </Draggable>

          {/* Electrophoresis Tank */}
          <Pressable style={pos(260, 200, 240, 150)} onPress={handleLidToggle}>
            <ElectrophoresisChamber
              hasBuffer={hasBuffer}
              well1Loaded={well1Loaded}
              well2Loaded={well2Loaded}
              well3Loaded={well3Loaded}
              lidClosed={lidClosed}
              running={powerOn}
              migrationProgress={migrationProgress}
            />
          </Pressable>

          {/* Power Supply */}
          <Pressable style={pos(530, 215, 120, 100)} onPress={handlePowerToggle}>
            <PowerSupplyUnit voltage={100} powerOn={powerOn} onTogglePower={handlePowerToggle} />
          </Pressable>

          {/* View Gel UV button if run complete */}
          {migrationProgress >= 100 && (
            <Pressable style={[pos(530, 325, 120, 36), styles.uvBtn]} onPress={() => setShowUvModal(true)}>
              <Text style={styles.uvBtnText}>VIEW UV GEL ✦</Text>
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
                onPress={() => router.push({ pathname: "/experiment", params: { id: "4" } })}
              >
                <Text style={styles.dockIconText}>📖</Text>
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: "#d8d8d8" }]}
                onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "4" } })}
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

          {/* UV Transilluminator Modal */}
          {showUvModal && (
            <UVTransilluminatorModal
              onClose={() => {
                setShowUvModal(false);
                setShowCompletion(true);
              }}
            />
          )}

          {/* Completion Overlay */}
          <LabCompletionOverlay
            visible={showCompletion}
            title="Electrophoresis Complete!"
            score={score}
            timeSeconds={elapsed}
            stepsCompleted={7}
            totalSteps={7}
            mistakes={mistakes}
            onTakeQuiz={() => router.push({ pathname: "/experiment", params: { id: "4", section: "Knowledge Check" } })}
            onAskMentor={() => router.push({ pathname: "/experiment", params: { id: "4", section: "Lab Mentor" } })}
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
  uvBtn: {
    backgroundColor: "#9333ea",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    boxShadow: "0px 2px 6px rgba(147, 51, 234, 0.5)",
    elevation: 4,
  },
  uvBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
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
    backgroundColor: "#3b82f6",
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
  uvModal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 7, 18, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
    zIndex: 900,
  },
  uvBox: {
    boxShadow: "0px 0px 20px rgba(168, 85, 247, 0.6)",
  },
  uvLegendBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    maxWidth: 350,
    gap: 10,
  },
  uvLegendTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  uvLegendDesc: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 15,
  },
  uvRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  uvBullet: {
    fontSize: 14,
    color: "#9333ea",
  },
  uvRowText: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    lineHeight: 15,
  },
  closeUvBtn: {
    backgroundColor: "#8E70E9",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  closeUvBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
});
