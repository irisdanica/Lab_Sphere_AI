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

// Microplate (96-well layout with magnified active test strip)
const Microplate96: React.FC<{
  stage: "empty" | "coated" | "blocked" | "primary" | "secondary" | "tmb" | "stopped";
}> = ({ stage }) => {
  // Determine well colors based on stage
  let wellColors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff"];
  if (stage === "coated") {
    wellColors = ["#e0f2fe", "#e0f2fe", "#e0f2fe", "#e0f2fe"];
  } else if (stage === "blocked") {
    wellColors = ["#f1f5f9", "#f1f5f9", "#f1f5f9", "#f1f5f9"];
  } else if (stage === "primary") {
    wellColors = ["#f8fafc", "#f0fdf4", "#dcfce7", "#dcfce7"];
  } else if (stage === "secondary") {
    wellColors = ["#f8fafc", "#f0fdf4", "#bbf7d0", "#bbf7d0"];
  } else if (stage === "tmb") {
    // Blue chromogenic reaction
    wellColors = ["#f8fafc", "#e0f2fe", "#1d4ed8", "#2563eb"];
  } else if (stage === "stopped") {
    // Yellow stopped reaction
    wellColors = ["#fefce8", "#fef08a", "#eab308", "#facc15"];
  }

  return (
    <Svg width={250} height={150} viewBox="0 0 250 150">
      <Defs>
        <LinearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.5" stopColor="#f1f5f9" />
          <Stop offset="1" stopColor="#cbd5e1" />
        </LinearGradient>
      </Defs>

      {/* Main 96-well Polystyrene Plate Chassis */}
      <Rect
        x={6}
        y={6}
        width={238}
        height={138}
        rx={8}
        fill="url(#plateGrad)"
        stroke="#94a3b8"
        strokeWidth={2}
      />
      <Rect x={10} y={10} width={230} height={130} rx={6} fill="none" stroke="#e2e8f0" strokeWidth={1} />

      {/* Plate Branding & Column Labels */}
      <SvgText x={14} y={22} fontSize={6.5} fontWeight="900" fill="#64748b">
        96-WELL IMMUNO-PLATE
      </SvgText>

      {/* Background 96-well matrix grid */}
      {[...Array(6)].map((_, row) =>
        [...Array(10)].map((_, col) => {
          const cx = 35 + col * 20;
          const cy = 34 + row * 18;
          return (
            <Circle
              key={`bg-${row}-${col}`}
              cx={cx}
              cy={cy}
              r={6.5}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth={0.8}
            />
          );
        })
      )}

      {/* Active Testing Strip Highlight (Column 1: Wells A1, B1, C1, D1) */}
      <Rect x={24} y={26} width={22} height={80} rx={4} fill="rgba(56, 189, 248, 0.2)" stroke="#0284c7" strokeWidth={1.5} />

      {/* 4 Active Testing Wells */}
      {[
        { cy: 34, label: "BLK", name: "Blank" },
        { cy: 52, label: "NEG", name: "Neg Ctrl" },
        { cy: 70, label: "POS", name: "Pos Ctrl" },
        { cy: 88, label: "SMP", name: "Patient" },
      ].map((w, idx) => (
        <G key={`active-${idx}`}>
          <Circle
            cx={35}
            cy={w.cy}
            r={7.5}
            fill={wellColors[idx]}
            stroke="#0284c7"
            strokeWidth={1.2}
          />
          <SvgText x={50} y={w.cy + 3} fontSize={6} fontWeight="800" fill="#0f172a">
            {w.name}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
};

// Reagent Vial for ELISA
const ElisaVial: React.FC<{
  label: string;
  capColor: string;
  liquidColor: string;
  used?: boolean;
}> = ({ label, capColor, liquidColor, used }) => (
  <Svg width={44} height={70} viewBox="0 0 44 70">
    <Defs>
      <LinearGradient id={`elisaVial-${label}`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
        <Stop offset="0.5" stopColor="rgba(255,255,255,0.15)" />
        <Stop offset="1" stopColor="rgba(255,255,255,0.3)" />
      </LinearGradient>
    </Defs>
    <Rect x={12} y={2} width={20} height={10} rx={2} fill={capColor} stroke="#0f172a" strokeWidth={1} />
    <Path
      d="M10 12 h24 v44 a5 5 0 0 1 -5 5 h-14 a5 5 0 0 1 -5 -5 z"
      fill={`url(#elisaVial-${label})`}
      stroke="rgba(255,255,255,0.6)"
      strokeWidth={1.3}
    />
    {!used && (
      <Path
        d="M11 34 h22 v22 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 z"
        fill={liquidColor}
        opacity={0.88}
      />
    )}
    <Rect x={8} y={38} width={28} height={14} rx={2} fill="#fff" opacity={0.94} />
    <SvgText x={22} y={48} fontSize={5.5} fontWeight="900" fill="#0f172a" textAnchor="middle">
      {label}
    </SvgText>
  </Svg>
);

// Wash Buffer Bottle
const WashBottle: React.FC = () => (
  <Svg width={48} height={86} viewBox="0 0 48 86">
    <Path d="M22 6 Q 16 -4 10 4 L 4 12" fill="none" stroke="#e0f2fe" strokeWidth={3} strokeLinecap="round" />
    <Rect x={16} y={6} width={16} height={10} rx={2} fill="#0284c7" stroke="#0369a1" strokeWidth={1} />
    <Rect x={8} y={16} width={32} height={66} rx={6} fill="rgba(224, 242, 254, 0.4)" stroke="#bae6fd" strokeWidth={1.4} />
    <Rect x={10} y={36} width={28} height={44} rx={4} fill="#38bdf8" opacity={0.5} />
    <SvgText x={24} y={54} fontSize={6.5} fontWeight="800" fill="#0369a1" textAnchor="middle">
      PBST
    </SvgText>
  </Svg>
);

// Microplate Spectrophotometer Reader
const MicroplateReaderUnit: React.FC<{
  hasPlate: boolean;
  onOpenResults: () => void;
}> = ({ hasPlate, onOpenResults }) => (
  <Pressable style={pos(475, 185, 180, 140)} onPress={onOpenResults}>
    <Svg width={180} height={140} viewBox="0 0 180 140">
      <Defs>
        <LinearGradient id="readerGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#334155" />
          <Stop offset="0.5" stopColor="#1e293b" />
          <Stop offset="1" stopColor="#0f172a" />
        </LinearGradient>
      </Defs>

      {/* Instrument Chassis */}
      <Rect x={10} y={10} width={160} height={120} rx={8} fill="url(#readerGrad)" stroke="#64748b" strokeWidth={2} />
      <SvgText x={20} y={28} fontSize={7.5} fontWeight="800" fill="#93c5fd">
        SPECTRA-MAX 450
      </SvgText>

      {/* Plate Loading Tray Drawer */}
      <Rect x={24} y={36} width={132} height={45} rx={4} fill="#020617" stroke="#334155" strokeWidth={1.5} />
      {hasPlate ? (
        <G>
          <Rect x={30} y={40} width={120} height={36} rx={3} fill="#f8fafc" stroke="#38bdf8" strokeWidth={1.5} />
          <Circle cx={45} cy={58} r={5} fill="#fef08a" />
          <Circle cx={65} cy={58} r={5} fill="#eab308" />
          <Circle cx={85} cy={58} r={5} fill="#facc15" />
          <SvgText x={110} y={62} fontSize={7} fontWeight="900" fill="#0284c7">
            OD 450nm
          </SvgText>
        </G>
      ) : (
        <SvgText x={90} y={62} fontSize={7} fontWeight="700" fill="#475569" textAnchor="middle">
          INSERT MICROPLATE
        </SvgText>
      )}

      {/* Digital Readout */}
      <Rect x={24} y={90} width={132} height={28} rx={4} fill="#0f172a" stroke="#0284c7" strokeWidth={1} />
      <SvgText x={32} y={108} fontSize={10} fontWeight="900" fill={hasPlate ? "#4ade80" : "#94a3b8"}>
        {hasPlate ? "READING READY ▶" : "STANDBY"}
      </SvgText>
    </Svg>
  </Pressable>
);

// Spectrophotometer Optical Density Analysis Modal
const MicroplateReaderModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => (
  <View style={styles.readerModal}>
    <View style={styles.readerCard}>
      <Text style={styles.readerTitle}>📊 ELISA Microplate Reader (OD 450 nm)</Text>
      <Text style={styles.readerSubtitle}>
        Spectrophotometric measurement of yellow chromogenic product at 450 nm:
      </Text>

      {/* Data Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 1.4 }]}>Well / Sample</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>OD 450nm</Text>
          <Text style={[styles.colHeader, { flex: 1.2 }]}>Interpretation</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.cell, { flex: 1.4 }]}>A1: Blank</Text>
          <Text style={[styles.cell, { flex: 1 }]}>0.04 OD</Text>
          <Text style={[styles.cell, { flex: 1.2, color: "#64748b" }]}>Baseline</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.cell, { flex: 1.4 }]}>B1: Negative Control</Text>
          <Text style={[styles.cell, { flex: 1 }]}>0.08 OD</Text>
          <Text style={[styles.cell, { flex: 1.2, color: "#16a34a", fontWeight: "700" }]}>Negative</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.cell, { flex: 1.4 }]}>C1: Positive Control</Text>
          <Text style={[styles.cell, { flex: 1 }]}>1.84 OD</Text>
          <Text style={[styles.cell, { flex: 1.2, color: "#b45309", fontWeight: "700" }]}>Strong Positive</Text>
        </View>

        <View style={[styles.tableRow, { backgroundColor: "#fef9c3" }]}>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: "800" }]}>D1: Patient Sample</Text>
          <Text style={[styles.cell, { flex: 1, fontWeight: "800" }]}>1.42 OD</Text>
          <Text style={[styles.cell, { flex: 1.2, color: "#b45309", fontWeight: "800" }]}>POSITIVE</Text>
        </View>
      </View>

      {/* Clinical Diagnosis Callout */}
      <View style={styles.diagnosisBox}>
        <Text style={styles.diagTitle}>Clinical Interpretation:</Text>
        <Text style={styles.diagText}>
          Patient OD (1.42) substantially exceeds the diagnostic cutoff (OD &gt; 0.25). The patient tests <Text style={{ fontWeight: "800", color: "#b45309" }}>POSITIVE</Text> for target antibodies, confirming specific immune recognition.
        </Text>
      </View>

      <Pressable style={styles.closeReaderBtn} onPress={onClose}>
        <Text style={styles.closeReaderBtnText}>Confirm Diagnosis & Record Results</Text>
      </Pressable>
    </View>
  </View>
);

/* ------------------------------------------------------------------ */
/*  Dialogue Steps                                                     */
/* ------------------------------------------------------------------ */
const DIALOGUE_STEPS = [
  "Welcome to the ELISA Virtual Lab! Detect specific antibodies in patient serum.",
  "Step 1: Drag the Antigen solution to coat the microplate wells.",
  "Step 2: Drag the 1% BSA Blocking Buffer to coat remaining plastic surface.",
  "Step 3: Drag the Wash Bottle (PBST) to wash unbound proteins.",
  "Step 4: Drag the Patient Serum / Primary Antibody to bind target antigen.",
  "Step 5: Drag the Wash Bottle to remove unbound antibodies.",
  "Step 6: Drag the HRP-conjugated Secondary Antibody into the wells.",
  "Step 7: Drag the Wash Bottle for the crucial post-secondary wash.",
  "Step 8: Drag the TMB Substrate; watch HRP catalyze the blue color change!",
  "Step 9: Drag the Stop Solution (1M H2SO4) to halt the reaction (turns yellow).",
  "Step 10: Tap the Spectrophotometer Reader to measure OD 450nm and make diagnosis!",
];

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function ElisaLabScreen() {
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
  const [showReaderModal, setShowReaderModal] = useState(false);

  // Experiment stage
  const [plateStage, setPlateStage] = useState<
    "empty" | "coated" | "blocked" | "primary" | "secondary" | "tmb" | "stopped"
  >("empty");
  const [washStep, setWashStep] = useState(0);

  const stageRef = useRef(plateStage);
  stageRef.current = plateStage;
  const washRef = useRef(washStep);
  washRef.current = washStep;

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
    setPlateStage("empty");
    setWashStep(0);
    setShowReaderModal(false);
    setShowCompletion(false);
  };

  // Drop targets
  const plateTarget: DropTarget = { id: "plate", x: 230, y: 195, width: 250, height: 150 };
  const reagentTargets = [plateTarget];

  // Drop logic
  const handleDrop = useCallback(
    (itemId: string, targetId: string | null) => {
      if (!targetId) return;
      if (!timerRunning) setTimerRunning(true);

      if (itemId === "antigen" && targetId === "plate") {
        if (stageRef.current !== "empty") return;
        setPlateStage("coated");
        setScore((s) => s + 10);
        setDialogueIndex(1);
        showFeedback("Antigen coated on polystyrene well surfaces! Now add Blocking Buffer.");
        return;
      }

      if (itemId === "blocking" && targetId === "plate") {
        if (stageRef.current !== "coated") {
          showFeedback("Coat wells with antigen first before blocking!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        setPlateStage("blocked");
        setScore((s) => s + 10);
        setDialogueIndex(2);
        showFeedback("BSA Blocking Buffer applied! Non-specific sites blocked. Wash with PBST.");
        return;
      }

      if (itemId === "wash" && targetId === "plate") {
        if (stageRef.current === "blocked" && washRef.current === 0) {
          setWashStep(1);
          setScore((s) => s + 5);
          setDialogueIndex(3);
          showFeedback("Wash 1 complete! Free BSA removed. Add Patient Serum / Primary Antibody.");
          return;
        }
        if (stageRef.current === "primary" && washRef.current === 1) {
          setWashStep(2);
          setScore((s) => s + 5);
          setDialogueIndex(5);
          showFeedback("Wash 2 complete! Unbound primary antibodies removed. Add HRP-conjugated secondary antibody.");
          return;
        }
        if (stageRef.current === "secondary" && washRef.current === 2) {
          setWashStep(3);
          setScore((s) => s + 5);
          setDialogueIndex(7);
          showFeedback("Wash 3 complete! Excess HRP cleared. Add TMB Substrate.");
          return;
        }
      }

      if (itemId === "primary" && targetId === "plate") {
        if (washRef.current < 1) {
          showFeedback("Wash blocking buffer away before adding serum!");
          setMistakes((m) => m + 1);
          return;
        }
        if (stageRef.current === "primary") return;
        setPlateStage("primary");
        setScore((s) => s + 10);
        setDialogueIndex(4);
        showFeedback("Patient serum added! Specific antibodies bind target antigen. Wash wells.");
        return;
      }

      if (itemId === "secondary" && targetId === "plate") {
        if (washRef.current < 2) {
          showFeedback("Wash unbound primary antibodies before adding secondary antibody!");
          setMistakes((m) => m + 1);
          return;
        }
        if (stageRef.current === "secondary") return;
        setPlateStage("secondary");
        setScore((s) => s + 15);
        setDialogueIndex(6);
        showFeedback("Enzyme-conjugated secondary antibody (anti-IgG-HRP) bound! Wash thoroughly.");
        return;
      }

      if (itemId === "tmb" && targetId === "plate") {
        if (washRef.current < 3) {
          showFeedback("Crucial: Wash out residual secondary antibody before adding substrate!");
          setMistakes((m) => m + 1);
          setScore((s) => Math.max(0, s - 2));
          return;
        }
        if (stageRef.current === "tmb") return;
        setPlateStage("tmb");
        setScore((s) => s + 15);
        setDialogueIndex(8);
        showFeedback("TMB Substrate added! HRP catalyzes blue color reaction in positive wells! Add Stop Solution.");
        return;
      }

      if (itemId === "stop" && targetId === "plate") {
        if (stageRef.current !== "tmb") {
          showFeedback("Add TMB substrate before adding stop solution!");
          setMistakes((m) => m + 1);
          return;
        }
        setPlateStage("stopped");
        setScore((s) => s + 15);
        setDialogueIndex(9);
        showFeedback("1M H2SO4 added! Color shifted to canary yellow. Tap reader for OD values!");
        return;
      }
    },
    [timerRunning]
  );

  const handleOpenReader = () => {
    if (plateStage !== "stopped") {
      showFeedback("Complete all assay steps and add stop solution before taking OD readings!");
      return;
    }
    const finalScore = score + 20;
    setScore(finalScore);
    setTimerRunning(false);
    setShowReaderModal(true);
    saveProgress({
      experiment_id: 5,
      completed_sections: ["Aim", "Theory", "Materials", "Procedure", "Precautions", "Virtual Laboratory"],
      lab_score: finalScore,
      lab_time: elapsed,
      mistakes: mistakes,
      is_completed: true,
    });
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
            onPress={() => router.push({ pathname: "/experiment", params: { id: "5" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 3 L5 9 L11 15" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>

          <Pressable
            style={[pos(650, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "5" } })}
          >
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M3 15 l1-4 8-8 3 3-8 8z" fill="#fff" />
              <Path d="M11 3 l3 3 2-2-3-3z" fill="#fff" />
            </Svg>
          </Pressable>
          <Pressable
            style={[pos(698, 8, 40, 40), styles.iconBtn]}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "5" } })}
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

          {/* Reagents Shelf */}
          {/* Antigen */}
          <Draggable
            itemId="antigen"
            x={30}
            y={200}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage !== "empty"}
          >
            <ElisaVial label="Antigen" capColor="#ef4444" liquidColor="#fca5a5" used={plateStage !== "empty"} />
          </Draggable>

          {/* BSA Blocking Buffer */}
          <Draggable
            itemId="blocking"
            x={78}
            y={200}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage === "blocked" || plateStage === "primary" || plateStage === "secondary" || plateStage === "tmb" || plateStage === "stopped"}
          >
            <ElisaVial label="BSA Blk" capColor="#3b82f6" liquidColor="#bfdbfe" used={plateStage !== "empty" && plateStage !== "coated"} />
          </Draggable>

          {/* Primary Antibody / Patient Serum */}
          <Draggable
            itemId="primary"
            x={126}
            y={200}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage === "primary" || plateStage === "secondary" || plateStage === "tmb" || plateStage === "stopped"}
          >
            <ElisaVial label="Patient" capColor="#8b5cf6" liquidColor="#ddd6fe" used={plateStage === "primary" || plateStage === "secondary" || plateStage === "tmb" || plateStage === "stopped"} />
          </Draggable>

          {/* Secondary Antibody (HRP) */}
          <Draggable
            itemId="secondary"
            x={30}
            y={280}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage === "secondary" || plateStage === "tmb" || plateStage === "stopped"}
          >
            <ElisaVial label="HRP-Ab" capColor="#10b981" liquidColor="#a7f3d0" used={plateStage === "secondary" || plateStage === "tmb" || plateStage === "stopped"} />
          </Draggable>

          {/* TMB Substrate */}
          <Draggable
            itemId="tmb"
            x={78}
            y={280}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage === "tmb" || plateStage === "stopped"}
          >
            <ElisaVial label="TMB" capColor="#0284c7" liquidColor="#93c5fd" used={plateStage === "tmb" || plateStage === "stopped"} />
          </Draggable>

          {/* Stop Solution */}
          <Draggable
            itemId="stop"
            x={126}
            y={280}
            width={44}
            height={70}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
            disabled={plateStage === "stopped"}
          >
            <ElisaVial label="H2SO4" capColor="#f59e0b" liquidColor="#fef08a" used={plateStage === "stopped"} />
          </Draggable>

          {/* Wash Bottle */}
          <Draggable
            itemId="wash"
            x={176}
            y={240}
            width={48}
            height={86}
            scaleRef={scaleRef}
            dropTargets={reagentTargets}
            onDrop={handleDrop}
          >
            <WashBottle />
          </Draggable>

          {/* Microplate on Bench */}
          <View style={pos(235, 205, 250, 150)}>
            <Microplate96 stage={plateStage} />
          </View>

          {/* Spectrophotometer Reader */}
          <MicroplateReaderUnit hasPlate={plateStage === "stopped"} onOpenResults={handleOpenReader} />

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
                onPress={() => router.push({ pathname: "/experiment", params: { id: "5" } })}
              >
                <Text style={styles.dockIconText}>📖</Text>
              </Pressable>
              <Pressable
                style={[styles.dockTile, { borderColor: "#d8d8d8" }]}
                onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: "5" } })}
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

          {/* Reader Analysis Modal */}
          {showReaderModal && (
            <MicroplateReaderModal
              onClose={() => {
                setShowReaderModal(false);
                setShowCompletion(true);
              }}
            />
          )}

          {/* Completion Overlay */}
          <LabCompletionOverlay
            visible={showCompletion}
            title="ELISA Immunoassay Complete!"
            score={score}
            timeSeconds={elapsed}
            stepsCompleted={9}
            totalSteps={9}
            mistakes={mistakes}
            onTakeQuiz={() => router.push({ pathname: "/experiment", params: { id: "5", section: "Knowledge Check" } })}
            onAskMentor={() => router.push({ pathname: "/experiment", params: { id: "5", section: "Lab Mentor" } })}
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
    backgroundColor: "#2563eb",
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
  readerModal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 7, 18, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 900,
  },
  readerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 24,
    width: "100%",
    maxWidth: 440,
    gap: 12,
  },
  readerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  readerSubtitle: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  colHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cell: {
    fontSize: 11,
    color: "#1e293b",
  },
  diagnosisBox: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fef08a",
    borderRadius: 12,
    padding: 12,
  },
  diagTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#854d0e",
    marginBottom: 4,
  },
  diagText: {
    fontSize: 11,
    color: "#713f12",
    lineHeight: 16,
  },
  closeReaderBtn: {
    backgroundColor: "#8E70E9",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  closeReaderBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
});
