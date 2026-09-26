import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  getExperimentById,
  getProgress,
  saveProgress,
  saveQuizResult,
  askMentor,
  Experiment,
  QuizItem,
} from "@/services/api";

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
  green: "#55B78A",
  greenSoft: "#E6F6EE",
  blue: "#38bdf8",
  blueSoft: "#e0f2fe",
};

const SECTIONS = [
  "Aim",
  "Theory",
  "Materials",
  "Procedure",
  "Precautions",
  "Virtual Laboratory",
  "Result",
  "Knowledge Check",
  "Lab Mentor",
] as const;

type SectionName = (typeof SECTIONS)[number];

function SectionIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    Aim: "◎",
    Theory: "▤",
    Materials: "⚗",
    Procedure: "☷",
    Precautions: "◇",
    "Virtual Laboratory": "🎮",
    Result: "✓",
    "Knowledge Check": "?",
    "Lab Mentor": "◌",
  };
  return <Text style={styles.sectionIconText}>{icons[name] || "•"}</Text>;
}

export default function ExperimentDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; section?: string }>();
  const experimentId = params.id ? parseInt(params.id, 10) : 1;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState<SectionName>(
    (params.section as SectionName) || "Aim"
  );
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Mentor State
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [mentorAnswer, setMentorAnswer] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [experimentId]);

  useEffect(() => {
    if (params.section && SECTIONS.includes(params.section as SectionName)) {
      setActiveSection(params.section as SectionName);
    }
  }, [params.section]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [exp, prog] = await Promise.all([
        getExperimentById(experimentId),
        getProgress(experimentId),
      ]);

      if (!exp) {
        setError("Experiment not found.");
      } else {
        setExperiment(exp);
      }

      if (prog) {
        setCompletedSections(prog.completed_sections || []);
      }
    } catch {
      setError("Unable to load this experiment.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionComplete = async (section: string) => {
    const updated = completedSections.includes(section)
      ? completedSections
      : [...completedSections, section];

    setCompletedSections(updated);
    await saveProgress({
      experiment_id: experimentId,
      completed_sections: updated,
    });
  };

  const getLabRoute = (id: number): string => {
    switch (id) {
      case 1:
        return "/dna-lab-game";
      case 2:
        return "/pcr-lab";
      case 3:
        return "/gram-staining-lab";
      case 4:
        return "/gel-electrophoresis-lab";
      case 5:
        return "/elisa-lab";
      default:
        return "/dna-lab-game";
    }
  };

  // Quiz logic
  const currentQuiz: QuizItem | undefined = experiment?.quiz?.[quizIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitQuizAnswer = async () => {
    if (!currentQuiz || !selectedOption || isAnswerSubmitted) return;
    const isCorrect =
      selectedOption.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase();
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    if (isCorrect) {
      setQuizScore(newScore);
    }
    setIsAnswerSubmitted(true);

    toggleSectionComplete("Knowledge Check");

    // If last question, save result
    if (experiment && quizIndex === experiment.quiz.length - 1) {
      await saveQuizResult({
        experiment_id: experimentId,
        score: newScore,
        total: experiment.quiz.length,
      });
    }
  };

  const handleNextQuizQuestion = () => {
    if (!experiment) return;
    if (quizIndex === experiment.quiz.length - 1) {
      setShowQuizResult(true);
      return;
    }
    setQuizIndex((prev) => prev + 1);
    setSelectedOption("");
    setIsAnswerSubmitted(false);
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption("");
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setShowQuizResult(false);
  };

  // Mentor logic
  const handleAskMentor = async (query?: string) => {
    const q = query || mentorQuestion.trim();
    if (!q || !experiment) return;
    try {
      setMentorLoading(true);
      setMentorQuestion(q);
      const answer = await askMentor(experiment.id, q);
      setMentorAnswer(answer);
      toggleSectionComplete("Lab Mentor");
    } finally {
      setMentorLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={C.lavender} />
        <Text style={styles.loadingText}>Loading virtual lab protocol…</Text>
      </View>
    );
  }

  if (error || !experiment) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorTitle}>Experiment Not Found</Text>
        <Text style={styles.errorSub}>{error || "Could not retrieve experiment data."}</Text>
        <Pressable style={styles.backButton} onPress={() => router.push("/explore")}>
          <Text style={styles.backButtonText}>← Return to Experiment Library</Text>
        </Pressable>
      </View>
    );
  }

  const progressPercent = Math.round(
    (completedSections.length / SECTIONS.length) * 100
  );

  return (
    <View style={styles.page}>
      {/* Top Bar */}
      <View style={styles.topbar}>
        <Pressable
          style={styles.backNav}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.push("/explore");
          }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>All Experiments</Text>
        </Pressable>

        <View style={styles.topActions}>
          <Pressable
            style={styles.notesShortcutBtn}
            onPress={() => router.push({ pathname: "/notes" as any, params: { experiment_id: String(experiment.id) } })}
          >
            <Text style={styles.notesShortcutText}>📝 Lab Notes</Text>
          </Pressable>

          <Pressable
            style={styles.enterLabTopBtn}
            onPress={() => router.push(getLabRoute(experiment.id) as any)}
          >
            <Text style={styles.enterLabTopText}>Enter Virtual Lab ▶</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.tagRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{experiment.category}</Text>
              </View>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>{experiment.difficulty}</Text>
              </View>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>⏱ {experiment.estimatedTime}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{experiment.experiment}</Text>
            <Text style={styles.heroAim}>{experiment.aim}</Text>
          </View>

          <View style={styles.heroArt}>
            <View style={styles.artCircle}>
              <Text style={styles.artGlyph}>⚗</Text>
            </View>
          </View>
        </View>

        {/* 2-Column Layout */}
        <View style={styles.layoutColumns}>
          {/* Left Navigation Menu */}
          <View style={styles.sectionMenu}>
            <Text style={styles.sectionMenuHeader}>Sections</Text>
            {SECTIONS.map((sec, idx) => {
              const active = activeSection === sec;
              const isDone = completedSections.includes(sec);

              return (
                <Pressable
                  key={sec}
                  style={[styles.sectionMenuItem, active && styles.sectionMenuItemActive]}
                  onPress={() => setActiveSection(sec)}
                >
                  <View style={[styles.sectionIconBadge, active && styles.sectionIconBadgeActive]}>
                    <SectionIcon name={sec} />
                  </View>
                  <Text style={[styles.sectionNum, active && styles.sectionTextActive]}>
                    {String(idx + 1).padStart(2, "0")}
                  </Text>
                  <Text style={[styles.sectionName, active && styles.sectionTextActive]} numberOfLines={1}>
                    {sec}
                  </Text>
                  {isDone && <Text style={styles.checkDoneIcon}>✓</Text>}
                </Pressable>
              );
            })}
          </View>

          {/* Main Section Content Area */}
          <View style={styles.contentArea}>
            <View style={styles.contentCard}>
              {/* Section Header */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.sectionNumBadge}>
                  <Text style={styles.sectionNumBadgeText}>
                    {String(SECTIONS.indexOf(activeSection) + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardEyebrow}>CURRENT SECTION</Text>
                  <Text style={styles.cardHeading}>{activeSection}</Text>
                </View>
              </View>

              {/* SECTION: AIM */}
              {activeSection === "Aim" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.paragraph}>{experiment.aim}</Text>
                  {experiment.learningObjectives && (
                    <View style={styles.objectivesBox}>
                      <Text style={styles.boxTitle}>🎯 Learning Objectives</Text>
                      {experiment.learningObjectives.map((obj, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{obj}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* SECTION: THEORY */}
              {activeSection === "Theory" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.paragraph}>{experiment.theory}</Text>
                  <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                      Tip: Understanding the biological principles beforehand will help you perform each step smoothly in the Virtual Laboratory simulation!
                    </Text>
                  </View>
                </View>
              )}

              {/* SECTION: MATERIALS */}
              {activeSection === "Materials" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.subHeading}>Apparatus &amp; Reagents Required:</Text>
                  <View style={styles.itemsList}>
                    {experiment.materials.map((m, i) => (
                      <View key={i} style={styles.itemRow}>
                        <View style={styles.itemIconCircle}>
                          <Text style={styles.itemCheckIcon}>✓</Text>
                        </View>
                        <Text style={styles.itemText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* SECTION: PROCEDURE */}
              {activeSection === "Procedure" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.subHeading}>Step-by-Step Laboratory Protocol:</Text>
                  <View style={styles.stepList}>
                    {experiment.procedure.map((p, i) => (
                      <View key={i} style={styles.stepCard}>
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepContentText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* SECTION: PRECAUTIONS */}
              {activeSection === "Precautions" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.subHeading}>Critical Safety &amp; Laboratory Precautions:</Text>
                  <View style={styles.itemsList}>
                    {experiment.precautions.map((prec, i) => (
                      <View key={i} style={styles.precautionRow}>
                        <View style={styles.precautionIconBox}>
                          <Text style={styles.precautionIcon}>⚠️</Text>
                        </View>
                        <Text style={styles.itemText}>{prec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* SECTION: VIRTUAL LABORATORY */}
              {activeSection === "Virtual Laboratory" && (
                <View style={styles.virtualLabPromptCard}>
                  <Text style={styles.virtualLabIcon}>🧪</Text>
                  <Text style={styles.virtualLabTitle}>Interactive Virtual Laboratory Simulation</Text>
                  <Text style={styles.virtualLabDesc}>
                    You have reviewed the theory, materials, and procedural steps. Now step into the virtual lab bench to physically drag reagents, operate instruments, and run the experiment.
                  </Text>
                  <Pressable
                    style={styles.startVirtualLabBigBtn}
                    onPress={() => router.push(getLabRoute(experiment.id) as any)}
                  >
                    <Text style={styles.startVirtualLabBigBtnText}>Launch Virtual Laboratory Bench ▶</Text>
                  </Pressable>
                </View>
              )}

              {/* SECTION: RESULT */}
              {activeSection === "Result" && (
                <View style={styles.sectionBody}>
                  <Text style={styles.subHeading}>Expected Observation &amp; Scientific Result:</Text>
                  {typeof experiment.result === "string" ? (
                    <View style={styles.resultMessageBox}>
                      <Text style={styles.resultMessageText}>{experiment.result}</Text>
                    </View>
                  ) : (
                    <View style={styles.resultKeyValues}>
                      {Object.entries(experiment.result).map(([k, v]) => (
                        <View key={k} style={styles.resultKVRow}>
                          <Text style={styles.resultKey}>{k.replace(/_/g, " ").toUpperCase()}:</Text>
                          <Text style={styles.resultVal}>{String(v)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* SECTION: KNOWLEDGE CHECK */}
              {activeSection === "Knowledge Check" && (
                <View style={styles.sectionBody}>
                  {showQuizResult ? (
                    <View style={styles.quizCompletionBox}>
                      <View style={styles.quizScoreRing}>
                        <Text style={styles.quizScoreBig}>{quizScore}</Text>
                        <Text style={styles.quizScoreTotal}>/ {experiment.quiz.length}</Text>
                      </View>
                      <Text style={styles.quizResultHeading}>Knowledge Check Completed!</Text>
                      <Text style={styles.quizResultSub}>
                        {quizScore === experiment.quiz.length
                          ? "Outstanding! You got a perfect score and mastered all concepts."
                          : quizScore >= 3
                          ? "Great job! You have a solid grasp of this laboratory protocol."
                          : "Good effort! Review the experiment sections and try again."}
                      </Text>
                      <Pressable style={styles.retryQuizBtn} onPress={handleRestartQuiz}>
                        <Text style={styles.retryQuizBtnText}>↻ Retake Knowledge Check</Text>
                      </Pressable>
                    </View>
                  ) : currentQuiz ? (
                    <View style={styles.quizContainer}>
                      <View style={styles.quizProgressHeader}>
                        <Text style={styles.quizCountText}>
                          Question {quizIndex + 1} of {experiment.quiz.length}
                        </Text>
                        <View style={styles.quizScoreBadge}>
                          <Text style={styles.quizScoreBadgeText}>{quizScore} Correct</Text>
                        </View>
                      </View>

                      <Text style={styles.quizQuestionText}>{currentQuiz.question}</Text>

                      <View style={styles.optionsList}>
                        {currentQuiz.options.map((opt, i) => {
                          const isSelected = selectedOption === opt;
                          const isCorrect =
                            opt.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase();

                          return (
                            <Pressable
                              key={i}
                              disabled={isAnswerSubmitted}
                              style={[
                                styles.optionItem,
                                isSelected && !isAnswerSubmitted && styles.optionItemSelected,
                                isAnswerSubmitted && isCorrect && styles.optionItemCorrect,
                                isAnswerSubmitted && isSelected && !isCorrect && styles.optionItemWrong,
                              ]}
                              onPress={() => handleSelectOption(opt)}
                            >
                              <View style={styles.optionRadioCircle}>
                                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                              </View>
                              <Text style={styles.optionText}>{opt}</Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {isAnswerSubmitted && (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationTitle}>
                            {selectedOption.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase()
                              ? "✓ Correct!"
                              : "✕ Incorrect"}
                          </Text>
                          <Text style={styles.explanationText}>{currentQuiz.explanation}</Text>
                        </View>
                      )}

                      <View style={styles.quizActionRow}>
                        {!isAnswerSubmitted ? (
                          <Pressable
                            disabled={!selectedOption}
                            style={[styles.quizSubmitBtn, !selectedOption && styles.btnDisabled]}
                            onPress={handleSubmitQuizAnswer}
                          >
                            <Text style={styles.quizSubmitBtnText}>Submit Answer</Text>
                          </Pressable>
                        ) : (
                          <Pressable style={styles.quizNextBtn} onPress={handleNextQuizQuestion}>
                            <Text style={styles.quizNextBtnText}>
                              {quizIndex === experiment.quiz.length - 1 ? "See Quiz Results →" : "Next Question →"}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.mutedText}>No quiz questions available.</Text>
                  )}
                </View>
              )}

              {/* SECTION: LAB MENTOR */}
              {activeSection === "Lab Mentor" && (
                <View style={styles.sectionBody}>
                  <View style={styles.mentorBanner}>
                    <View style={styles.mentorAvatarCircle}>
                      <Text style={styles.mentorAvatarGlyph}>🤖</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mentorTitle}>Ask Lab Mentor</Text>
                      <Text style={styles.mentorDesc}>
                        Have a question about this experiment&apos;s chemical reactions, safety steps, or observations? Ask below for instant contextual guidance.
                      </Text>
                    </View>
                  </View>

                  {/* FAQ Quick Chips */}
                  <Text style={styles.faqLabel}>Frequently Asked Questions:</Text>
                  <View style={styles.faqChipsRow}>
                    {experiment.ai_faqs.slice(0, 4).map((f, i) => (
                      <Pressable key={i} style={styles.faqChip} onPress={() => handleAskMentor(f.question)}>
                        <Text style={styles.faqChipText}>{f.question}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Question Input */}
                  <TextInput
                    value={mentorQuestion}
                    onChangeText={setMentorQuestion}
                    placeholder="Type your question about this experiment..."
                    placeholderTextColor="#AAA6B8"
                    style={styles.mentorInput}
                    multiline
                  />

                  <Pressable
                    disabled={mentorLoading || !mentorQuestion.trim()}
                    style={[styles.askMentorBtn, (!mentorQuestion.trim() || mentorLoading) && styles.btnDisabled]}
                    onPress={() => handleAskMentor()}
                  >
                    <Text style={styles.askMentorBtnText}>
                      {mentorLoading ? "Consulting Lab Mentor…" : "Send Question →"}
                    </Text>
                  </Pressable>

                  {/* Mentor Response */}
                  {mentorAnswer ? (
                    <View style={styles.mentorAnswerCard}>
                      <View style={styles.mentorAnswerHeader}>
                        <Text style={styles.mentorAnswerTag}>LAB MENTOR RESPONSE</Text>
                      </View>
                      <Text style={styles.mentorAnswerBody}>{mentorAnswer}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Bottom Navigation for Section Steps */}
              {activeSection !== "Knowledge Check" && activeSection !== "Lab Mentor" && (
                <View style={styles.cardBottomNav}>
                  <Pressable
                    disabled={SECTIONS.indexOf(activeSection) === 0}
                    style={[styles.prevSecBtn, SECTIONS.indexOf(activeSection) === 0 && styles.btnDisabled]}
                    onPress={() => {
                      const curIdx = SECTIONS.indexOf(activeSection);
                      if (curIdx > 0) setActiveSection(SECTIONS[curIdx - 1]);
                    }}
                  >
                    <Text style={styles.prevSecBtnText}>← Previous</Text>
                  </Pressable>

                  <Pressable
                    style={styles.markCompleteBtn}
                    onPress={() => {
                      toggleSectionComplete(activeSection);
                      const curIdx = SECTIONS.indexOf(activeSection);
                      if (curIdx < SECTIONS.length - 1) {
                        setActiveSection(SECTIONS[curIdx + 1]);
                      }
                    }}
                  >
                    <Text style={styles.markCompleteBtnText}>Mark Complete &amp; Continue →</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Right Progress & Quick Actions Card */}
          <View style={styles.rightColumn}>
            <View style={styles.progressCard}>
              <Text style={styles.sideCardTitle}>Your Progress</Text>
              <Text style={styles.sideCardSub}>In this experiment</Text>

              <View style={styles.ringWrapper}>
                <View style={styles.progressRing}>
                  <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </View>

              <Text style={styles.progressCountText}>
                {completedSections.length} of {SECTIONS.length} sections done
              </Text>

              <Pressable
                style={styles.enterLabSideBtn}
                onPress={() => router.push(getLabRoute(experiment.id) as any)}
              >
                <Text style={styles.enterLabSideBtnText}>Enter Virtual Lab ▶</Text>
              </Pressable>
            </View>

            {/* Quick Fact Card */}
            <View style={styles.factCard}>
              <Text style={styles.factBadge}>BIOTECH INSIGHT</Text>
              <Text style={styles.factText}>
                Standard protocols become effortless when you understand why each buffer and temperature change is required.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: C.bg },
  loadingText: { color: C.muted, fontSize: 13 },
  errorTitle: { fontSize: 20, fontWeight: "800", color: C.ink },
  errorSub: { fontSize: 12, color: C.muted, marginTop: 4 },
  backButton: { backgroundColor: C.lavender, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 12 },
  backButtonText: { color: C.white, fontSize: 12, fontWeight: "700" },

  topbar: {
    minHeight: 70,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  backNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  backArrow: { fontSize: 18, color: C.lavender, fontWeight: "800" },
  backText: { fontSize: 13, color: C.purpleText, fontWeight: "700" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  notesShortcutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: C.line,
  },
  notesShortcutText: { fontSize: 11, fontWeight: "700", color: C.ink },
  enterLabTopBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.lavender,
  },
  enterLabTopText: { fontSize: 11, fontWeight: "800", color: C.white },

  scrollContent: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: width >= 1100 ? 30 : 16,
    paddingVertical: 20,
  },
  heroCard: {
    backgroundColor: "#EEE7FF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E4DBFA",
    padding: width >= 700 ? 30 : 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  categoryBadge: { backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryBadgeText: { fontSize: 9, fontWeight: "800", color: C.purpleText },
  diffBadge: { backgroundColor: "#FAF5FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffBadgeText: { fontSize: 8, fontWeight: "700", color: C.purpleText },
  timeBadge: { backgroundColor: "rgba(255,255,255,0.7)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeBadgeText: { fontSize: 8, fontWeight: "700", color: C.muted },
  heroTitle: { fontSize: width >= 800 ? 32 : 24, fontWeight: "900", color: C.ink },
  heroAim: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: 650 },
  heroArt: { display: width >= 750 ? "flex" : "none" },
  artCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#DCD1FF", alignItems: "center", justifyContent: "center" },
  artGlyph: { fontSize: 44, color: C.lavender },

  layoutColumns: {
    flexDirection: width >= 900 ? "row" : "column",
    gap: 18,
  },
  sectionMenu: {
    width: width >= 900 ? 240 : "100%",
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
    alignSelf: "flex-start",
  },
  sectionMenuHeader: { fontSize: 14, fontWeight: "800", color: C.ink, padding: 8 },
  sectionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 3,
  },
  sectionMenuItemActive: { backgroundColor: C.lavenderSoft },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F8F6FC", alignItems: "center", justifyContent: "center" },
  sectionIconBadgeActive: { backgroundColor: "#DDD1FF" },
  sectionIconText: { fontSize: 13, color: C.lavender },
  sectionNum: { fontSize: 9, fontWeight: "700", color: C.muted, width: 16 },
  sectionName: { fontSize: 12, fontWeight: "600", color: C.ink, flex: 1 },
  sectionTextActive: { color: C.purpleText, fontWeight: "800" },
  checkDoneIcon: { color: C.green, fontSize: 12, fontWeight: "800" },

  contentArea: { flex: 1, minWidth: 0 },
  contentCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    padding: width >= 700 ? 28 : 18,
    minHeight: 450,
    justifyContent: "space-between",
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  sectionNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.lavenderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumBadgeText: { fontSize: 18, fontWeight: "800", color: C.lavender },
  cardEyebrow: { fontSize: 9, fontWeight: "800", color: C.muted, letterSpacing: 1 },
  cardHeading: { fontSize: 22, fontWeight: "800", color: C.ink },

  sectionBody: { flex: 1, gap: 14 },
  paragraph: { fontSize: 13.5, lineHeight: 22, color: C.ink },
  subHeading: { fontSize: 14, fontWeight: "800", color: C.ink, marginBottom: 4 },
  objectivesBox: { backgroundColor: "#FAF8FF", borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 16, marginTop: 10, gap: 8 },
  boxTitle: { fontSize: 12, fontWeight: "800", color: C.ink, marginBottom: 4 },
  bulletRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bullet: { fontSize: 14, color: C.lavender },
  bulletText: { fontSize: 12, color: C.muted, flex: 1, lineHeight: 18 },
  tipBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FEF9C3",
    borderWidth: 1,
    borderColor: "#FEF08A",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  tipIcon: { fontSize: 20 },
  tipText: { flex: 1, fontSize: 11, color: "#854D0E", lineHeight: 16 },

  itemsList: { gap: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemIconCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.greenSoft, alignItems: "center", justifyContent: "center" },
  itemCheckIcon: { fontSize: 11, color: C.green, fontWeight: "800" },
  itemText: { fontSize: 12.5, color: C.ink, flex: 1, lineHeight: 18 },

  stepList: { gap: 10 },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FBF9FE",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.lavenderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: { fontSize: 11, fontWeight: "800", color: C.purpleText },
  stepContentText: { flex: 1, fontSize: 12.5, color: C.ink, lineHeight: 19 },

  precautionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  precautionIconBox: { width: 24, height: 24, borderRadius: 8, backgroundColor: C.peachSoft, alignItems: "center", justifyContent: "center" },
  precautionIcon: { fontSize: 12 },

  virtualLabPromptCard: {
    backgroundColor: "#F4F0FF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DCD1FF",
    padding: 30,
    alignItems: "center",
    gap: 12,
    marginVertical: 10,
  },
  virtualLabIcon: { fontSize: 44 },
  virtualLabTitle: { fontSize: 18, fontWeight: "800", color: C.ink, textAlign: "center" },
  virtualLabDesc: { fontSize: 12, color: C.muted, textAlign: "center", maxWidth: 480, lineHeight: 18 },
  startVirtualLabBigBtn: {
    backgroundColor: C.lavender,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
    boxShadow: "0px 4px 12px rgba(142, 112, 233, 0.35)",
    elevation: 3,
  },
  startVirtualLabBigBtnText: { color: C.white, fontSize: 13, fontWeight: "800" },

  resultMessageBox: { backgroundColor: "#F0FDF4", borderRadius: 14, borderWidth: 1, borderColor: "#BBF7D0", padding: 18 },
  resultMessageText: { fontSize: 13, color: "#166534", lineHeight: 20 },
  resultKeyValues: { gap: 8 },
  resultKVRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F6FC",
    padding: 12,
    borderRadius: 10,
  },
  resultKey: { fontSize: 11, fontWeight: "800", color: C.muted },
  resultVal: { fontSize: 12, fontWeight: "700", color: C.ink },

  // Quiz Styles
  quizContainer: { gap: 14 },
  quizProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quizCountText: { fontSize: 11, fontWeight: "800", color: C.muted },
  quizScoreBadge: { backgroundColor: C.lavenderSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  quizScoreBadgeText: { fontSize: 10, fontWeight: "800", color: C.purpleText },
  quizQuestionText: { fontSize: 15, fontWeight: "800", color: C.ink, lineHeight: 22 },
  optionsList: { gap: 8 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 12,
    backgroundColor: C.white,
  },
  optionItemSelected: { borderColor: C.lavender, backgroundColor: C.lavenderSoft },
  optionItemCorrect: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  optionItemWrong: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  optionRadioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetter: { fontSize: 10, fontWeight: "800", color: C.ink },
  optionText: { flex: 1, fontSize: 12.5, color: C.ink },
  explanationBox: { backgroundColor: "#FAF5FF", borderRadius: 12, padding: 12, gap: 4 },
  explanationTitle: { fontSize: 12, fontWeight: "800", color: C.purpleText },
  explanationText: { fontSize: 11.5, color: C.muted, lineHeight: 16 },
  quizActionRow: { marginTop: 8 },
  quizSubmitBtn: { backgroundColor: C.lavender, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  quizSubmitBtnText: { color: C.white, fontWeight: "800", fontSize: 12 },
  quizNextBtn: { backgroundColor: C.purpleText, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  quizNextBtnText: { color: C.white, fontWeight: "800", fontSize: 12 },
  btnDisabled: { opacity: 0.5 },

  quizCompletionBox: { alignItems: "center", paddingVertical: 20, gap: 10 },
  quizScoreRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.lavenderSoft,
    borderWidth: 4,
    borderColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quizScoreBig: { fontSize: 28, fontWeight: "900", color: C.lavender },
  quizScoreTotal: { fontSize: 10, color: C.muted, marginTop: -4 },
  quizResultHeading: { fontSize: 18, fontWeight: "800", color: C.ink },
  quizResultSub: { fontSize: 12, color: C.muted, textAlign: "center", maxWidth: 360, lineHeight: 18 },
  retryQuizBtn: {
    backgroundColor: C.lavender,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 6,
  },
  retryQuizBtnText: { color: C.white, fontWeight: "800", fontSize: 12 },

  // Mentor Styles
  mentorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.lavenderSoft,
    borderRadius: 16,
    padding: 16,
  },
  mentorAvatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#DCD1FF", alignItems: "center", justifyContent: "center" },
  mentorAvatarGlyph: { fontSize: 24 },
  mentorTitle: { fontSize: 14, fontWeight: "800", color: C.ink },
  mentorDesc: { fontSize: 11, color: C.muted, lineHeight: 16, marginTop: 2 },
  faqLabel: { fontSize: 11, fontWeight: "800", color: C.ink, marginTop: 6 },
  faqChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  faqChip: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  faqChipText: { fontSize: 10.5, color: C.purpleText, fontWeight: "600" },
  mentorInput: {
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: C.ink,
    minHeight: 70,
    textAlignVertical: "top",
  },
  askMentorBtn: {
    backgroundColor: C.lavender,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  askMentorBtnText: { color: C.white, fontWeight: "800", fontSize: 12 },
  mentorAnswerCard: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  mentorAnswerHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  mentorAnswerTag: { fontSize: 9, fontWeight: "800", color: C.purpleText, letterSpacing: 0.8 },
  mentorAnswerBody: { fontSize: 12, color: C.ink, lineHeight: 19 },

  cardBottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 18,
    marginTop: 20,
  },
  prevSecBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: C.line },
  prevSecBtnText: { fontSize: 11, fontWeight: "700", color: C.muted },
  markCompleteBtn: { backgroundColor: C.lavender, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  markCompleteBtnText: { color: C.white, fontSize: 11, fontWeight: "800" },

  // Right Column
  rightColumn: { width: width >= 900 ? 250 : "100%", gap: 14 },
  progressCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    alignItems: "center",
  },
  sideCardTitle: { fontSize: 14, fontWeight: "800", color: C.ink },
  sideCardSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  ringWrapper: { marginVertical: 14 },
  progressRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: C.lavenderSoft,
    borderTopColor: C.lavender,
    borderRightColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentText: { fontSize: 18, fontWeight: "900", color: C.ink },
  progressLabel: { fontSize: 8, color: C.muted, fontWeight: "700" },
  progressCountText: { fontSize: 10, color: C.muted, marginBottom: 12 },
  enterLabSideBtn: {
    width: "100%",
    backgroundColor: C.lavender,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  enterLabSideBtnText: { color: C.white, fontSize: 11, fontWeight: "800" },

  factCard: { backgroundColor: C.pinkSoft, borderRadius: 16, padding: 16, gap: 6 },
  factBadge: { fontSize: 8, fontWeight: "900", color: "#9D174D", letterSpacing: 0.8 },
  factText: { fontSize: 11, color: C.ink, lineHeight: 16 },
  mutedText: { fontSize: 12, color: C.muted },
});