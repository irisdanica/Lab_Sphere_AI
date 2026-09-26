import React, { useEffect, useState } from "react";
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
import { router } from "expo-router";
import {
  Experiment,
  FALLBACK_EXPERIMENTS,
  getAllProgress,
  getExperiments,
  ProgressOverview,
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
  greenText: "#187247",
  danger: "#E53935",
  dangerSoft: "#FFEBEE",
};

const EXP_ICONS: Record<number, string> = {
  1: "🧬",
  2: "⚡",
  3: "🔬",
  4: "🧪",
  5: "🧫",
};

const EXP_PALETTES = [
  [C.lavenderSoft, C.lavender],
  [C.peachSoft, C.peach],
  [C.pinkSoft, C.pink],
  [C.blueSoft, C.blueText],
  [C.greenSoft, C.green],
];

function Icon({ type, active = false }: { type: string; active?: boolean }) {
  const color = active ? C.white : C.ink;
  const symbol: Record<string, string> = {
    home: "⌂",
    flask: "⚗",
    progress: "↗",
    bookmark: "✎",
    mentor: "◌",
    flash: "★",
    profile: "👤",
    logout: "⎋",
    menu: "☰",
  };
  return <Text style={[styles.icon, { color }]}>{symbol[type] || "•"}</Text>;
}

