import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>🏠 Home</Text>
    <Text style={styles.subtitle}>Welcome to The Insurance App</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 16, color: "gray" },
});

export default HomeScreen;
