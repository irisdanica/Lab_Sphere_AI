import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F8F6FB",
  white: "#FFFFFF",
  ink: "#201E36",
  muted: "#6E6A85",
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
};

const LABS_SHOWCASE = [
  {
    id: 1,
    title: "DNA Extraction",
    category: "Molecular Biology",
    icon: "🧬",
    color: C.lavender,
    bg: C.lavenderSoft,
    desc: "Lyse plant cell membranes using detergent, neutralize charges with salt, and spool isolated strawberry genomic DNA precipitate with chilled ethanol.",
    route: "/labs/dna",
  },
  {
    id: 2,
    title: "Polymerase Chain Reaction (PCR)",
    category: "Molecular Diagnostics",
    icon: "⚡",
    color: C.peach,
    bg: C.peachSoft,
    desc: "Program automated thermal cycling through denaturation (95°C), annealing (55°C), and extension (72°C) to amplify DNA over 1 billion-fold.",
    route: "/labs/pcr",
  },
  {
    id: 3,
    title: "Differential Gram Staining",
    category: "Microbiology",
    icon: "🔬",
    color: C.pink,
    bg: C.pinkSoft,
    desc: "Heat-fix bacterial smears, apply crystal violet and iodine mordant, decolorize with alcohol, and resolve 1000X oil immersion microscopy.",
    route: "/labs/gram-staining",
  },
  {
    id: 4,
    title: "Agarose Gel Electrophoresis",
    category: "Biophysical Chemistry",
    icon: "🧪",
    color: C.blueText,
    bg: C.blueSoft,
    desc: "Cast agarose matrix, load DNA molecular weight ladder, apply 100V electric potential, and analyze resolved bands under UV transillumination.",
    route: "/labs/gel-electrophoresis",
  },
  {
    id: 5,
    title: "ELISA Immunoassay",
    category: "Immunology",
    icon: "🧫",
    color: C.greenText,
    bg: C.greenSoft,
    desc: "Perform 96-well microplate indirect ELISA with primary antibody, secondary HRP conjugate, and 450nm spectrophotometric optical density quantification.",
    route: "/labs/elisa",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Biochemical Theory & Protocol",
    desc: "Study reaction mechanisms, reagent roles, and biosafety precautions before touching lab equipment.",
    icon: "📖",
  },
  {
    step: "02",
    title: "Interactive Virtual Bench",
    desc: "Step onto the simulation bench to pipette reagents, set timers, and operate scientific instruments.",
    icon: "⚗",
  },
  {
    step: "03",
    title: "Knowledge Check & Quiz",
    desc: "Solidify conceptual mastery through 5-question MCQs with immediate answer rationales.",
    icon: "✓",
  },
  {
    step: "04",
    title: "Digital Lab Notebook",
    desc: "Record yields, spectrophotometer readings, and reflections into your verified academic portfolio.",
    icon: "✎",
  },
];

