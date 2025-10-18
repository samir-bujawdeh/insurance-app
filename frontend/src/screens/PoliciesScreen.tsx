import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PoliciesScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>💼 Policies</Text>
    <Text style={styles.subtitle}>Browse and compare your insurance policies here.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 16, color: "gray", marginTop: 6 },
});

export default PoliciesScreen;
