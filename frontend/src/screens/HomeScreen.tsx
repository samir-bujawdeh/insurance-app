import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const HomeScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const styles = HomeScreenStyles(theme);
  
  // Animation values for content
  const quickActionsOpacity = useRef(new Animated.Value(0)).current;
  const quickActionsTranslateY = useRef(new Animated.Value(30)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTranslateY = useRef(new Animated.Value(20)).current;
  
  // Animation values for header opacity based on scroll
  const headerTextOpacity = useRef(new Animated.Value(1)).current;
  const headerIconOpacity = useRef(new Animated.Value(1)).current;

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

  // Handle scroll events to animate header opacity
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const headerHeight = 90
    
    // Calculate opacity based on scroll position
    // Start fading when scroll reaches 60px, fully fade at 120px
    const fadeStart = 8;
    const fadeEnd = headerHeight;
    
    if (scrollY <= fadeStart) {
      // Header fully visible
      headerTextOpacity.setValue(1);
      headerIconOpacity.setValue(1);
    } else if (scrollY >= fadeEnd) {
      // Header fully faded
      headerTextOpacity.setValue(0);
      headerIconOpacity.setValue(0);
    } else {
      // Fade between fadeStart and fadeEnd
      const fadeProgress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
      const opacity = 1 - fadeProgress;
      headerTextOpacity.setValue(opacity);
      headerIconOpacity.setValue(opacity);
    }
  };

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
      <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.actionCard }]} onPress={onPress}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: color + "15" },
          ]}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </TouchableOpacity>
    )
  );

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
              <Text style={[styles.headerGreeting, { color: theme.overlay }]}>Welcome</Text>
              <Text style={[styles.headerUserName, { color: theme.textInverse }]}>{user?.name || "User"}</Text>
            </Animated.View>
            <Animated.View style={{ opacity: headerIconOpacity }}>
              <View style={[styles.headerProfileAvatar, { backgroundColor: theme.overlayDark, borderColor: theme.overlayMedium }]}>
                <Ionicons name="person" size={24} color={theme.textInverse} />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Invisible Profile Button - Top Z-Index for Touch Events */}
        <TouchableOpacity
          style={styles.invisibleProfileButton}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={1}
        />

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
          <View style={[styles.contentCard, { backgroundColor: theme.card }]}>

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
          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="medical"
              title="Health"
              subtitle="Health insurance"
              color="#F44336"
              onPress={() =>
                navigation.navigate("Main", { screen: "Policies" })
              }
            />
            <QuickActionCard
              icon="car"
              title="Motor"
              subtitle="Vehicle insurance"
              color="#FF9800"
              onPress={() =>
                navigation.navigate("Main", { screen: "Policies" })
              }
            />
            <QuickActionCard
              icon="airplane"
              title="Travel"
              subtitle="Travel protection"
              color="#4CAF50"
              onPress={() =>
                navigation.navigate("Main", { screen: "Policies" })
              }
            />
            <QuickActionCard
              icon="ellipsis-horizontal"
              title="More"
              subtitle="Other options"
              color="#2196F3"
              onPress={() =>
                navigation.navigate("Main", { screen: "Marketplace" })
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
          <TouchableOpacity style={[styles.promoBanner, { backgroundColor: theme.promoBackground }]}>
            <View style={styles.promoContent}>
              <View style={styles.promoTextContainer}>
                <Text style={[styles.promoTitle, { color: theme.promoText }]}>Compare Feature</Text>
                <Text style={[styles.promoSubtitle, { color: theme.promoTitle }]}>
                  Compare insurance policies and find the best deals
                </Text>
                <View style={[styles.promoButton, { backgroundColor: theme.promoButton }]}>
                  <Text style={styles.promoButtonText}>Try Now</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.textInverse} />
                </View>
              </View>
              <Ionicons
                name="analytics"
                size={64}
                color={theme.promoButton}
                style={styles.promoIcon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
          </View>
        </ScrollView>
        
        {/* Bottom white section positioned absolutely */}
        <View style={[styles.bottomWhiteSection, { backgroundColor: theme.card }]} />
      </LinearGradient>
    </SafeAreaViewContext>
  );
};

const HomeScreenStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 0,
    paddingBottom: 0, // No bottom padding
  },
  fullBackground: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 20, // Moved down from 0
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar
    paddingBottom: 20,
    height: 120, // Reduced height to match scroll calculations
    justifyContent: 'flex-end', // Changed from 'center' to push content down
    zIndex: 5, // Lower than scroll view so white card can cover it
    elevation: 5, // Android elevation
  },
  scrollView: {
    flex: 1,
    zIndex: 10, // Higher than header to cover it
    elevation: 10, // Android elevation
  },
  contentCard: {
    borderTopLeftRadius: 30, // Increased from 20
    borderTopRightRadius: 30, // Increased from 20
    marginTop: 140, // More space for header
    minHeight: '100%', // Ensure it covers the full height
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100, // Extra space to scroll above navigation bar
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
    fontSize: 22, // Increased from 16
    marginBottom: 4,
  },
  headerUserName: {
    fontSize: 34, // Increased from 24
    fontWeight: "700",
  },
  headerProfileButton: {
    padding: 8, // Increased padding for better touch area
    borderRadius: 30, // Make it more touchable
  },
  headerProfileAvatar: {
    width: 52, // Increased from 48
    height: 52, // Increased from 48
    borderRadius: 26, // Increased from 24
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47.5%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.borderLight,
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
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  promoBanner: {
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
    fontWeight: "600",
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  promoButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  promoButtonText: {
    color: theme.textInverse,
    fontSize: 14,
    fontWeight: "600",
  },
  promoIcon: {
    opacity: 0.3,
  },
  bottomWhiteSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Height to cover when scrolling down
    zIndex: 5, // Same as header, below scroll content
    elevation: 5,
  },
  invisibleProfileButton: {
    position: 'absolute',
    top: 70, // Moved up
    right: 20, // Moved to the right
    width: 50, // Made smaller
    height: 50, // Made smaller
    zIndex: 20, // Highest z-index to capture touch events
    elevation: 20,
    backgroundColor: 'transparent', // Invisible
  },
});

export default HomeScreen;