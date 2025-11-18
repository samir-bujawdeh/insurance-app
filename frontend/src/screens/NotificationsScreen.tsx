import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { listNotifications, markNotificationRead } from "../api/notifications";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

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
  const { theme } = useTheme();
  const styles = NotificationsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { markAsRead: markAsReadInContext } = useNotifications();
  
  // Animation values for header opacity based on scroll
  const headerTextOpacity = useRef(new Animated.Value(1)).current;
  const headerIconOpacity = useRef(new Animated.Value(1)).current;

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
      // Use API data if available, otherwise fall back to mock data
      if (data && Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      } else {
        // Use mock data since API returns empty array or no data
        setNotifications(mockNotifications);
      }
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      // Check if it's a network error
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
        // Network error - backend might not be reachable, use mock data
        console.warn("Backend not reachable, using mock notifications");
        setNotifications(mockNotifications);
      } else {
        // Other errors - show alert but still use mock data
        console.warn("API error, using mock notifications");
        setNotifications(mockNotifications);
      }
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
      // Update context so TabNavigator badge updates
      markAsReadInContext(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Still update context even on error since we've marked it read locally
      markAsReadInContext(notificationId);
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

  // Handle scroll events to animate header opacity
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const headerHeight = 90;
    
    // Calculate opacity based on scroll position
    const fadeStart = 8;
    const fadeEnd = headerHeight;
    
    if (scrollY <= fadeStart) {
      headerTextOpacity.setValue(1);
      headerIconOpacity.setValue(1);
    } else if (scrollY >= fadeEnd) {
      headerTextOpacity.setValue(0);
      headerIconOpacity.setValue(0);
    } else {
      const fadeProgress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
      const opacity = 1 - fadeProgress;
      headerTextOpacity.setValue(opacity);
      headerIconOpacity.setValue(opacity);
    }
  };

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
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + "15" }]}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.notificationTextContainer}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.notificationTitle,
                !item.is_read && styles.unreadTitle,
              ]}>
                {item.title}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notificationTime}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.notificationBody}>{item.body}</Text>
        
        {item.action_url && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>View details</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.accent} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <SafeAreaViewContext style={styles.safeArea} edges={['left', 'right']}>
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fullBackground}
        >
          <View style={styles.fixedHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerGreeting}>Notifications</Text>
                <Text style={styles.headerUserName}>Please log in</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaViewContext>
    );
  }

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={['left', 'right']}>
      {/* Full Background Gradient */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fullBackground}
      >
        {/* Fixed Header Content */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <Animated.View style={[styles.headerTextContainer, { opacity: headerTextOpacity }]}>
              <Text style={styles.headerGreeting}>Notifications</Text>
            </Animated.View>
            <Animated.View style={{ opacity: headerIconOpacity }}>
              <View style={styles.headerProfileAvatar}>
                <Ionicons name="notifications" size={24} color={theme.textInverse} />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* White Content Card */}
          <View style={styles.contentCard}>

            {/* Notifications List */}
            <View style={styles.section}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="notifications-outline" size={64} color={theme.textSecondary} />
                  </View>
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
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom white section positioned absolutely */}
        <View style={styles.bottomWhiteSection} />
      </LinearGradient>
    </SafeAreaViewContext>
  );
};

const NotificationsScreenStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 0,
    paddingBottom: 0,
  },
  fullBackground: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    height: 120,
    justifyContent: 'flex-end',
    zIndex: 5,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },
  contentCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 140,
    minHeight: '100%',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 34,
    fontWeight: "700",
    color: theme.textInverse,
  },
  headerUserName: {
    fontSize: 22,
    color: theme.overlay,
  },
  headerProfileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.overlayDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.overlayMedium,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textTertiary,
    textAlign: "center",
    lineHeight: 24,
  },
  notificationsList: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
    borderColor: theme.promoBackground,
  },
  notificationContent: {
    padding: 14,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  notificationTime: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  notificationBody: {
    fontSize: 13,
    color: theme.textTertiary,
    lineHeight: 18,
    marginBottom: 8,
    marginLeft: 52,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 52,
    marginTop: 4,
  },
  actionText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
  },
  bottomWhiteSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.card,
    height: 200,
    zIndex: 5,
    elevation: 5,
  },
});

export default NotificationsScreen;


