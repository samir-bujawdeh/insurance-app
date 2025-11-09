import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const PaymentsScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.title}>💳 Payments</Text>
      <Text style={styles.subtitle}>View and manage your insurance payments here.</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: "#FFFFFF",
  },
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA", 
    alignItems: "center", 
    justifyContent: "center",
    paddingTop: 36,
    paddingBottom: 36,
  },
  title: { fontSize: 22, fontWeight: "600", marginTop: 20 },
  subtitle: { fontSize: 16, color: "gray", marginTop: 6 },
});

export default PaymentsScreen;
