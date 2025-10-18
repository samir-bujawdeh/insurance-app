import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PaymentsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>💳 Payments</Text>
    <Text style={styles.subtitle}>View and manage your insurance payments here.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 16, color: "gray", marginTop: 6 },
});

export default PaymentsScreen;