export default function LandingScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
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
            <Text style={styles.brandSub}>VIRTUAL BIOTECHNOLOGY LAB</Text>
          </View>
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={styles.loginBtnText}>Log In</Text>
          </Pressable>
          <Pressable
            style={styles.signupBtn}
            onPress={() => router.push("/signup" as any)}
          >
            <Text style={styles.signupBtnText}>Get Started →</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContainer}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>
              🧬 NEXT-GENERATION BIOTECHNOLOGY EDUCATION
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Step onto the virtual bench.{"\n"}
            <Text style={styles.heroTitleAccent}>
              Turn concepts into mastery.
            </Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            LabSphere AI provides interactive, realistic wet-lab biotechnology
            simulations. Prepare genomic DNA, program thermal cyclers, stain
            bacterial smears, cast agarose gels, and read ELISA optical densities.
          </Text>

          <View style={styles.heroCtaRow}>
            <Pressable
              style={styles.primaryCta}
              onPress={() => router.push("/signup" as any)}
            >
              <Text style={styles.primaryCtaText}>Start Experimenting Free</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryCta}
              onPress={() => router.push("/login" as any)}
            >
              <Text style={styles.secondaryCtaText}>Demo Student Login ⚡</Text>
            </Pressable>
          </View>

          {/* Quick Stats Pill */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>VIRTUAL LABS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>PROCEDURAL FIDELITY</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>AI LAB MENTOR</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>HAZARDOUS WASTE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>ABOUT LABSPHERE AI</Text>
          <Text style={styles.sectionHeading}>
            Bridging Textbook Theory with Hands-On Practice
          </Text>
          <Text style={styles.sectionDesc}>
            Traditional biotechnology laboratory training is constrained by
            expensive reagents, toxic chemicals, and limited bench hours.
            LabSphere AI empowers students and researchers to master standard
            operating protocols with zero risk and unlimited repetitions.
          </Text>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: C.lavenderSoft }]}>
              <Text style={styles.featureEmoji}>🧪</Text>
            </View>
            <Text style={styles.featureTitle}>Realistic Bench Physics</Text>
            <Text style={styles.featureText}>
              Interactive drag-and-drop apparatus, precision pipetting, live
              timers, and spectrophotometric sensor readouts.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: C.peachSoft }]}>
              <Text style={styles.featureEmoji}>🤖</Text>
            </View>
            <Text style={styles.featureTitle}>Contextual AI Mentorship</Text>
            <Text style={styles.featureText}>
              Instant guidance on buffer compositions, reaction kinetics,
              troubleshooting unexpected bubbles, and protocol steps.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: C.pinkSoft }]}>
              <Text style={styles.featureEmoji}>📈</Text>
            </View>
            <Text style={styles.featureTitle}>Learning Analytics</Text>
            <Text style={styles.featureText}>
              Detailed mistake tracking, procedural accuracy ratings, quiz
              assessments, and verified biotechnology badges.
            </Text>
          </View>
        </View>
      </View>

      {/* Virtual Laboratories Showcase */}
      <View style={styles.labsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>5 CORE BIOTECHNOLOGY LABS</Text>
          <Text style={styles.sectionHeading}>
            Explore the Virtual Curriculum
          </Text>
          <Text style={styles.sectionDesc}>
            Each laboratory is a fully interactive simulation featuring realistic
            reagents, equipment, timers, and analytical readouts.
          </Text>
        </View>

        <View style={styles.labsGrid}>
          {LABS_SHOWCASE.map((lab) => (
            <View key={lab.id} style={styles.labCard}>
              <View style={styles.labTopRow}>
                <View style={[styles.labIconBox, { backgroundColor: lab.bg }]}>
                  <Text style={styles.labIcon}>{lab.icon}</Text>
                </View>
                <View style={styles.labCategoryPill}>
                  <Text style={styles.labCategoryText}>{lab.category}</Text>
                </View>
              </View>

              <Text style={styles.labTitle}>{lab.title}</Text>
              <Text style={styles.labDesc}>{lab.desc}</Text>

              <Pressable
                style={styles.labActionBtn}
                onPress={() => router.push("/login" as any)}
              >
                <Text style={styles.labActionText}>Launch Simulation →</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Learning Workflow */}
      <View style={styles.workflowSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
          <Text style={styles.sectionHeading}>The Mastery Workflow</Text>
          <Text style={styles.sectionDesc}>
            A structured pedagogical loop connecting molecular theory directly
            to laboratory execution.
          </Text>
        </View>

        <View style={styles.workflowGrid}>
          {WORKFLOW_STEPS.map((wf) => (
            <View key={wf.step} style={styles.workflowCard}>
              <View style={styles.workflowTop}>
                <Text style={styles.workflowStep}>{wf.step}</Text>
                <Text style={styles.workflowEmoji}>{wf.icon}</Text>
              </View>
              <Text style={styles.workflowTitle}>{wf.title}</Text>
              <Text style={styles.workflowText}>{wf.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* AI Mentor Showcase */}
      <View style={styles.mentorSection}>
        <View style={styles.mentorContainer}>
          <View style={styles.mentorCopy}>
            <View style={styles.mentorTag}>
              <Text style={styles.mentorTagText}>AI TUTOR GROUNDED IN BIOCHEMISTRY</Text>
            </View>
            <Text style={styles.mentorHeading}>
              Meet Your 24/7 Virtual Lab Mentor
            </Text>
            <Text style={styles.mentorBody}>
              Stuck on why cold ethanol is required for DNA spooling? Wondering
              why Gram-negative bacteria decolorize while Gram-positive retain
              violet? Your AI Lab Mentor provides clear, biochemically rigorous
              answers grounded directly in your protocol.
            </Text>
            <Pressable
              style={styles.mentorCta}
              onPress={() => router.push("/signup" as any)}
            >
              <Text style={styles.mentorCtaText}>Try Lab Mentor Free →</Text>
            </Pressable>
          </View>

          <View style={styles.mentorPreview}>
            <View style={styles.chatBubbleUser}>
              <Text style={styles.chatUserText}>
                Why do we add dishwashing liquid to the strawberry puree?
              </Text>
            </View>
            <View style={styles.chatBubbleAi}>
              <Text style={styles.chatAiLabel}>🤖 Lab Mentor AI</Text>
              <Text style={styles.chatAiText}>
                Dishwashing detergent contains amphipathic surfactants. The
                hydrophobic tails dissolve the phospholipid bilayer of the cell
                membrane and nuclear envelope, releasing genomic DNA into the
                solution!
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Call To Action Banner */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to begin your laboratory journey?</Text>
          <Text style={styles.ctaSub}>
            Sign up in seconds to access all 5 interactive virtual laboratories,
            quizzes, digital notebook, and AI mentorship.
          </Text>
          <View style={styles.ctaBtnRow}>
            <Pressable
              style={styles.ctaPrimaryBtn}
              onPress={() => router.push("/signup" as any)}
            >
              <Text style={styles.ctaPrimaryText}>Create Free Account</Text>
            </Pressable>
            <Pressable
              style={styles.ctaSecondaryBtn}
              onPress={() => router.push("/login" as any)}
            >
              <Text style={styles.ctaSecondaryText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBrand}>
          <Text style={styles.footerBrandMark}>⌬</Text>
          <Text style={styles.footerBrandText}>
            Lab<Text style={{ color: C.lavender }}>Sphere</Text> AI
          </Text>
        </View>
        <Text style={styles.footerDesc}>
          An Intelligent Virtual Biotechnology Laboratory with AI-Guided Experiment Learning.
        </Text>
        <Text style={styles.footerCopy}>© 2026 LabSphere AI. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 18,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.lavenderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    fontSize: 24,
    color: C.lavender,
  },
  brand: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
  },
  brandAccent: {
    color: C.lavender,
  },
  brandAI: {
    color: C.pink,
    fontWeight: "800",
  },
  brandSub: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: C.muted,
    marginTop: 2,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  signupBtn: {
    backgroundColor: C.lavender,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    boxShadow: "0px 3px 8px rgba(142, 112, 233, 0.3)",
    elevation: 2,
  },
  signupBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
  },
  heroSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingTop: width >= 800 ? 60 : 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  heroContainer: {
    maxWidth: 960,
    width: "100%",
    alignItems: "center",
  },
  heroTag: {
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.purpleText,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: width >= 800 ? 48 : 32,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
    lineHeight: width >= 800 ? 56 : 40,
    marginBottom: 18,
  },
  heroTitleAccent: {
    color: C.lavender,
  },
  heroSubtitle: {
    fontSize: width >= 800 ? 16 : 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 720,
    marginBottom: 28,
  },
  heroCtaRow: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 40,
  },
  primaryCta: {
    backgroundColor: C.lavender,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    boxShadow: "0px 4px 14px rgba(142, 112, 233, 0.35)",
    elevation: 3,
  },
  primaryCtaText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
  },
  ctaArrow: {
    color: C.white,
    fontSize: 16,
  },
  secondaryCta: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryCtaText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: C.purpleText,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.line,
  },
  aboutSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 50,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 36,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: C.purpleText,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: width >= 800 ? 32 : 24,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
    marginBottom: 10,
  },
  sectionDesc: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    maxWidth: 680,
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: width >= 800 ? "row" : "column",
    gap: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.line,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
  },
  labsSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 50,
    backgroundColor: "#F4EFFC",
  },
  labsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  labCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: C.line,
    justifyContent: "space-between",
  },
  labTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  labIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  labIcon: {
    fontSize: 22,
  },
  labCategoryPill: {
    backgroundColor: C.bg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
  },
  labTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 8,
  },
  labDesc: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 18,
    marginBottom: 18,
  },
  labActionBtn: {
    paddingVertical: 8,
  },
  labActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.purpleText,
  },
  workflowSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 50,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  workflowGrid: {
    flexDirection: width >= 800 ? "row" : "column",
    gap: 16,
  },
  workflowCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  workflowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workflowStep: {
    fontSize: 18,
    fontWeight: "900",
    color: C.lavender,
  },
  workflowEmoji: {
    fontSize: 22,
  },
  workflowTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  workflowText: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 18,
  },
  mentorSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 50,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  mentorContainer: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    padding: width >= 800 ? 40 : 24,
    flexDirection: width >= 900 ? "row" : "column",
    gap: 30,
    alignItems: "center",
  },
  mentorCopy: {
    flex: 1,
  },
  mentorTag: {
    alignSelf: "flex-start",
    backgroundColor: C.lavenderSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  mentorTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: C.purpleText,
  },
  mentorHeading: {
    fontSize: width >= 800 ? 28 : 22,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 10,
  },
  mentorBody: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  mentorCta: {
    alignSelf: "flex-start",
    backgroundColor: C.lavender,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mentorCtaText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
  },
  mentorPreview: {
    flex: 1,
    width: "100%",
    gap: 12,
  },
  chatBubbleUser: {
    backgroundColor: C.lavenderSoft,
    alignSelf: "flex-end",
    padding: 14,
    borderRadius: 16,
    maxWidth: 340,
  },
  chatUserText: {
    fontSize: 12,
    color: C.purpleText,
    fontWeight: "600",
  },
  chatBubbleAi: {
    backgroundColor: C.bg,
    alignSelf: "flex-start",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    maxWidth: 380,
    gap: 6,
  },
  chatAiLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.ink,
  },
  chatAiText: {
    fontSize: 12,
    color: "#3A364F",
    lineHeight: 18,
  },
  ctaSection: {
    paddingHorizontal: width >= 800 ? 40 : 20,
    paddingVertical: 40,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  ctaCard: {
    backgroundColor: "#EEE7FF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#DDD0FB",
    padding: width >= 800 ? 48 : 28,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: width >= 800 ? 30 : 22,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSub: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    maxWidth: 580,
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaBtnRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimaryBtn: {
    backgroundColor: C.lavender,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaPrimaryText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
  },
  ctaSecondaryBtn: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaSecondaryText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.white,
    gap: 8,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerBrandMark: {
    fontSize: 20,
    color: C.lavender,
  },
  footerBrandText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
  },
  footerDesc: {
    fontSize: 11,
    color: C.muted,
  },
  footerCopy: {
    fontSize: 10,
    color: "#AAA5BA",
    marginTop: 4,
  },
});
