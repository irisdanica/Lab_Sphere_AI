import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/context/auth";
import LandingScreen from "./landing";
import DashboardScreen from "./dashboard";

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8E70E9" />
      </View>
    );
  }

  if (user) {
    return <DashboardScreen />;
  }

  return <LandingScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F6FB",
    justifyContent: "center",
    alignItems: "center",
  },
});
