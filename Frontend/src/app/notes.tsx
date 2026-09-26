import React, { useEffect, useState } from "react";
import {
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
import {
  addNote,
  deleteNote,
  getNotes,
  LabNote,
  updateNote,
  FALLBACK_EXPERIMENTS,
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
  cardHover: "#FAF8FD",
  danger: "#E53935",
  dangerSoft: "#FFEBEE",
};

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LabNote[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Editor Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteExpId, setNoteExpId] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [selectedExpId, user]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes(selectedExpId || undefined);
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteExpId(selectedExpId || 1);
    setModalVisible(true);
  };

  const handleEditNote = (note: LabNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteExpId(note.experiment_id);
    setModalVisible(true);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    await loadNotes();
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSaving(true);
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, {
          title: noteTitle.trim(),
          content: noteContent.trim(),
        });
      } else {
        const targetExp =
          FALLBACK_EXPERIMENTS.find((e) => e.id === noteExpId) ||
          FALLBACK_EXPERIMENTS[0];
        await addNote({
          experiment_id: noteExpId,
          experiment_name: targetExp.experiment,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        });
      }
      setModalVisible(false);
      await loadNotes();
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.experiment_name.toLowerCase().includes(q)
    );
  });

  const getExpBadgeColor = (expId: number) => {
    switch (expId) {
      case 1:
        return { bg: C.lavenderSoft, text: C.purpleText };
      case 2:
        return { bg: C.peachSoft, text: "#C06B15" };
      case 3:
        return { bg: C.pinkSoft, text: "#D03B8D" };
      case 4:
        return { bg: C.blueSoft, text: C.blueText };
      case 5:
        return { bg: C.greenSoft, text: "#227C55" };
      default:
        return { bg: C.lavenderSoft, text: C.purpleText };
    }
  };

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
            <Text style={styles.pageTitle}>Digital Lab Notebook</Text>
            <Text style={styles.pageSubtitle}>
              Document observations, protocol adjustments, and biochemical insights
            </Text>
          </View>
        </View>

        <Pressable style={styles.newButton} onPress={handleOpenNewNote}>
          <Text style={styles.newButtonIcon}>+</Text>
          <Text style={styles.newButtonText}>New Note</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI summary strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{notes.length}</Text>
            <Text style={styles.statLabel}>TOTAL ENTRIES</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {new Set(notes.map((n) => n.experiment_id)).size}
            </Text>
            <Text style={styles.statLabel}>EXPERIMENTS RECORDED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {user ? user.name : "Guest Researcher"}
            </Text>
            <Text style={styles.statLabel}>
              {user ? "LAB INVESTIGATOR" : "GUEST MODE"}
            </Text>
          </View>
        </View>

        {!user && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestBannerText}>
              💡 You are currently working in guest mode.{" "}
              <Text
                style={styles.guestBannerLink}
                onPress={() => router.push("/login?returnTo=/notes" as any)}
              >
                Sign in or register
              </Text>{" "}
              to save research notes permanently to your cloud profile.
            </Text>
          </View>
        )}

        {/* Filter & Search Bar */}
        <View style={styles.filterSection}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by keywords, observations, reagents..."
              placeholderTextColor="#A7A2BA"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsRow}
          >
            <Pressable
              style={[
                styles.chip,
                selectedExpId === null && styles.chipActive,
              ]}
              onPress={() => setSelectedExpId(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedExpId === null && styles.chipTextActive,
                ]}
              >
                All Experiments
              </Text>
            </Pressable>

            {FALLBACK_EXPERIMENTS.map((exp) => {
              const active = selectedExpId === exp.id;
              return (
                <Pressable
                  key={exp.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedExpId(active ? null : exp.id)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {exp.experiment}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✎</Text>
            <Text style={styles.emptyTitle}>No lab notes found</Text>
            <Text style={styles.emptyText}>
              {search
                ? "No entries match your search query."
                : "Capture your first experimental observation, reagent measurement, or procedural note."}
            </Text>
            <Pressable
              style={styles.emptyActionButton}
              onPress={handleOpenNewNote}
            >
              <Text style={styles.emptyActionText}>+ Write Lab Note</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.notesGrid}>
            {filteredNotes.map((note) => {
              const badge = getExpBadgeColor(note.experiment_id);
              return (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteTop}>
                    <View
                      style={[
                        styles.expBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Text
                        style={[styles.expBadgeText, { color: badge.text }]}
                      >
                        {note.experiment_name}
                      </Text>
                    </View>
                    <Text style={styles.noteDate}>{note.date}</Text>
                  </View>

                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteContent}>{note.content}</Text>

                  <View style={styles.noteFooter}>
                    <Pressable
                      style={styles.protocolLink}
                      onPress={() =>
                        router.push({
                          pathname: "/experiment",
                          params: { id: String(note.experiment_id) },
                        })
                      }
                    >
                      <Text style={styles.protocolLinkText}>
                        View Protocol →
                      </Text>
                    </Pressable>

                    <View style={styles.cardActions}>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => handleEditNote(note)}
                      >
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, styles.deleteBtn]}
                        onPress={() => handleDeleteNote(note.id)}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Note Editor Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingNoteId ? "Edit Lab Note" : "New Lab Observation"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Record your observations, yields, and protocol deviations
                </Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Experiment Selector */}
              <Text style={styles.inputLabel}>ASSOCIATED EXPERIMENT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.expSelectScroll}
                contentContainerStyle={styles.expSelectRow}
              >
                {FALLBACK_EXPERIMENTS.map((e) => {
                  const sel = noteExpId === e.id;
                  return (
                    <Pressable
                      key={e.id}
                      style={[
                        styles.expOption,
                        sel && styles.expOptionSelected,
                      ]}
                      onPress={() => setNoteExpId(e.id)}
                    >
                      <Text
                        style={[
                          styles.expOptionText,
                          sel && styles.expOptionTextSelected,
                        ]}
                      >
                        {e.experiment}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Title input */}
              <Text style={styles.inputLabel}>NOTE TITLE</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="e.g. Strawberry DNA yield & precipitate purity"
                placeholderTextColor="#A7A2BA"
                value={noteTitle}
                onChangeText={setNoteTitle}
              />

              {/* Content input */}
              <Text style={styles.inputLabel}>OBSERVATIONS & PROTOCOL NOTES</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Describe your qualitative observations, spectrophotometer values, unexpected bubbles, or troubleshooting findings..."
                placeholderTextColor="#A7A2BA"
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSave,
                  (!noteTitle.trim() || !noteContent.trim() || saving) &&
                    styles.modalSaveDisabled,
                ]}
                onPress={handleSaveNote}
                disabled={!noteTitle.trim() || !noteContent.trim() || saving}
              >
                <Text style={styles.modalSaveText}>
                  {saving ? "Saving..." : "Save Observation"}
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
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.lavender,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  newButtonIcon: {
    color: C.white,
    fontSize: 18,
    fontWeight: "800",
  },
  newButtonText: {
    color: C.white,
    fontSize: 14,
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
  statsStrip: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: C.ink,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: C.line,
  },
  filterSection: {
    marginBottom: 20,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    color: C.muted,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
  },
  clearSearch: {
    fontSize: 14,
    color: C.muted,
    paddingHorizontal: 6,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActive: {
    backgroundColor: C.lavender,
    borderColor: C.lavender,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  chipTextActive: {
    color: C.white,
  },
  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 42,
    color: C.lavender,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    maxWidth: 420,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionButton: {
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    color: C.purpleText,
    fontSize: 13,
    fontWeight: "700",
  },
  notesGrid: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  noteTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  expBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  noteDate: {
    fontSize: 11,
    color: C.muted,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 13,
    color: "#4A4660",
    lineHeight: 20,
    marginBottom: 16,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F2EEF8",
    paddingTop: 12,
  },
  protocolLink: {
    paddingVertical: 4,
  },
  protocolLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.purpleText,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.lavenderSoft,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.purpleText,
  },
  deleteBtn: {
    backgroundColor: C.dangerSoft,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20, 15, 35, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    maxWidth: 580,
    width: "100%",
    padding: 24,
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
  },
  modalSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3EFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 13,
    color: C.ink,
    fontWeight: "700",
  },
  modalBody: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  expSelectScroll: {
    flexGrow: 0,
  },
  expSelectRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  expOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
  },
  expOptionSelected: {
    backgroundColor: C.lavenderSoft,
    borderColor: C.lavender,
  },
  expOptionText: {
    fontSize: 11,
    color: C.ink,
    fontWeight: "600",
  },
  expOptionTextSelected: {
    color: C.purpleText,
    fontWeight: "700",
  },
  titleInput: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: C.ink,
  },
  contentInput: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: C.ink,
    minHeight: 120,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
  },
  modalSave: {
    backgroundColor: C.lavender,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
  },
  guestBanner: {
    backgroundColor: C.lavenderSoft,
    borderWidth: 1,
    borderColor: "#DDD4F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
