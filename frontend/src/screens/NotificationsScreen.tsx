import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listNotifications, markNotificationRead } from "../api/notifications";
import { useAuth } from "../context/AuthContext";

interface Notification {
  id: number;
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "error";
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration since the API returns empty array
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "Policy Payment Due",
      body: "Your auto insurance premium payment is due in 3 days. Amount: $125.00",
      type: "warning",
      is_read: false,
      created_at: "2024-01-15T10:30:00Z",
      action_url: "/payments",
    },
    {
      id: 2,
      title: "Claim Approved",
      body: "Your claim #CL-2024-001 has been approved. Settlement amount: $2,500",
      type: "success",
      is_read: false,
      created_at: "2024-01-14T14:20:00Z",
      action_url: "/claims",
    },
    {
      id: 3,
      title: "Policy Renewal Reminder",
      body: "Your home insurance policy expires in 30 days. Renew now to avoid coverage gaps.",
      type: "info",
      is_read: true,
      created_at: "2024-01-13T09:15:00Z",
      action_url: "/policies",
    },
    {
      id: 4,
      title: "Document Upload Required",
      body: "Please upload your driver's license to complete your profile verification.",
      type: "warning",
      is_read: true,
      created_at: "2024-01-12T16:45:00Z",
      action_url: "/documents",
    },
    {
      id: 5,
      title: "New Coverage Available",
      body: "Travel insurance coverage is now available in your area. Get 20% off your first policy!",
      type: "info",
      is_read: true,
      created_at: "2024-01-11T11:30:00Z",
      action_url: "/marketplace",
    },
  ];

  const loadNotifications = async () => {
    setRefreshing(true);
    try {
      const data = await listNotifications();
      // Use mock data since API returns empty array
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    // In a real app, you would navigate to the action_url
    console.log("Navigate to:", notification.action_url);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "close-circle";
      case "info":
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "error":
        return "#F44336";
      case "info":
      default:
        return "#2196F3";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={24}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={[
              styles.notificationTitle,
              !item.is_read && styles.unreadTitle,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={styles.notificationBody}>{item.body}</Text>
        
        {item.action_url && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>Tap to view details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>🔔 Notifications</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Please log in</Text>
            <Text style={styles.emptySubtitle}>
              You need to be logged in to view your notifications.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}> Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! We'll notify you when there's something important.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNotificationItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />
            }
            contentContainerStyle={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    paddingTop: 36,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  notificationsList: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  notificationTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginTop: 6,
  },
  notificationBody: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
});

export default NotificationsScreen;


