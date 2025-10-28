import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, SafeAreaView } from "react-native";
import { listNotifications, markNotificationRead } from "../api/notifications";

const NotificationsScreen = () => {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await listNotifications();
      setItems(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Notifications</Text>
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={async () => {
                await markNotificationRead(item.id);
                load();
              }}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  title: { fontSize: 28, fontWeight: "700", marginTop: 8, marginBottom: 16 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: "#FFFFFF" },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardBody: { color: "gray", marginTop: 4 },
});

export default NotificationsScreen;


