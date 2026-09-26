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

export default function SignupScreen() {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
        institution: institution.trim() || "Biotechnology Institute",
      });
      router.replace("/dashboard" as any);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
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

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join thousands of students and researchers learning biotechnology through hands-on virtual simulations.
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
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex Rivera"
            placeholderTextColor="#A7A2BA"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setErrorMsg("");
            }}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="alex.rivera@university.edu"
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
          <Text style={styles.inputLabel}>INSTITUTION / UNIVERSITY (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder="School of Molecular Life Sciences"
            placeholderTextColor="#A7A2BA"
            value={institution}
            onChangeText={setInstitution}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>PASSWORD (MIN 6 CHARACTERS)</Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#A7A2BA"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              setErrorMsg("");
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Create Account →</Text>
          )}
        </Pressable>

        {/* Switch to Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push("/login" as any)}>
            <Text style={styles.loginLink}>Log in</Text>
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
    marginBottom: 18,
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
    marginBottom: 14,
  },
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
    paddingVertical: 11,
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
  submitBtn: {
    backgroundColor: C.lavender,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 12px rgba(142, 112, 233, 0.3)",
    elevation: 3,
    marginTop: 10,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 12,
    color: C.muted,
  },
  loginLink: {
    fontSize: 12,
    fontWeight: "800",
    color: C.purpleText,
  },
  backHomeBtn: {
    alignSelf: "center",
    marginTop: 14,
    paddingVertical: 6,
  },
  backHomeText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
  },
});
