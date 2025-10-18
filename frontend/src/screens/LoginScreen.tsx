import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { loginUser, getCurrentUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginUser(email, password);
      const userData = await getCurrentUser();
      login(userData);
      Alert.alert("Success", `Welcome ${userData.full_name}`);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      Alert.alert("Login failed", err.response?.data?.detail || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don’t have an account? (Sign-up coming soon)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "600", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "gray",
    fontSize: 14,
  },
});

export default LoginScreen;
