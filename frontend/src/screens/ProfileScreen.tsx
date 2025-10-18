import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Full Name: {user?.full_name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, marginBottom: 10 },
});

export default ProfileScreen;
