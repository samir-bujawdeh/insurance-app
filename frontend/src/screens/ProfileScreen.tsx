import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, SafeAreaView } from "react-native";
import { AuthContext } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Full Name: {user?.full_name}</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: { flex: 1, backgroundColor: "#F8F9FA", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, marginBottom: 10, marginTop: 20 },
});

export default ProfileScreen;
