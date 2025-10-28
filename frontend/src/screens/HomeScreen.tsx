import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const quickActionsOpacity = useRef(new Animated.Value(0)).current;
  const quickActionsTranslateY = useRef(new Animated.Value(30)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate quick actions
    Animated.timing(quickActionsOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(quickActionsTranslateY, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate banner with delay
    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(bannerTranslateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 100);
  }, []);

  const QuickActionCard = React.memo(
    ({
      icon,
      title,
      subtitle,
      onPress,
      color,
    }: {
      icon: string;
      title: string;
      subtitle: string;
      onPress: () => void;
      color: string;
    }) => (
      <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: color + "15" },
          ]}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={20} color="#007AFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Cover Card with gradient */}
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverCard}
          >
            <View style={styles.coverCardContent}>
              <View style={styles.coverTextContainer}>
                <Text style={styles.coverTitle}>Total Coverage</Text>
                <Text style={styles.coverAmount}>$250,000</Text>
                <Text style={styles.coverSubtext}>Across 3 active policies</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Section with animation */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: quickActionsOpacity,
              transform: [{ translateY: quickActionsTranslateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="document-text"
              title="My Policies"
              subtitle="View & manage"
              color="#2196F3"
              onPress={() =>
                navigation.navigate("Main", { screen: "Policies" })
              }
            />
            <QuickActionCard
              icon="clipboard"
              title="File Claim"
              subtitle="Get started"
              color="#FF9800"
              onPress={() =>
                navigation.navigate("Main", { screen: "Claims" })
              }
            />
            <QuickActionCard
              icon="card"
              title="Make Payment"
              subtitle="Pay premium"
              color="#4CAF50"
              onPress={() =>
                navigation.navigate("Main", { screen: "Policies" })
              }
            />
            <QuickActionCard
              icon="add-circle"
              title="Buy Policy"
              subtitle="Get covered"
              color="#9C27B0"
              onPress={() =>
                navigation.navigate("Main", { screen: "+" })
              }
            />
          </View>
        </Animated.View>

        {/* Promotional Banner with fade-in animation */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: bannerOpacity,
              transform: [{ translateY: bannerTranslateY }],
            },
          ]}
        >
          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Special Offer</Text>
                <Text style={styles.promoSubtitle}>
                  Save up to 25% on Travel Insurance
                </Text>
                <View style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Learn More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
              <Ionicons
                name="airplane"
                size={64}
                color="#1976D2"
                style={styles.promoIcon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  iconButton: {
    position: "relative",
    padding: 4,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BBDEFB",
  },
  coverCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
  },
  coverCardContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  coverTextContainer: {
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  coverAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  coverSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  promoBanner: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  promoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    color: "#1565C0",
    fontWeight: "600",
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D47A1",
    marginBottom: 12,
  },
  promoButton: {
    flexDirection: "row",
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  promoIcon: {
    opacity: 0.3,
  },
});

export default HomeScreen;
