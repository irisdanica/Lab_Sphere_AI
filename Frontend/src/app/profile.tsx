import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/auth";
import {
  Achievement,
  ActivityItem,
  getAchievements,
  getActivity,
  getAllProgress,
  ProgressOverview,
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
  blueSoft: "#E5F2FF",
  blueText: "#2C73D2",
  green: "#55B78A",
  greenSoft: "#E6F6EE",
  greenText: "#1F7A52",
  danger: "#E53935",
  dangerSoft: "#FFEBEE",
};

export default function ProfileScreen() {
  const { user, logout, updateUser, isLoading: authLoading } = useAuth();

  const [selectedCert, setSelectedCert] = useState<Achievement | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace({ pathname: "/login", params: { returnTo: "/profile" } } as any);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      loadProfileData();
      setEditName(user.name || "");
      setEditInstitution(user.institution || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [achs, acts, prog] = await Promise.all([
        getAchievements(),
        getActivity(),
        getAllProgress(),
      ]);
      setAchievements(achs);
      setActivities(acts);
      setOverview(prog);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await updateUser({
        name: editName.trim(),
        institution: editInstitution.trim(),
        bio: editBio.trim(),
      });
      setEditModalVisible(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.lavender} />
      </View>
    );
  }

  const initials = (user?.name || "Student")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const completedCount = overview?.summary.completed_experiments || 0;
  const avgScore = overview?.summary.average_lab_score || 0;
  const unlockedBadgesCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={styles.page}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/dashboard" as any)}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Dashboard</Text>
          </Pressable>
          <View>
            <Text style={styles.pageTitle}>Student Profile & Honors</Text>
            <Text style={styles.pageSubtitle}>
              Academic credentials, virtual certifications, and bio-laboratory badges
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.editBtn}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editBtnText}>Edit Profile ✎</Text>
          </Pressable>
          <Pressable style={styles.logoutHeaderBtn} onPress={handleLogout}>
            <Text style={styles.logoutHeaderText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroMain}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.heroText}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName}>
                  {user?.name || "Student Researcher"}
                </Text>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedText}>CERTIFIED STUDENT ✓</Text>
                </View>
              </View>

              <Text style={styles.academicTitle}>
                {user?.role || "Undergraduate Researcher"} • {user?.institution || "Biotechnology Institute"}
              </Text>
              <Text style={styles.institution}>
                Email: {user?.email} • Lab ID: {user?.lab_id || "LS-2026-BIO-001"}
              </Text>
              <Text style={styles.bio}>
                {user?.bio ||
                  "Enthusiastic virtual biotechnology student exploring molecular biology, immunology, and genetic assays."}
              </Text>
            </View>
          </View>

          {/* Quick Stats Strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{completedCount} / 5</Text>
              <Text style={styles.statLbl}>VIRTUAL LABS</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>
                {avgScore > 0 ? `${avgScore}%` : "100%"}
              </Text>
              <Text style={styles.statLbl}>ACCURACY RATING</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{unlockedBadgesCount}</Text>
              <Text style={styles.statLbl}>HONORS EARNED</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>Active</Text>
              <Text style={styles.statLbl}>ACADEMIC STATUS</Text>
            </View>
          </View>
        </View>

        {/* Certifications & Badges Grid */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionSubtitle}>EARNED CREDENTIALS</Text>
            <Text style={styles.sectionTitle}>
              Virtual Laboratory Certifications
            </Text>
          </View>
        </View>

        <View style={styles.certsGrid}>
          {achievements.map((cert) => {
            const isUnlocked = cert.unlocked;
            return (
              <Pressable
                key={cert.id}
                style={[styles.certCard, !isUnlocked && styles.certCardLocked]}
                onPress={() => isUnlocked && setSelectedCert(cert)}
              >
                <View style={styles.certCardTop}>
                  <View
                    style={[
                      styles.certIconBox,
                      {
                        backgroundColor: isUnlocked
                          ? C.lavenderSoft
                          : "#F1F0F5",
                      },
                    ]}
                  >
                    <Text style={styles.certIconText}>
                      {isUnlocked ? cert.icon : "🔒"}
                    </Text>
                  </View>
                  <View style={styles.certMeta}>
                    <Text style={styles.certCategory}>{cert.category}</Text>
                    <Text style={styles.certDate}>
                      {isUnlocked ? cert.date : "In Progress"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.certTitle}>{cert.title}</Text>
                <Text style={styles.certDesc} numberOfLines={3}>
                  {cert.desc}
                </Text>

                <View style={styles.certFooter}>
                  <Text style={styles.certCode}>{cert.code}</Text>
                  <View style={styles.badgePill}>
                    <Text
                      style={[
                        styles.badgePillText,
                        !isUnlocked && { color: C.muted },
                      ]}
                    >
                      {isUnlocked ? "View Credential →" : "Locked 🔒"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Recent Activity Timeline */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionSubtitle}>LABORATORY LOG</Text>
            <Text style={styles.sectionTitle}>Recent Practical Activity</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          {activities.length === 0 ? (
            <Text style={{ color: C.muted, padding: 12 }}>
              No recent activity recorded. Start an experiment to build your lab log!
            </Text>
          ) : (
            activities.map((act, index) => (
              <View
                key={act.id || index}
                style={[
                  styles.activityRow,
                  index === activities.length - 1 && styles.activityRowLast,
                ]}
              >
                <View style={styles.activityIconBox}>
                  <Text style={styles.activityIcon}>{act.icon}</Text>
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityTop}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                  <Text style={styles.activityDetail}>{act.detail}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Certification Details Modal */}
      {selectedCert && (
        <Modal
          visible={!!selectedCert}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCert(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalTop}>
                <View
                  style={[
                    styles.certModalIcon,
                    { backgroundColor: C.lavenderSoft },
                  ]}
                >
                  <Text style={styles.certModalIconText}>
                    {selectedCert.icon}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedCert(null)}
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedShield}>🛡</Text>
                <Text style={styles.verifiedLabel}>
                  LABSPHERE AI VERIFIED CREDENTIAL
                </Text>
              </View>

              <Text style={styles.modalCertTitle}>{selectedCert.title}</Text>
              <Text style={styles.modalCertCategory}>
                Field: {selectedCert.category} • Awarded to: {user?.name || "Student"}
              </Text>

              <View style={styles.modalDivider} />

              <Text style={styles.modalBodyTitle}>COMPETENCY ATTAINMENT</Text>
              <Text style={styles.modalBodyText}>{selectedCert.desc}</Text>

              <View style={styles.credentialBox}>
                <View>
                  <Text style={styles.credentialLabel}>CREDENTIAL ID</Text>
                  <Text style={styles.credentialValue}>
                    {selectedCert.code}
                  </Text>
                </View>
                <Pressable
                  style={styles.copyBtn}
                  onPress={() => {
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedCode ? "Copied! ✓" : "Copy ID"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setSelectedCert(null)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
                <Pressable
                  style={styles.verifyBtn}
                  onPress={() => setSelectedCert(null)}
                >
                  <Text style={styles.verifyBtnText}>Add to Resume ✓</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Edit Student Profile</Text>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={{ gap: 14, marginTop: 10 }}>
              <View>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your full name"
                  placeholderTextColor="#AAA"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>INSTITUTION / DEPARTMENT</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editInstitution}
                  onChangeText={setEditInstitution}
                  placeholder="University / Institute name"
                  placeholderTextColor="#AAA"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>BIOGRAPHICAL NOTE / RESEARCH FOCUS</Text>
                <TextInput
                  style={[styles.modalInput, { minHeight: 80 }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell us about your biotechnology interests..."
                  placeholderTextColor="#AAA"
                  multiline
                />
              </View>
            </View>

            <View style={[styles.modalActions, { marginTop: 24 }]}>
              <Pressable
                style={styles.closeBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.verifyBtn,
                  (!editName.trim() || savingProfile) && { opacity: 0.6 },
                ]}
                onPress={handleSaveProfile}
                disabled={!editName.trim() || savingProfile}
              >
                <Text style={styles.verifyBtnText}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
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
  headerActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  editBtn: {
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  editBtnText: {
    color: C.purpleText,
    fontSize: 12,
    fontWeight: "700",
  },
  logoutHeaderBtn: {
    backgroundColor: C.dangerSoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  logoutHeaderText: {
    color: C.danger,
    fontSize: 12,
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
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 28,
    boxShadow: "0px 4px 14px rgba(142, 112, 233, 0.08)",
  },
  heroMain: {
    flexDirection: width >= 768 ? "row" : "column",
    alignItems: width >= 768 ? "center" : "flex-start",
    gap: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.lavender,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.green,
    borderWidth: 2.5,
    borderColor: C.white,
  },
  heroText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
  },
  verifiedPill: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: C.greenText,
    fontSize: 10,
    fontWeight: "800",
  },
  academicTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.purpleText,
    marginBottom: 4,
  },
  institution: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 8,
  },
  bio: {
    fontSize: 13,
    color: "#48435C",
    lineHeight: 19,
  },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statCol: {
    alignItems: "center",
  },
  statNum: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
  },
  statLbl: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: C.line,
  },
  sectionHeaderRow: {
    marginBottom: 16,
    marginTop: 4,
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
  certsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  certCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  certCardLocked: {
    opacity: 0.75,
    backgroundColor: "#FAF9FD",
  },
  certCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  certIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  certIconText: {
    fontSize: 22,
  },
  certMeta: {
    alignItems: "flex-end",
  },
  certCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },
  certDate: {
    fontSize: 10,
    color: "#AAA6B8",
    marginTop: 2,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  certDesc: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
    marginBottom: 16,
  },
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F4EFF8",
    paddingTop: 12,
  },
  certCode: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.purpleText,
  },
  activityCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 24,
  },
  activityRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F4EFF8",
  },
  activityRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  activityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  activityTime: {
    fontSize: 11,
    color: "#AAA6B8",
  },
  activityDetail: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 15, 35, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: C.white,
    borderRadius: 24,
    maxWidth: 500,
    width: "100%",
    padding: 28,
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
  },
  certModalIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  certModalIconText: {
    fontSize: 28,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3EFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 14,
    color: C.ink,
    fontWeight: "700",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  verifiedShield: {
    fontSize: 12,
    color: C.purpleText,
  },
  verifiedLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.purpleText,
    letterSpacing: 0.5,
  },
  modalCertTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 4,
  },
  modalCertCategory: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: C.line,
    marginBottom: 16,
  },
  modalBodyTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalBodyText: {
    fontSize: 13,
    color: "#4A4660",
    lineHeight: 19,
    marginBottom: 20,
  },
  credentialBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 24,
  },
  credentialLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
  },
  credentialValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.ink,
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.purpleText,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
  },
  verifyBtn: {
    backgroundColor: C.lavender,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.ink,
  },
});
