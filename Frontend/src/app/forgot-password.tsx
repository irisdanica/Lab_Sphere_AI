import React, { useState } from "react";
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
import { forgotPassword } from "@/services/api";

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
  green: "#55B78A",
  greenSoft: "#E6F6EE",
  greenText: "#1A754D",
  danger: "#E53935",
  dangerSoft: "#FFEBEE",
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequestReset = async () => {
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const token = await forgotPassword(email.trim().toLowerCase());
      setResetToken(token);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* Brand */}
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

        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
          Enter your registered student email and we'll generate a secure password reset token.
        </Text>

        {errorMsg.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {resetToken ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Reset Token Generated</Text>
            <Text style={styles.successText}>
              In a production email service, this link is delivered directly to your inbox. For development, your reset token is:
            </Text>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenText} numberOfLines={2}>
                {resetToken}
              </Text>
            </View>
            <Pressable
              style={styles.continueResetBtn}
              onPress={() =>
                router.push({
                  pathname: "/reset-password",
                  params: { token: resetToken },
                })
              }
            >
              <Text style={styles.continueResetBtnText}>
                Proceed to Reset Password →
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>REGISTERED EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="student@university.edu"
                placeholderTextColor="#A7A2BA"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMsg("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Pressable
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleRequestReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Send Recovery Token →
                </Text>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.footerRow}>
          <Pressable onPress={() => router.push("/login" as any)}>
            <Text style={styles.backLogin}>← Back to Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  container: {
    minHeight: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    padding: width >= 600 ? 36 : 24,
    maxWidth: 480,
    width: "100%",
    boxShadow: "0px 8px 24px rgba(142, 112, 233, 0.12)",
    elevation: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    alignSelf: "center",
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  errorBox: {
    backgroundColor: C.dangerSoft,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 12, color: C.danger, fontWeight: "600" },
  formGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: C.ink,
  },
  submitBtn: {
    backgroundColor: C.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 12px rgba(142, 112, 233, 0.3)",
    elevation: 3,
    marginTop: 6,
  },
  submitBtnText: { color: C.white, fontSize: 14, fontWeight: "800" },
  btnDisabled: { opacity: 0.6 },
  successBox: {
    backgroundColor: C.greenSoft,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C3E8D5",
    marginBottom: 16,
  },
  successIcon: { fontSize: 24, color: C.greenText, fontWeight: "900", marginBottom: 6 },
  successTitle: { fontSize: 16, fontWeight: "800", color: C.greenText, marginBottom: 6 },
  successText: { fontSize: 12, color: "#255D40", textAlign: "center", lineHeight: 17, marginBottom: 12 },
  tokenBox: {
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 14,
  },
  tokenText: { fontSize: 10, color: C.ink, fontFamily: "monospace", textAlign: "center" },
  continueResetBtn: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: "100%",
    alignItems: "center",
  },
  continueResetBtnText: { color: C.white, fontSize: 13, fontWeight: "800" },
  footerRow: {
    alignItems: "center",
    marginTop: 20,
  },
  backLogin: { fontSize: 12, color: C.purpleText, fontWeight: "700" },
});