function Sidebar({ currentPath, user, onLogout }: { currentPath: string; user: any; onLogout: () => void }) {
  const items = [
    { icon: "home", label: "Dashboard", path: "/dashboard" },
    { icon: "flask", label: "Experiments", path: "/explore" },
    { icon: "progress", label: "My Progress", path: "/progress" },
    { icon: "bookmark", label: "Lab Notes", path: "/notes" },
    { icon: "mentor", label: "Lab Mentor", path: "/experiment?id=1&section=mentor" },
    { icon: "profile", label: "My Profile", path: "/profile" },
  ];

  const initials = (user?.name || "Student")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.sidebar}>
      <View>
        <Pressable
          style={styles.brandRow}
          onPress={() => router.push("/" as any)}
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>⌬</Text>
          </View>
          <View>
            <Text style={styles.brand}>
              Lab<Text style={styles.brandAccent}>Sphere</Text>{" "}
              <Text style={styles.brandAI}>AI</Text>
            </Text>
            <Text style={styles.brandSub}>VIRTUAL BIO LAB</Text>
          </View>
        </Pressable>

        <View style={styles.navList}>
          {items.map((item) => {
            const active = currentPath === item.path;
            return (
              <Pressable
                key={item.label}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => {
                  if (item.path.includes("?")) {
                    const [pathname, query] = item.path.split("?");
                    const params: Record<string, string> = {};
                    query.split("&").forEach((part) => {
                      const [k, v] = part.split("=");
                      params[k] = v;
                    });
                    router.push({ pathname, params } as any);
                  } else {
                    router.push(item.path as any);
                  }
                }}
              >
                <Icon type={item.icon} active={active} />
                <Text
                  style={[styles.navText, active && styles.navTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View style={styles.sideMessage}>
          <Text style={styles.sideBlob}>◌</Text>
          <Text style={styles.sideMessageTitle}>Keep learning,</Text>
          <Text style={styles.sideMessageStrong}>keep growing!</Text>
          <Text style={styles.sideMessageText}>
            Science is discovery,{"\n"}practice is mastery.
          </Text>
        </View>

        <Pressable
          style={styles.profileSnippet}
          onPress={() => router.push("/profile" as any)}
        >
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileMiniName} numberOfLines={1}>
              {user?.name || "Student"}
            </Text>
            <Text style={styles.profileMiniRole} numberOfLines={1}>
              {user?.institution || "Biotechnology"}
            </Text>
          </View>
          <Pressable onPress={onLogout} style={styles.logoutMiniBtn}>
            <Text style={styles.logoutMiniText}>Log out</Text>
          </Pressable>
        </Pressable>
      </View>
    </View>
  );
}

function ExperimentCard({
  item,
  index,
  progress,
}: {
  item: Experiment;
  index: number;
  progress: number;
}) {
  const palette = EXP_PALETTES[index % EXP_PALETTES.length];
  const iconEmoji = EXP_ICONS[item.id] || "⚗";

  return (
    <Pressable
      style={styles.experimentCard}
      onPress={() =>
        router.push({
          pathname: "/experiment",
          params: { id: String(item.id) },
        })
      }
    >
      <View style={styles.cardHeaderRow}>
        <View
          style={[styles.experimentIcon, { backgroundColor: palette[0] }]}
        >
          <Text style={styles.experimentEmoji}>{iconEmoji}</Text>
        </View>
        <View style={styles.diffBadge}>
          <Text style={styles.diffBadgeText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
      <Text style={styles.cardTitle}>{item.experiment}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.aim}
      </Text>

      <View style={styles.cardProgressLine}>
        <View
          style={[
            styles.cardProgressFill,
            {
              width: `${Math.max(5, progress)}%`,
              backgroundColor: palette[1],
            },
          ]}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterLabel}>PROGRESS</Text>
        <Text style={styles.cardFooterValue}>{progress}%</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const [experiments, setExperiments] = useState<Experiment[]>(FALLBACK_EXPERIMENTS);
  const [search, setSearch] = useState("");
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace({ pathname: "/login", params: { returnTo: "/dashboard" } } as any);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [exps, prog] = await Promise.all([
        getExperiments(),
        getAllProgress(),
      ]);
      setExperiments(exps);
      setOverview(prog);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  const getProgress = (id: number): number => {
    const item = overview?.progress.find((p) => p.experiment_id === id);
    if (!item) return 0;
    if (item.is_completed) return 100;
    const completedCount = item.completed_sections?.length || 0;
    return Math.min(100, Math.round((completedCount / 8) * 100));
  };

  const overallProgress = experiments.length
    ? Math.round(
        experiments.reduce((acc, exp) => acc + getProgress(exp.id), 0) /
          experiments.length
      )
    : 0;

  const filtered = experiments.filter(
    (x) =>
      x.experiment.toLowerCase().includes(search.toLowerCase()) ||
      x.category.toLowerCase().includes(search.toLowerCase()) ||
      x.aim.toLowerCase().includes(search.toLowerCase())
  );

  const firstName = (user?.name || "Student").split(" ")[0];
  const initials = (user?.name || "Student")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (authLoading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={C.lavender} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.shell}>
        {width >= 900 && (
          <Sidebar
            currentPath="/dashboard"
            user={user}
            onLogout={handleLogout}
          />
        )}

        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Topbar */}
          <View style={styles.topbar}>
            {width < 900 && (
              <Pressable
                style={styles.menuButton}
                onPress={() => router.push("/explore" as any)}
              >
                <Icon type="menu" />
              </Pressable>
            )}

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search experiments, DNA, PCR, Gram, ELISA..."
                placeholderTextColor="#AAA6B8"
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={{ color: C.muted, paddingHorizontal: 4 }}>✕</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.topActions}>
              <Pressable
                style={styles.circleButton}
                onPress={() => router.push("/notes" as any)}
              >
                <Text style={{ fontSize: 16 }}>✎</Text>
              </Pressable>

              <Pressable
                style={styles.avatarPill}
                onPress={() => router.push("/profile" as any)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                {width >= 700 && (
                  <Text style={styles.userName}>{user?.name || "Student"}</Text>
                )}
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>

              <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Logout</Text>
              </Pressable>
            </View>
          </View>

          {/* Welcome Banner */}
          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.eyebrow}>PERSONAL WORKBENCH</Text>
              <Text style={styles.pageTitle}>
                Welcome back,{" "}
                <Text style={styles.pageTitleAccent}>{firstName}!</Text>
              </Text>
              <Text style={styles.pageSubtitle}>
                Continue your biotechnology journey across 5 interactive wet-lab simulations.
              </Text>
            </View>

            <View style={styles.dateCard}>
              <Text style={styles.dateSmall}>LAB STATUS</Text>
              <Text style={styles.dateBig}>ACTIVE</Text>
              <Text style={styles.dateMonth}>2026</Text>
            </View>
          </View>

          {/* Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>VIRTUAL BIOTECHNOLOGY LAB</Text>
              </View>
              <Text style={styles.heroTitle}>
                Learn science by{"\n"}
                <Text style={styles.heroTitleAccent}>doing it.</Text>
              </Text>
              <Text style={styles.heroText}>
                Step onto the virtual bench. Prepare strawberry DNA, program
                thermal cyclers, stain bacterial smears, cast agarose gels, and
                read ELISA optical densities.
              </Text>

              <View style={styles.heroBtnRow}>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() =>
                    router.push({
                      pathname: "/experiment",
                      params: { id: "1" },
                    })
                  }
                >
                  <Text style={styles.primaryButtonText}>Start Experiment</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryHeroBtn}
                  onPress={() => router.push("/progress" as any)}
                >
                  <Text style={styles.secondaryHeroBtnText}>
                    My Analytics ↗
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.heroArt}>
              <View style={styles.artCircle}>
                <Text style={styles.artDNA}>⌬</Text>
              </View>
              <View style={styles.artTube}>
                <View style={styles.artLiquid} />
              </View>
              <View style={styles.artSpark}>
                <Text style={{ fontSize: 24, color: C.pink }}>✦</Text>
              </View>
              <View style={styles.artLeaf}>
                <Text style={{ fontSize: 48, color: C.lavender }}>⚗</Text>
              </View>
            </View>
          </View>

          {/* Section: Your Lab */}
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionLabel}>CURRICULUM</Text>
              <Text style={styles.sectionTitle}>Biotechnology Laboratories</Text>
            </View>
            <Pressable onPress={() => router.push("/explore" as any)}>
              <Text style={styles.viewAll}>View all ({experiments.length}) →</Text>
            </Pressable>
          </View>

          {/* Grid Area */}
          <View style={styles.contentGrid}>
            <View style={styles.experimentArea}>
              <View style={styles.cardsGrid}>
                {filtered.map((item, i) => (
                  <ExperimentCard
                    key={item.id}
                    item={item}
                    index={i}
                    progress={getProgress(item.id)}
                  />
                ))}
              </View>

              {/* Learning Overview Card */}
              <View style={styles.overallCard}>
                <View style={styles.overallTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.overallLabel}>LEARNING OVERVIEW</Text>
                    <Text style={styles.overallTitle}>
                      Your LabSphere Journey
                    </Text>
                    <Text style={styles.overallText}>
                      You have completed {overallProgress}% of your curriculum
                      across all {experiments.length} biotechnology laboratories.
                    </Text>
                  </View>

                  <View style={styles.overallBadge}>
                    <Text style={styles.overallBadgeNumber}>
                      {overallProgress}%
                    </Text>
                    <Text style={styles.overallBadgeText}>OVERALL</Text>
                  </View>
                </View>

                <View style={styles.overallBar}>
                  <View
                    style={[
                      styles.overallBarFill,
                      { width: `${overallProgress}%` },
                    ]}
                  />
                </View>

                <View style={styles.overallStats}>
                  {experiments.map((e) => (
                    <View key={e.id} style={{ alignItems: "center" }}>
                      <Text style={styles.overallStatNumber}>
                        {getProgress(e.id)}%
                      </Text>
                      <Text style={styles.overallStatLabel}>
                        {e.experiment.split(" ")[0]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* LabSphere Tip */}
              <View style={styles.learningCard}>
                <View style={styles.learningIcon}>
                  <Text style={{ fontSize: 20 }}>✦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.learningLabel}>LABSPHERE TIP</Text>
                  <Text style={styles.learningTitle}>
                    Theory informs technique, practice builds mastery.
                  </Text>
                  <Text style={styles.learningText}>
                    Read the biochemical principles first, then step directly
                    onto the virtual bench to reinforce every concept through
                    interactive experimentation.
                  </Text>
                </View>
                <Pressable onPress={() => router.push("/notes" as any)}>
                  <Text style={styles.learningArrow}>✎</Text>
                </Pressable>
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
              {/* Progress Summary Card */}
              <View style={styles.progressCard}>
                <View style={styles.sideCardHeader}>
                  <View>
                    <Text style={styles.sideCardTitle}>Your Progress</Text>
                    <Text
                      style={{
                        color: C.muted,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      5 Virtual Laboratories
                    </Text>
                  </View>
                  <Pressable onPress={() => router.push("/progress" as any)}>
                    <Text style={styles.trend}>↗</Text>
                  </Pressable>
                </View>

                <View style={styles.progressBody}>
                  <View style={styles.progressRing}>
                    <View style={styles.progressInner}>
                      <Text style={styles.progressPercent}>
                        {loading ? "..." : `${overallProgress}%`}
                      </Text>
                      <Text style={styles.progressComplete}>Mastery</Text>
                    </View>
                  </View>

                  <View style={styles.checkList}>
                    {experiments.map((item) => {
                      const p = getProgress(item.id);
                      const done = p === 100;
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.checkRow}
                          onPress={() =>
                            router.push({
                              pathname: "/experiment",
                              params: { id: String(item.id) },
                            })
                          }
                        >
                          <View
                            style={[
                              styles.checkCircle,
                              done && styles.checkDone,
                            ]}
                          >
                            {done && <Text style={styles.checkMark}>✓</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.checkText}>
                              {item.experiment}
                            </Text>
                            <Text style={styles.checkSubText}>
                              {p}% complete
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  style={styles.continueButton}
                  onPress={() => router.push("/progress" as any)}
                >
                  <Text style={styles.continueButtonText}>
                    View Analytics Dashboard →
                  </Text>
                </Pressable>
              </View>

              {/* Quick Fact Card */}
              <View style={styles.factCard}>
                <View style={styles.sideCardHeader}>
                  <Text style={styles.sideCardTitle}>Quick Fact</Text>
                  <Text style={styles.factBulb}>💡</Text>
                </View>
                <View style={styles.factBox}>
                  <Text style={styles.factLabel}>DID YOU KNOW?</Text>
                  <Text style={styles.factText}>
                    In PCR, each thermal cycle doubles the target DNA sequence.
                    After 30 cycles, a single DNA molecule is amplified over 1
                    billion times!
                  </Text>
                  <Text style={styles.factDNA}>⌬</Text>
                </View>
              </View>

              {/* Lab Mentor Card */}
              <View style={styles.mentorCard}>
                <Text style={styles.sideCardTitle}>Lab Mentor AI</Text>
                <View style={styles.mentorBubble}>
                  <View style={styles.robot}>
                    <Text style={{ fontSize: 20 }}>🤖</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mentorHi}>Hi! I'm your Lab Mentor.</Text>
                    <Text style={styles.mentorText}>
                      Ask me about reaction kinetics, pipetting steps, or buffer
                      compositions.
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.mentorButton}
                  onPress={() =>
                    router.push({
                      pathname: "/experiment",
                      params: { id: "1", section: "mentor" },
                    })
                  }
                >
                  <Text style={styles.mentorButtonText}>Ask a Question</Text>
                  <Text>→</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerBrand}>LabSphere AI</Text>
            <Text style={styles.footerText}>
              Intelligent Virtual Biotechnology Laboratory • Learn • Explore •
              Experiment
            </Text>
            <Text style={styles.footerCopy}>© 2026 LabSphere AI</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  loadingPage: { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  shell: { flex: 1, flexDirection: "row", width: "100%" },
  sidebar: {
    width: 250,
    backgroundColor: C.white,
    borderRightWidth: 1,
    borderRightColor: C.line,
    padding: 20,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 4,
    marginBottom: 8,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.lavenderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: { fontSize: 24, color: C.lavender },
  brand: { fontSize: 17, fontWeight: "800", color: C.ink },
  brandAccent: { color: C.lavender },
  brandAI: { color: C.pink, fontWeight: "800" },
  brandSub: { fontSize: 8, letterSpacing: 1.5, color: C.muted, marginTop: 2 },
  navList: { gap: 6, marginTop: 20 },
  navItem: {
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  navItemActive: { backgroundColor: C.lavender },
  navText: { color: C.ink, fontSize: 13, fontWeight: "600" },
  navTextActive: { color: C.white, fontWeight: "700" },
  icon: { fontSize: 18, width: 20, textAlign: "center" },
  sideMessage: {
    backgroundColor: "#F6F1FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  sideBlob: {
    fontSize: 50,
    color: "#C4B0FA",
    position: "absolute",
    right: -4,
    top: -15,
  },
  sideMessageTitle: { color: C.ink, fontSize: 14, marginTop: 24 },
  sideMessageStrong: { color: C.ink, fontSize: 16, fontWeight: "800" },
  sideMessageText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },
  profileSnippet: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: {
    color: C.white,
    fontWeight: "800",
    fontSize: 11,
  },
  profileMiniName: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },
  profileMiniRole: {
    fontSize: 9,
    color: C.muted,
  },
  logoutMiniBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  logoutMiniText: {
    fontSize: 10,
    color: C.danger,
    fontWeight: "700",
  },
  main: { flex: 1 },
  mainContent: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: width >= 1100 ? 32 : 18,
    paddingBottom: 40,
  },
  topbar: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  searchBox: {
    flex: 1,
    maxWidth: 500,
    height: 44,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 20, color: C.muted, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: C.ink },
  topActions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#A74F87", fontWeight: "800", fontSize: 11 },
  userName: { color: C.ink, fontSize: 12, fontWeight: "700" },
  chevron: { color: C.muted, fontSize: 14 },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.dangerSoft,
  },
  logoutBtnText: {
    fontSize: 11,
    color: C.danger,
    fontWeight: "700",
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: C.lavender,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: width >= 800 ? 28 : 22,
    lineHeight: 34,
    fontWeight: "800",
    color: C.ink,
  },
  pageTitleAccent: { color: C.lavender },
  pageSubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 580,
  },
  dateCard: {
    display: width >= 700 ? "flex" : "none",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 85,
  },
  dateSmall: {
    fontSize: 8,
    color: C.muted,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  dateBig: { fontSize: 18, color: C.greenText, fontWeight: "900", lineHeight: 22 },
  dateMonth: { fontSize: 9, color: C.muted, fontWeight: "700" },
  heroCard: {
    minHeight: 260,
    borderRadius: 22,
    backgroundColor: "#EEE7FF",
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E4DBFA",
  },
  heroCopy: {
    flex: 1,
    padding: width >= 700 ? 32 : 22,
    justifyContent: "center",
    maxWidth: 680,
  },
  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroTagText: {
    fontSize: 8,
    color: C.purpleText,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: width >= 800 ? 34 : 26,
    lineHeight: 40,
    fontWeight: "800",
    color: C.ink,
    marginTop: 10,
  },
  heroTitleAccent: { color: C.lavender },
  heroText: {
    color: "#5B5472",
    fontSize: 12,
    lineHeight: 19,
    maxWidth: 480,
    marginTop: 8,
  },
  heroBtnRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: C.lavender,
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primaryButtonText: { color: C.white, fontWeight: "700", fontSize: 12 },
  buttonArrow: { color: C.white, fontSize: 16 },
  secondaryHeroBtn: {
    backgroundColor: C.white,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryHeroBtnText: {
    color: C.purpleText,
    fontWeight: "700",
    fontSize: 12,
  },
  heroArt: {
    width: width >= 900 ? 340 : 200,
    minWidth: 160,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  artCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#DCD1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  artDNA: {
    fontSize: 80,
    color: C.lavender,
    transform: [{ rotate: "30deg" }],
  },
  artTube: {
    position: "absolute",
    right: 48,
    bottom: 35,
    width: 42,
    height: 95,
    borderWidth: 3,
    borderColor: C.white,
    borderRadius: 12,
    backgroundColor: "#F5F0FF",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  artLiquid: { height: 45, backgroundColor: C.pink, opacity: 0.8 },
  artSpark: { position: "absolute", top: 28, right: 70 },
  artLeaf: { position: "absolute", left: 20, bottom: 20 },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 9,
    color: C.lavender,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  sectionTitle: {
    fontSize: 20,
    color: C.ink,
    fontWeight: "800",
    marginTop: 3,
  },
  viewAll: {
    color: C.purpleText,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },
  contentGrid: {
    flexDirection: width >= 1050 ? "row" : "column",
    gap: 20,
  },
  experimentArea: { flex: 1, minWidth: 0 },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  experimentCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  experimentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  experimentEmoji: { fontSize: 20 },
  diffBadge: {
    backgroundColor: C.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: C.muted,
  },
  cardCategory: {
    fontSize: 8,
    fontWeight: "800",
    color: C.purpleText,
    letterSpacing: 0.6,
    marginTop: 12,
  },
  cardTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  cardDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    minHeight: 32,
    marginTop: 4,
  },
  cardProgressLine: {
    height: 5,
    backgroundColor: "#F0EDF5",
    borderRadius: 4,
    marginTop: 14,
    overflow: "hidden",
  },
  cardProgressFill: { height: "100%", borderRadius: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardFooterLabel: { fontSize: 8, color: C.muted, fontWeight: "700" },
  cardFooterValue: { fontSize: 9, color: C.ink, fontWeight: "800" },
  rightColumn: { width: width >= 1150 ? 330 : "100%", gap: 16 },
  progressCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
  },
  sideCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideCardTitle: { color: C.ink, fontSize: 15, fontWeight: "800" },
  trend: { color: C.lavender, fontSize: 18, fontWeight: "700" },
  progressBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 15,
  },
  progressRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 10,
    borderColor: "#E8E0FF",
    borderTopColor: C.lavender,
    borderRightColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  progressInner: { alignItems: "center" },
  progressPercent: { color: C.ink, fontSize: 20, fontWeight: "900" },
  progressComplete: { color: C.muted, fontSize: 8, marginTop: 2 },
  checkList: { flex: 1, gap: 6 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  checkCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
    borderColor: "#8D88A0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: { backgroundColor: C.green, borderColor: C.green },
  checkMark: { color: C.white, fontSize: 8, fontWeight: "800" },
  checkText: { color: C.ink, fontSize: 10, fontWeight: "600" },
  checkSubText: { color: C.muted, fontSize: 8 },
  continueButton: {
    marginTop: 16,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: { color: C.white, fontSize: 11, fontWeight: "700" },
  factCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  factBulb: { fontSize: 18 },
  factBox: {
    marginTop: 10,
    backgroundColor: C.pinkSoft,
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    position: "relative",
    overflow: "hidden",
  },
  factLabel: {
    color: "#B4538B",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  factText: {
    color: C.ink,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    maxWidth: 220,
  },
  factDNA: {
    position: "absolute",
    right: 8,
    bottom: -6,
    color: C.pink,
    fontSize: 42,
    opacity: 0.4,
  },
  mentorCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  mentorBubble: {
    marginTop: 12,
    backgroundColor: "#F4EEFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  robot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDD1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  mentorHi: { color: C.ink, fontSize: 11, fontWeight: "800" },
  mentorText: { color: C.muted, fontSize: 9, lineHeight: 14, marginTop: 2 },
  mentorButton: {
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.lavender,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mentorButtonText: {
    color: C.purpleText,
    fontSize: 11,
    fontWeight: "700",
  },
  learningCard: {
    backgroundColor: "#FFF8EC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F6E6CC",
    marginTop: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  learningIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.peachSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  learningLabel: {
    color: "#B77A34",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  learningTitle: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  learningText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  learningArrow: { color: C.peach, fontSize: 18 },
  footer: { alignItems: "center", paddingTop: 40, gap: 4 },
  footerBrand: { color: C.ink, fontSize: 15, fontWeight: "800" },
  footerText: { color: C.muted, fontSize: 10 },
  footerCopy: { color: "#AAA5B7", fontSize: 9 },
  overallCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 16,
    padding: 18,
  },
  overallTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  overallLabel: {
    color: C.lavender,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  overallTitle: {
    color: C.ink,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },
  overallText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  overallBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.lavenderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  overallBadgeNumber: {
    color: C.lavender,
    fontSize: 18,
    fontWeight: "900",
  },
  overallBadgeText: {
    color: C.purpleText,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  overallBar: {
    height: 6,
    backgroundColor: "#F0EDF5",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 16,
  },
  overallBarFill: {
    height: "100%",
    backgroundColor: C.lavender,
    borderRadius: 4,
  },
  overallStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },
  overallStatNumber: {
    color: C.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  overallStatLabel: {
    color: C.muted,
    fontSize: 8,
    marginTop: 2,
  },
});
