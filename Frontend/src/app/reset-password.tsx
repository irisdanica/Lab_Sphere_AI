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
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword } from "@/services/api";

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

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const initialToken = typeof params.token === "string" ? params.token : "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    if (!token.trim()) {
      setErrorMsg("Please enter your reset token.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await resetPassword({
        token: token.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
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

        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          Create a new strong password to secure your LabSphere account.
        </Text>

        {errorMsg.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Password Updated</Text>
            <Text style={styles.successText}>
              Your account password has been successfully updated. You can now sign in with your new credentials.
            </Text>
            <Pressable
              style={styles.loginBtn}
              onPress={() => router.replace("/login" as any)}
            >
              <Text style={styles.loginBtnText}>Go to Login →</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>RESET TOKEN</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste reset token here..."
                placeholderTextColor="#A7A2BA"
                value={token}
                onChangeText={(t) => {
                  setToken(t);
                  setErrorMsg("");
                }}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>NEW PASSWORD (MIN 6 CHARS)</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#A7A2BA"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setErrorMsg("");
                }}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#A7A2BA"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setErrorMsg("");
                }}
                secureTextEntry
              />
            </View>

            <Pressable
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Update Password →</Text>
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
  formGroup: { marginBottom: 14 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
    marginTop: 8,
  },
  submitBtnText: { color: C.white, fontSize: 14, fontWeight: "800" },
  btnDisabled: { opacity: 0.6 },
  successBox: {
    backgroundColor: C.greenSoft,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C3E8D5",
    marginBottom: 16,
  },
  successIcon: { fontSize: 28, color: C.greenText, fontWeight: "900", marginBottom: 6 },
  successTitle: { fontSize: 17, fontWeight: "800", color: C.greenText, marginBottom: 6 },
  successText: { fontSize: 12, color: "#255D40", textAlign: "center", lineHeight: 18, marginBottom: 16 },
  loginBtn: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  loginBtnText: { color: C.white, fontSize: 13, fontWeight: "800" },
  footerRow: {
    alignItems: "center",
    marginTop: 20,
  },
  backLogin: { fontSize: 12, color: C.purpleText, fontWeight: "700" },
});
