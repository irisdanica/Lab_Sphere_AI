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
  danger: "#E53935",
  dangerSoft: "#FFEBEE",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const params = useLocalSearchParams();
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (overrideEmail?: string, overridePwd?: string) => {
    const targetEmail = overrideEmail || email.trim();
    const targetPwd = overridePwd || password;

    if (!targetEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!targetPwd) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await login(targetEmail, targetPwd);
      if (returnTo.includes("?")) {
        const [pathname, query] = returnTo.split("?");
        const p: Record<string, string> = {};
        query.split("&").forEach((part) => {
          const [k, v] = part.split("=");
          p[k] = v;
        });
        router.replace({ pathname, params: p } as any);
      } else {
        router.replace(returnTo as any);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("demo@labsphere.ai");
    setPassword("Password123!");
    handleLogin("demo@labsphere.ai", "Password123!");
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* Brand Header */}
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

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to access your personal laboratory workbench, simulations, and notes.
        </Text>

        {/* Error Alert */}
        {errorMsg.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
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

        <View style={styles.formGroup}>
          <View style={styles.pwdLabelRow}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <Pressable
              onPress={() => router.push("/forgot-password" as any)}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          </View>
          <View style={styles.pwdInputWrapper}>
            <TextInput
              style={styles.pwdInput}
              placeholder="••••••••••••"
              placeholderTextColor="#A7A2BA"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrorMsg("");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Remember Session */}
        <Pressable
          style={styles.rememberRow}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember my session on this device</Text>
        </Pressable>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={() => handleLogin()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In →</Text>
          )}
        </Pressable>

        {/* Demo Fast Login */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR EXPLORE DEMO</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={styles.demoBtn}
          onPress={handleQuickDemo}
          disabled={loading}
        >
          <Text style={styles.demoBtnIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>1-Click Demo Login</Text>
            <Text style={styles.demoBtnSub}>demo@labsphere.ai • Full pre-loaded student portfolio</Text>
          </View>
          <Text style={styles.demoArrow}>→</Text>
        </Pressable>

        {/* Switch to Signup */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to LabSphere AI?</Text>
          <Pressable onPress={() => router.push("/signup" as any)}>
            <Text style={styles.signupLink}>Create an account</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.backHomeBtn}
          onPress={() => router.push("/" as any)}
        >
          <Text style={styles.backHomeText}>← Back to Public Overview</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.dangerSoft,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 14,
    color: C.danger,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
    fontWeight: "600",
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
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
  pwdLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: "700",
    color: C.purpleText,
  },
  pwdInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
  },
  pwdInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: C.ink,
  },
  eyeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.purpleText,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: C.lavender,
    borderColor: C.lavender,
  },
  checkMark: {
    color: C.white,
    fontSize: 11,
    fontWeight: "900",
  },
  rememberText: {
    fontSize: 12,
    color: C.muted,
  },
  submitBtn: {
    backgroundColor: C.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 12px rgba(142, 112, 233, 0.3)",
    elevation: 3,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.line,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.8,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.peachSoft,
    borderWidth: 1,
    borderColor: "#FFDFBA",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  demoBtnIcon: {
    fontSize: 20,
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B45B0A",
  },
  demoBtnSub: {
    fontSize: 10,
    color: "#8C4A0E",
    marginTop: 2,
  },
  demoArrow: {
    fontSize: 16,
    color: "#B45B0A",
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: C.muted,
  },
  signupLink: {
    fontSize: 12,
    fontWeight: "800",
    color: C.purpleText,
  },
  backHomeBtn: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 6,
  },
  backHomeText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
  },
});
