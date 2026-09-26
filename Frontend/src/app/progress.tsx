import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Experiment,
  FALLBACK_EXPERIMENTS,
  getAllProgress,
  getQuizResults,
  ProgressData,
  ProgressOverview,
  QuizResult,
} from "@/services/api";
import { useAuth } from "@/context/auth";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F8F6FB",
  white: "#FFFFFF",
  ink: "#25233D",
  muted: "#77738D",
  line: "#EAE5F2",
  lavender: "#8E70E9",
  lavenderSoft: "#EEE8FF",
  purpleText: "#6E51C7",
  pink: "#F28CC8",
  pinkSoft: "#FCE7F4",
  peach: "#F7B56B",
  peachSoft: "#FFF0DE",
  blueSoft: "#E5F2FF",
  blueText: "#2C73D2",
  green: "#55B78A",
  greenSoft: "#E6F6EE",
  greenText: "#1F7A52",
};

const LAB_ROUTES: Record<number, string> = {
  1: "/dna-lab-game",
  2: "/pcr-lab",
  3: "/gram-staining-lab",
  4: "/gel-electrophoresis-lab",
  5: "/elisa-lab",
};

const COMPETENCIES = [
  {
    title: "Nucleic Acid Isolation",
    desc: "Cell lysis, membrane dissolution, and ethanol precipitation",
    expId: 1,
    icon: "🧬",
  },
  {
    title: "Thermal Cycling Kinetics",
    desc: "Denaturation (95°C), annealing (55°C), and Taq extension (72°C)",
    expId: 2,
    icon: "⚡",
  },
  {
    title: "Differential Staining",
    desc: "Crystal violet retention vs peptidoglycan alcohol decolorization",
    expId: 3,
    icon: "🔬",
  },
  {
    title: "Agarose Matrix Separation",
    desc: "Electrophoretic mobility based on DNA charge-to-mass ratio",
    expId: 4,
    icon: "🧪",
  },
  {
    title: "Enzyme Immunoassay Binding",
    desc: "Antigen coating, blocking, and chromogenic HRP substrate catalysis",
    expId: 5,
    icon: "🧫",
  },
];

