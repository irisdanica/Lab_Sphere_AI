import React, { useEffect, useState } from "react";
import {
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
  getExperiments,
  getAllProgress,
  Experiment,
  ProgressData,
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
  green: "#55B78A",
  greenSoft: "#E6F6EE",
  blue: "#38bdf8",
  blueSoft: "#e0f2fe",
};

const CATEGORIES = ["All", "Molecular Biology", "Microbiology", "Immunology"] as const;
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const STATUSES = ["All", "Completed", "In Progress", "Not Started"] as const;

export default function ExploreScreen() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, ProgressData>>({});
  const [loading, setLoading] = useState(true);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "LS";

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exps, progOverview] = await Promise.all([
        getExperiments(),
        getAllProgress(),
      ]);
      setExperiments(exps);
      const map: Record<number, ProgressData> = {};
      progOverview.progress.forEach((p) => {
        map[p.experiment_id] = p;
      });
      setProgressMap(map);
    } finally {
      setLoading(false);
    }
  };

  const getExpProgress = (id: number): number => {
    const p = progressMap[id];
    if (!p) return 0;
    if (p.is_completed) return 100;
    const sections = p.completed_sections || [];
    return Math.min(100, Math.round((sections.length / 8) * 100));
  };

  const filteredExperiments = experiments.filter((item) => {
    // Search filter
    const matchesSearch =
      item.experiment.toLowerCase().includes(search.toLowerCase()) ||
      item.aim.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;

    // Difficulty filter
    const matchesDiff =
      selectedDifficulty === "All" || item.difficulty === selectedDifficulty;

    // Status filter
    const prog = getExpProgress(item.id);
    let matchesStatus = true;
    if (selectedStatus === "Completed") matchesStatus = prog === 100;
    else if (selectedStatus === "In Progress") matchesStatus = prog > 0 && prog < 100;
    else if (selectedStatus === "Not Started") matchesStatus = prog === 0;

    return matchesSearch && matchesCat && matchesDiff && matchesStatus;
  });

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

  return (
    <View style={styles.page}>
      <View style={styles.shell}>
        {/* Sidebar for desktop */}
        {width >= 900 && (
          <View style={styles.sidebar}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>⌬</Text>
              </View>
              <View>
                <Text style={styles.brand}>
                  Lab<Text style={styles.brandAccent}>Sphere</Text> <Text style={styles.brandAI}>AI</Text>
                </Text>
                <Text style={styles.brandSub}>VIRTUAL BIO LAB</Text>
              </View>
            </View>

            <View style={styles.navList}>
              <Pressable style={styles.navItem} onPress={() => router.push("/")}>
                <Text style={styles.navIcon}>⌂</Text>
                <Text style={styles.navText}>Home</Text>
              </Pressable>
              <Pressable style={[styles.navItem, styles.navItemActive]}>
                <Text style={[styles.navIcon, styles.navTextActive]}>⚗</Text>
                <Text style={[styles.navText, styles.navTextActive]}>Experiments</Text>
              </Pressable>
              <Pressable style={styles.navItem} onPress={() => router.push("/progress" as any)}>
                <Text style={styles.navIcon}>↗</Text>
                <Text style={styles.navText}>My Progress</Text>
              </Pressable>
              <Pressable style={styles.navItem} onPress={() => router.push("/notes" as any)}>
                <Text style={styles.navIcon}>♡</Text>
                <Text style={styles.navText}>Saved Notes</Text>
              </Pressable>
              <Pressable
                style={styles.navItem}
                onPress={() => router.push({ pathname: "/experiment", params: { id: "1", section: "Lab Mentor" } })}
              >
                <Text style={styles.navIcon}>◌</Text>
                <Text style={styles.navText}>Lab Mentor</Text>
              </Pressable>
              <Pressable style={styles.navItem} onPress={() => router.push("/profile" as any)}>
                <Text style={styles.navIcon}>▣</Text>
                <Text style={styles.navText}>Profile</Text>
              </Pressable>
            </View>

            <View style={styles.sideCardBox}>
              <Text style={styles.sideCardTitle}>Interactive Virtual Labs</Text>
              <Text style={styles.sideCardText}>
                Step into 5 fully interactive biotechnology labs with realistic equipment simulations.
              </Text>
            </View>
          </View>
        )}

        {/* Main Content Area */}
        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View style={styles.topbar}>
            <Pressable style={styles.backBtn} onPress={() => router.push("/")}>
              <Text style={styles.backBtnArrow}>←</Text>
              <Text style={styles.backBtnText}>Dashboard</Text>
            </Pressable>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search experiments, concepts, protocols..."
                placeholderTextColor="#AAA6B8"
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={{ color: C.muted, paddingHorizontal: 6 }}>✕</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              style={styles.avatarBtn}
              onPress={() => router.push((user ? "/profile" : "/login") as any)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              {width >= 700 && (
                <Text style={styles.userName}>{user ? user.name : "Sign In"}</Text>
              )}
            </Pressable>
          </View>

          {/* Header Banner */}
          <View style={styles.headerBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerEyebrow}>EXPERIMENT LIBRARY</Text>
              <Text style={styles.bannerTitle}>Explore Biotechnology Labs</Text>
              <Text style={styles.bannerSubtitle}>
                Master standard molecular biology, microbiology, and immunology laboratory protocols through interactive simulations.
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countNumber}>{filteredExperiments.length}</Text>
              <Text style={styles.countLabel}>AVAILABLE</Text>
            </View>
          </View>

          {/* Filter Bar */}
          <View style={styles.filtersSection}>
            {/* Category Chips */}
            <View style={styles.chipRow}>
              <Text style={styles.filterGroupLabel}>Category:</Text>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Difficulty & Status Chips */}
            <View style={styles.secondFilterRow}>
              <View style={styles.chipRow}>
                <Text style={styles.filterGroupLabel}>Difficulty:</Text>
                {DIFFICULTIES.map((diff) => (
                  <Pressable
                    key={diff}
                    style={[styles.smallChip, selectedDifficulty === diff && styles.smallChipActive]}
                    onPress={() => setSelectedDifficulty(diff)}
                  >
                    <Text style={[styles.smallChipText, selectedDifficulty === diff && styles.smallChipTextActive]}>
                      {diff}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.chipRow}>
                <Text style={styles.filterGroupLabel}>Status:</Text>
                {STATUSES.map((st) => (
                  <Pressable
                    key={st}
                    style={[styles.smallChip, selectedStatus === st && styles.smallChipActive]}
                    onPress={() => setSelectedStatus(st)}
                  >
                    <Text style={[styles.smallChipText, selectedStatus === st && styles.smallChipTextActive]}>
                      {st}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Experiments Cards Grid */}
          <View style={styles.cardsGrid}>
            {filteredExperiments.map((item, index) => {
              const progress = getExpProgress(item.id);
              const palette = [
                { bg: C.lavenderSoft, text: C.lavender, border: "#DCD1FF" },
                { bg: C.peachSoft, text: C.peach, border: "#F6E6CC" },
                { bg: C.pinkSoft, text: C.pink, border: "#FAD3EB" },
                { bg: C.greenSoft, text: C.green, border: "#CEEFE0" },
                { bg: C.blueSoft, text: C.blue, border: "#BAE6FD" },
              ][index % 5];

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: palette.bg }]}>
                      <Text style={[styles.iconText, { color: palette.text }]}>⚗</Text>
                    </View>
                    <View style={styles.badgeGroup}>
                      <View style={[styles.categoryTag, { backgroundColor: palette.bg }]}>
                        <Text style={[styles.categoryTagText, { color: palette.text }]}>{item.category}</Text>
                      </View>
                      <View style={styles.difficultyTag}>
                        <Text style={styles.difficultyTagText}>{item.difficulty}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.experiment}</Text>
                  <Text style={styles.cardAim} numberOfLines={3}>
                    {item.aim}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⏱ {item.estimatedTime}</Text>
                    <Text style={styles.metaText}>
                      {progress === 100 ? "✓ Complete" : progress > 0 ? `${progress}% In Progress` : "Ready to Start"}
                    </Text>
                  </View>

                  {/* Progress Line */}
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: palette.text }]} />
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActionRow}>
                    <Pressable
                      style={styles.detailsBtn}
                      onPress={() => router.push({ pathname: "/experiment", params: { id: String(item.id) } })}
                    >
                      <Text style={styles.detailsBtnText}>Read Theory & Details</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.startLabBtn, { backgroundColor: palette.text }]}
                      onPress={() => router.push(getLabRoute(item.id) as any)}
                    >
                      <Text style={styles.startLabBtnText}>Start Lab ▶</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          {filteredExperiments.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No experiments found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search terms or filter selections.</Text>
              <Pressable
                style={styles.clearBtn}
                onPress={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSelectedStatus("All");
                }}
              >
                <Text style={styles.clearBtnText}>Reset All Filters</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerBrand}>LabSphere AI</Text>
            <Text style={styles.footerText}>Intelligent Virtual Biotechnology Laboratory</Text>
            <Text style={styles.footerCopy}>© 2026 LabSphere AI · All experiments verified for educational accuracy</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, flexDirection: "row", width: "100%" },
  sidebar: {
    width: 260,
    backgroundColor: C.white,
    borderRightWidth: 1,
    borderRightColor: C.line,
    padding: 22,
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 6 },
  brandMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: C.lavenderSoft, alignItems: "center", justifyContent: "center" },
  brandMarkText: { fontSize: 27, color: C.lavender },
  brand: { fontSize: 18, fontWeight: "800", color: C.ink },
  brandAccent: { color: C.lavender },
  brandAI: { color: C.pink, fontWeight: "700" },
  brandSub: { fontSize: 8, letterSpacing: 1.5, color: C.muted, marginTop: 3 },
  navList: { gap: 8, marginTop: 30, flex: 1 },
  navItem: { height: 48, borderRadius: 13, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 13 },
  navItemActive: { backgroundColor: "#A58AEF" },
  navText: { color: C.ink, fontSize: 14, fontWeight: "600" },
  navTextActive: { color: C.white },
  navIcon: { fontSize: 20, width: 22, textAlign: "center", color: C.ink },
  sideCardBox: { backgroundColor: "#F6F1FF", borderRadius: 18, padding: 18, marginBottom: 10 },
  sideCardTitle: { color: C.ink, fontSize: 13, fontWeight: "800", marginBottom: 6 },
  sideCardText: { color: C.muted, fontSize: 11, lineHeight: 16 },

  main: { flex: 1 },
  mainContent: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: width >= 1100 ? 34 : 20,
    paddingBottom: 45,
  },
  topbar: { minHeight: 80, flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  backBtnArrow: { fontSize: 16, color: C.lavender, fontWeight: "800" },
  backBtnText: { fontSize: 12, color: C.ink, fontWeight: "700" },
  searchBox: {
    flex: 1,
    maxWidth: 540,
    height: 46,
    backgroundColor: C.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  searchIcon: { fontSize: 22, color: C.muted, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: C.ink },
  avatarBtn: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.pinkSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#A74F87", fontWeight: "800", fontSize: 12 },
  userName: { color: C.ink, fontSize: 13, fontWeight: "700" },

  headerBanner: {
    backgroundColor: "#EEE7FF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E4DBFA",
    padding: width >= 700 ? 32 : 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 18,
    gap: 20,
  },
  bannerEyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.6, color: C.purpleText, marginBottom: 6 },
  bannerTitle: { fontSize: width >= 800 ? 32 : 24, fontWeight: "800", color: C.ink },
  bannerSubtitle: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 6, maxWidth: 650 },
  countBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  countNumber: { fontSize: 24, fontWeight: "900", color: C.lavender },
  countLabel: { fontSize: 7, fontWeight: "800", color: C.purpleText, letterSpacing: 0.8 },

  filtersSection: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  chipRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  secondFilterRow: { flexDirection: width >= 850 ? "row" : "column", justifyContent: "space-between", gap: 12 },
  filterGroupLabel: { fontSize: 11, fontWeight: "800", color: C.ink, marginRight: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: C.line,
  },
  filterChipActive: { backgroundColor: C.lavender, borderColor: C.lavender },
  filterChipText: { fontSize: 11, fontWeight: "700", color: C.muted },
  filterChipTextActive: { color: C.white },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F8F6FC",
    borderWidth: 1,
    borderColor: C.line,
  },
  smallChipActive: { backgroundColor: C.purpleText, borderColor: C.purpleText },
  smallChipText: { fontSize: 10, fontWeight: "700", color: C.muted },
  smallChipTextActive: { color: C.white },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  card: {
    width: width >= 1150 ? "31.8%" : width >= 750 ? "48.2%" : "100%",
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    padding: 20,
    justifyContent: "space-between",
    boxShadow: "0px 4px 10px rgba(189, 178, 208, 0.2)",
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 24 },
  badgeGroup: { alignItems: "flex-end", gap: 4 },
  categoryTag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  categoryTagText: { fontSize: 9, fontWeight: "800" },
  difficultyTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  difficultyTagText: { fontSize: 8, fontWeight: "700", color: "#475569" },

  cardTitle: { fontSize: 18, fontWeight: "800", color: C.ink, marginBottom: 6 },
  cardAim: { fontSize: 12, lineHeight: 18, color: C.muted, minHeight: 54 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  metaText: { fontSize: 10, fontWeight: "700", color: C.muted },

  progressTrack: { height: 6, backgroundColor: "#F0EDF5", borderRadius: 3, marginVertical: 10, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  cardActionRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  detailsBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F8F6FC",
  },
  detailsBtnText: { fontSize: 10, fontWeight: "700", color: C.ink },
  startLabBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startLabBtnText: { fontSize: 11, fontWeight: "800", color: C.white },

  emptyState: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    padding: 40,
    alignItems: "center",
    gap: 8,
    marginVertical: 20,
  },
  emptyIcon: { fontSize: 36, marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: C.ink },
  emptySubtitle: { fontSize: 12, color: C.muted },
  clearBtn: { backgroundColor: C.lavender, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 10 },
  clearBtnText: { color: C.white, fontSize: 11, fontWeight: "700" },

  footer: { alignItems: "center", paddingTop: 45, gap: 5 },
  footerBrand: { color: C.ink, fontSize: 16, fontWeight: "800" },
  footerText: { color: C.muted, fontSize: 11 },
  footerCopy: { color: "#AAA5B7", fontSize: 9, marginTop: 4 },
});