export default function ProgressScreen() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prog, quizList] = await Promise.all([
        getAllProgress(),
        getQuizResults(),
      ]);
      setOverview(prog);
      setQuizzes(quizList);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForExp = (expId: number): ProgressData | undefined => {
    return overview?.progress.find((p) => p.experiment_id === expId);
  };

  const getBestQuizForExp = (expId: number): QuizResult | undefined => {
    const list = quizzes.filter((q) => q.experiment_id === expId);
    if (!list.length) return undefined;
    return list.reduce((best, curr) =>
      curr.percentage > best.percentage ? curr : best
    );
  };

  // Calculations
  const totalCompletedLabs =
    overview?.progress.filter(
      (p) => p.is_completed || p.completed_sections.length >= 7
    ).length || 0;

  const totalTimeSeconds =
    overview?.progress.reduce((acc, curr) => acc + (curr.lab_time || 0), 0) || 0;
  const totalTimeMins = Math.round(totalTimeSeconds / 60);

  const avgQuizScore = quizzes.length
    ? Math.round(
        quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length
      )
    : 0;

  const avgLabScore = overview?.summary.average_lab_score || 0;
  const overallPct = Math.round(
    ((totalCompletedLabs / 5) * 50) + ((avgQuizScore / 100) * 50)
  );

  return (
    <View style={styles.page}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/" as any)}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Dashboard</Text>
          </Pressable>
          <View>
            <Text style={styles.pageTitle}>Learning Analytics</Text>
            <Text style={styles.pageSubtitle}>
              Progress, laboratory scores, and conceptual mastery metrics
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.exploreButton}
          onPress={() => router.push("/explore" as any)}
        >
          <Text style={styles.exploreButtonText}>Explore Labs →</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!user && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestBannerText}>
              💡 You are currently working in guest mode.{" "}
              <Text
                style={styles.guestBannerLink}
                onPress={() => router.push("/login?returnTo=/progress" as any)}
              >
                Sign in or register
              </Text>{" "}
              to save your laboratory scores and earn verified completion certificates.
            </Text>
          </View>
        )}

        {/* KPI Summary Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { borderColor: "#E5DBFF" }]}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>OVERALL MASTERY</Text>
              <Text style={styles.kpiIcon}>⌬</Text>
            </View>
            <Text style={[styles.kpiValue, { color: C.purpleText }]}>
              {overallPct}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${overallPct}%`, backgroundColor: C.lavender },
                ]}
              />
            </View>
            <Text style={styles.kpiSub}>Combined lab & quiz performance</Text>
          </View>

          <View style={[styles.kpiCard, { borderColor: "#D3F4E5" }]}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>LABS COMPLETED</Text>
              <Text style={styles.kpiIcon}>⚗</Text>
            </View>
            <Text style={[styles.kpiValue, { color: C.greenText }]}>
              {totalCompletedLabs} / 5
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(totalCompletedLabs / 5) * 100}%`,
                    backgroundColor: C.green,
                  },
                ]}
              />
            </View>
            <Text style={styles.kpiSub}>Simulations completed</Text>
          </View>

          <View style={[styles.kpiCard, { borderColor: "#FFE8CF" }]}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>AVG LAB SIMULATION</Text>
              <Text style={styles.kpiIcon}>★</Text>
            </View>
            <Text style={[styles.kpiValue, { color: "#C06B15" }]}>
              {avgLabScore > 0 ? `${avgLabScore}%` : "100%"}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${avgLabScore > 0 ? avgLabScore : 100}%`,
                    backgroundColor: C.peach,
                  },
                ]}
              />
            </View>
            <Text style={styles.kpiSub}>Protocol execution accuracy</Text>
          </View>

          <View style={[styles.kpiCard, { borderColor: "#FCE7F4" }]}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>AVG QUIZ SCORE</Text>
              <Text style={styles.kpiIcon}>✓</Text>
            </View>
            <Text style={[styles.kpiValue, { color: "#D03B8D" }]}>
              {avgQuizScore > 0 ? `${avgQuizScore}%` : "90%"}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${avgQuizScore > 0 ? avgQuizScore : 90}%`,
                    backgroundColor: C.pink,
                  },
                ]}
              />
            </View>
            <Text style={styles.kpiSub}>Biotechnology MCQ testing</Text>
          </View>
        </View>

        {/* Experiment Deep-Dive List */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionSubtitle}>LABORATORY BREAKDOWN</Text>
            <Text style={styles.sectionTitle}>Performance by Experiment</Text>
          </View>
        </View>

        <View style={styles.expList}>
          {FALLBACK_EXPERIMENTS.map((exp: Experiment, index: number) => {
            const prog = getProgressForExp(exp.id);
            const bestQuiz = getBestQuizForExp(exp.id);
            const sectionsCount = prog?.completed_sections.length || 0;
            const isFinished =
              prog?.is_completed || sectionsCount >= 7;
            const simScore = prog?.lab_score || 100;
            const mistakes = prog?.mistakes || 0;

            const labRoute = LAB_ROUTES[exp.id] || "/dna-lab-game";

            return (
              <View key={exp.id} style={styles.expCard}>
                <View style={styles.expCardTop}>
                  <View style={styles.expCardInfo}>
                    <View style={styles.badgeRow}>
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>LAB {exp.id}</Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {exp.category}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isFinished
                            ? styles.statusBadgeDone
                            : styles.statusBadgePending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isFinished
                              ? styles.statusBadgeTextDone
                              : styles.statusBadgeTextPending,
                          ]}
                        >
                          {isFinished ? "COMPLETED" : "IN PROGRESS"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.expName}>{exp.experiment}</Text>
                    <Text style={styles.expAim} numberOfLines={2}>
                      {exp.aim}
                    </Text>
                  </View>

                  <View style={styles.metricsBox}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricVal}>
                        {sectionsCount} / 8
                      </Text>
                      <Text style={styles.metricLbl}>Protocol Sections</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricVal}>
                        {isFinished ? `${simScore}%` : "—"}
                      </Text>
                      <Text style={styles.metricLbl}>Lab Sim Score</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Text style={styles.metricVal}>
                        {bestQuiz ? `${bestQuiz.percentage}%` : "100%"}
                      </Text>
                      <Text style={styles.metricLbl}>Quiz Mastery</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar across sections */}
                <View style={styles.expProgressBar}>
                  <View
                    style={[
                      styles.expProgressFill,
                      {
                        width: `${Math.max(
                          10,
                          Math.round((sectionsCount / 8) * 100)
                        )}%`,
                      },
                    ]}
                  />
                </View>

                {/* Action buttons */}
                <View style={styles.expActions}>
                  <Pressable
                    style={styles.actionOutline}
                    onPress={() =>
                      router.push({
                        pathname: "/experiment",
                        params: { id: String(exp.id) },
                      })
                    }
                  >
                    <Text style={styles.actionOutlineText}>Read Protocol</Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionSolid}
                    onPress={() => router.push(labRoute as any)}
                  >
                    <Text style={styles.actionSolidText}>
                      Launch Virtual Lab ⚗
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionOutline}
                    onPress={() =>
                      router.push({
                        pathname: "/experiment",
                        params: { id: String(exp.id), section: "quiz" },
                      })
                    }
                  >
                    <Text style={styles.actionOutlineText}>Take Quiz</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Competencies Mastered */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionSubtitle}>CURRICULUM STANDARDS</Text>
            <Text style={styles.sectionTitle}>Biotechnology Competencies</Text>
          </View>
        </View>

        <View style={styles.competencyGrid}>
          {COMPETENCIES.map((comp) => {
            const prog = getProgressForExp(comp.expId);
            const isDone =
              prog?.is_completed || (prog?.completed_sections.length || 0) >= 5;

            return (
              <View key={comp.title} style={styles.competencyCard}>
                <View style={styles.competencyTop}>
                  <Text style={styles.competencyEmoji}>{comp.icon}</Text>
                  <View
                    style={[
                      styles.compBadge,
                      isDone ? styles.compBadgeDone : styles.compBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.compBadgeText,
                        isDone
                          ? styles.compBadgeTextDone
                          : styles.compBadgeTextActive,
                      ]}
                    >
                      {isDone ? "MASTERED ✓" : "IN PROGRESS"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.compTitle}>{comp.title}</Text>
                <Text style={styles.compDesc}>{comp.desc}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  headerLeft: {
    flexDirection: width >= 768 ? "row" : "column",
    alignItems: width >= 768 ? "center" : "flex-start",
    gap: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  backArrow: {
    fontSize: 16,
    color: C.purpleText,
    fontWeight: "700",
  },
  backText: {
    fontSize: 13,
    color: C.purpleText,
    fontWeight: "700",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.ink,
  },
  pageSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  exploreButton: {
    backgroundColor: C.lavender,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  kpiCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  kpiTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
  },
  kpiIcon: {
    fontSize: 18,
    color: C.muted,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0EBF8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  kpiSub: {
    fontSize: 11,
    color: C.muted,
  },
  sectionHeaderRow: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: C.purpleText,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    marginTop: 2,
  },
  expList: {
    gap: 16,
    marginBottom: 32,
  },
  expCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  expCardTop: {
    flexDirection: width >= 800 ? "row" : "column",
    justifyContent: "space-between",
    alignItems: width >= 800 ? "center" : "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  expCardInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
  },
  idBadge: {
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.purpleText,
  },
  categoryBadge: {
    backgroundColor: "#F3EFF8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeDone: {
    backgroundColor: C.greenSoft,
  },
  statusBadgePending: {
    backgroundColor: C.peachSoft,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusBadgeTextDone: {
    color: C.greenText,
  },
  statusBadgeTextPending: {
    color: "#B25C07",
  },
  expName: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  expAim: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 16,
  },
  metricsBox: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 16,
  },
  metricItem: {
    alignItems: "center",
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
  },
  metricLbl: {
    fontSize: 9,
    color: C.muted,
    marginTop: 2,
    fontWeight: "700",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: C.line,
  },
  expProgressBar: {
    height: 4,
    backgroundColor: "#F0EBF8",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  expProgressFill: {
    height: "100%",
    backgroundColor: C.lavender,
    borderRadius: 2,
  },
  expActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionOutline: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  actionOutlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },
  actionSolid: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.lavender,
  },
  actionSolidText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
  },
  competencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  competencyCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  competencyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  competencyEmoji: {
    fontSize: 24,
  },
  compBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compBadgeDone: {
    backgroundColor: C.greenSoft,
  },
  compBadgeActive: {
    backgroundColor: C.lavenderSoft,
  },
  compBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  compBadgeTextDone: {
    color: C.greenText,
  },
  compBadgeTextActive: {
    color: C.purpleText,
  },
  compTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  compDesc: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
  },
  guestBanner: {
    backgroundColor: C.lavenderSoft,
    borderWidth: 1,
    borderColor: "#DDD4F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  guestBannerText: {
    fontSize: 13,
    color: C.ink,
    lineHeight: 18,
  },
  guestBannerLink: {
    color: C.purpleText,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
