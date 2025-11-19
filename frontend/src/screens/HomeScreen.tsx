import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { BlurView } from "expo-blur";
import { getMyPolicies } from "../api/policies";
import { Linking } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Neumorphic Action Card Component
const NeumorphicActionCard = React.memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    color,
    index,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color: string;
    index: number;
  }) => {
    const { theme, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(50)).current;
    const scaleEntrance = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      // Staggered entrance animation
      const delay = index * 100;
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleEntrance, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 300,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (Platform.OS !== "web") {
        try {
          const Haptics = require("expo-haptics");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
          // Haptics not available
        }
      }
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePress = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          tension: 400,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (Platform.OS !== "web") {
        try {
          const Haptics = require("expo-haptics");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          // Haptics not available
        }
      }
      
      setTimeout(() => onPress(), 100);
    };

    const cardAnimatedStyle = {
      transform: [
        { scale: Animated.multiply(scaleAnim, scaleEntrance) },
      ],
      opacity: opacityAnim,
    };

    const iconAnimatedStyle = {
      transform: [
        {
          scale: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }),
        },
      ],
    };

    const shadowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isDark ? 0.5 : 0.15, isDark ? 0.7 : 0.35],
    });

    const styles = getNeumorphicCardStyles(theme, isDark, color);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: translateYAnim },
              { scale: scaleEntrance },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={styles.touchable}
        >
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            {/* Neumorphic shadow layers */}
            <View style={styles.shadowLight} />
            <Animated.View
              style={[
                styles.shadowDark,
                {
                  shadowOpacity: shadowOpacity,
                },
              ]}
            />

            {/* Main card content */}
            <View style={styles.cardContent}>
              <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <LinearGradient
                  colors={[color + "20", color + "10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name={icon as any} size={24} color={color} />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Single Ad Banner Component
const AdBanner = React.memo(({
  title,
  subtitle,
  buttonText,
  icon,
  backgroundColor,
  textColor,
  iconColor,
  buttonColor,
  onPress,
  index,
  isFirst,
  isLast,
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  buttonColor: string;
  onPress: () => void;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation with delay based on index
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        delay: 400 + (index * 100),
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        delay: 400 + (index * 100),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 7,
      useNativeDriver: true,
    }).start();
    
    if (Platform.OS !== "web") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Haptics not available
      }
    }
    onPress();
  };

  const bannerAnimatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  const styles = getBannerStyles(theme);

  return (
    <View style={styles.bannerSlide}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
      >
        <Animated.View style={[styles.banner, bannerAnimatedStyle]}>
          {/* Background */}
          <View style={[styles.bannerBackground, { backgroundColor }]} />

          {/* Content */}
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={[styles.promoTitle, { color: textColor }]}>{title}</Text>
              <Text 
                style={[styles.promoSubtitle, { color: textColor }]}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {subtitle}
              </Text>
              <View style={[styles.promoButton, { backgroundColor: buttonColor }]}>
                <Text style={styles.promoButtonText}>{buttonText}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.iconWrapper}>
              <Ionicons
                name={icon as any}
                size={64}
                color={iconColor}
                style={styles.promoIcon}
              />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
});

// Banner Carousel Component
const BannerCarousel = React.memo(() => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const dotWidths = useRef([
    new Animated.Value(24),
    new Animated.Value(8),
    new Animated.Value(8),
  ]).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const ads = [
    {
      title: "Compare Feature",
      subtitle: "Compare insurance policies and find the best deals",
      buttonText: "Try Now",
      icon: "analytics",
      backgroundColor: "#E3F2FD",
      textColor: "#1565C0",
      iconColor: "#1976D2",
      buttonColor: "#1976D2",
      onPress: () => navigation.navigate("Main", { screen: "Marketplace" }),
    },
    {
      title: "New Coverage",
      subtitle: "Discover exclusive health insurance plans tailored for you",
      buttonText: "Explore",
      icon: "medical",
      backgroundColor: "#FFEBEE",
      textColor: "#C62828",
      iconColor: "#E53935",
      buttonColor: "#E53935",
      onPress: () => navigation.navigate("Main", { screen: "Policies" }),
    },
    {
      title: "Save More",
      subtitle: "Get up to 30% off on your next policy renewal",
      buttonText: "Learn More",
      icon: "pricetag",
      backgroundColor: "#E8F5E9",
      textColor: "#2E7D32",
      iconColor: "#4CAF50",
      buttonColor: "#4CAF50",
      onPress: () => navigation.navigate("Main", { screen: "Policies" }),
    },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const slideWidth = SCREEN_WIDTH; // Each slide + margins = full screen width
        const page = Math.round(offsetX / slideWidth);
        setCurrentPage(page);
        
        // Animate dot widths
        dotWidths.forEach((dotWidth, index) => {
          Animated.spring(dotWidth, {
            toValue: page === index ? 24 : 8,
            tension: 300,
            friction: 7,
            useNativeDriver: false,
          }).start();
        });
      },
    }
  );

  const styles = getBannerStyles(theme);

  return (
    <Animated.View
      style={[
        styles.carouselContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
      >
        {ads.map((ad, index) => (
          <AdBanner
            key={index}
            title={ad.title}
            subtitle={ad.subtitle}
            buttonText={ad.buttonText}
            icon={ad.icon}
            backgroundColor={ad.backgroundColor}
            textColor={ad.textColor}
            iconColor={ad.iconColor}
            buttonColor={ad.buttonColor}
            onPress={ad.onPress}
            index={index}
            isFirst={index === 0}
            isLast={index === ads.length - 1}
          />
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotContainer}>
        {ads.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentPage === index ? theme.promoButton : '#BDBDBD',
                width: dotWidths[index],
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
});

const HomeScreen = () => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const gradientOffset = useRef(new Animated.Value(0)).current;
  const [activePoliciesCount, setActivePoliciesCount] = useState(0);
  const [activePoliciesByType, setActivePoliciesByType] = useState<any[]>([]);

  // Animated gradient background
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientOffset, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientOffset, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Fetch active policies count and by type
  useEffect(() => {
    const fetchPoliciesData = async () => {
      if (user?.user_id) {
        try {
          const policies = await getMyPolicies(user.user_id);
          const activePolicies = policies.filter(p => p.status === 'active');
          setActivePoliciesCount(activePolicies.length);
          
          // Group by insurance type and get one per type
          const typeMap = new Map();
          activePolicies.forEach(policy => {
            const typeName = policy.plan?.insurance_type?.name || 'Other';
            if (!typeMap.has(typeName)) {
              typeMap.set(typeName, policy);
            }
          });
          
          // Map to array with color and calculate days remaining
          // Match marketplace screen icons and colors
          const getTypeInfo = (typeName: string) => {
            const normalizedName = typeName.toLowerCase();
            
            // Match marketplace categories
            if (normalizedName.includes('health') || normalizedName.includes('life')) {
              return { icon: 'medical', color: '#F44336', displayName: 'Health & Life' };
            }
            if (normalizedName.includes('motor') || normalizedName.includes('auto') || normalizedName.includes('vehicle')) {
              return { icon: 'car', color: '#FF9800', displayName: 'Motor' };
            }
            if (normalizedName.includes('travel')) {
              return { icon: 'airplane', color: '#4CAF50', displayName: 'Travel' };
            }
            if (normalizedName.includes('property') || normalizedName.includes('business')) {
              return { icon: 'business', color: '#9C27B0', displayName: 'Property & Business' };
            }
            if (normalizedName.includes('engineering') || normalizedName.includes('construction')) {
              return { icon: 'build', color: '#2196F3', displayName: 'Engineering & Construction' };
            }
            if (normalizedName.includes('marine') || normalizedName.includes('transport')) {
              return { icon: 'boat', color: '#00BCD4', displayName: 'Marine & Transport' };
            }
            if (normalizedName.includes('energy') || normalizedName.includes('power')) {
              return { icon: 'flash', color: '#FFC107', displayName: 'Energy & Power' };
            }
            if (normalizedName.includes('financial') || normalizedName.includes('professional') || normalizedName.includes('liability')) {
              return { icon: 'card', color: '#607D8B', displayName: 'Financial Lines' };
            }
            if (normalizedName.includes('cyber') || normalizedName.includes('crime')) {
              return { icon: 'shield', color: '#3F51B5', displayName: 'Cyber & Crime' };
            }
            if (normalizedName.includes('fine art') || normalizedName.includes('special')) {
              return { icon: 'color-palette', color: '#E91E63', displayName: 'Special & Fine Art' };
            }
            if (normalizedName.includes('casualty')) {
              return { icon: 'warning', color: '#FF5722', displayName: 'Casualty & Liability' };
            }
            
            // Default fallback
            return { icon: 'shield', color: '#607D8B', displayName: typeName };
          };
          
          const policiesByType = Array.from(typeMap.entries()).map(([typeName, policy]: [string, any]) => {
            const typeInfo = getTypeInfo(typeName);
            
            // Calculate days remaining
            let daysRemaining = 0;
            let totalDays = 0;
            if (policy.end_date) {
              const endDate = new Date(policy.end_date);
              const startDate = policy.start_date ? new Date(policy.start_date) : new Date();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              startDate.setHours(0, 0, 0, 0);
              
              totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            }
            
            return {
              typeName: typeInfo.displayName,
              policy,
              color: typeInfo.color,
              icon: typeInfo.icon,
              daysRemaining,
              totalDays,
              progress: totalDays > 0 ? (daysRemaining / totalDays) : 0,
            };
          });
          
          setActivePoliciesByType(policiesByType);
        } catch (error) {
          console.error('Error fetching policies:', error);
        }
      }
    };
    fetchPoliciesData();
  }, [user?.user_id]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const headerTextTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  const headerTextScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const contentCardTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  const styles = getHomeScreenStyles(theme, isDark, insets);

  const quickActions = [
    { icon: "medical", title: "Health", subtitle: "Health insurance", color: "#F44336" },
    { icon: "car", title: "Motor", subtitle: "Vehicle insurance", color: "#FF9800" },
    { icon: "airplane", title: "Travel", subtitle: "Travel protection", color: "#4CAF50" },
    { icon: "ellipsis-horizontal", title: "More", subtitle: "Other options", color: "#2196F3" },
  ];

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={['left', 'right']}>
      {/* Animated Gradient Background - Left to Right with White Bottom Third */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {/* White bottom third for scroll overflow */}
        <View style={styles.whiteBottomSection} />
      </View>

      {/* Glassmorphic Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            height: headerHeight,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.headerContent} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.headerTextContainer,
              {
                transform: [
                  { translateY: headerTextTranslateY },
                  { scale: headerTextScale },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.headerGreeting, { color: theme.overlay }]}>Welcome</Text>
            <Text style={[styles.headerUserName, { color: theme.textInverse }]}>
              {user?.name || "User"}
            </Text>
          </Animated.View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.7}
            style={styles.profileButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              style={[
                styles.headerProfileAvatar,
                {
                  transform: [{ scale: avatarScale }],
                },
              ]}
            >
              <Ionicons name="person" size={28} color={theme.textInverse} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Invisible Profile Button Overlay for reliable touch */}
      <TouchableOpacity
        style={styles.invisibleProfileButton}
        onPress={() => navigation.navigate("Profile")}
        activeOpacity={1}
      />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Content Card with gradient top border */}
        <Animated.View
          style={[
            styles.contentCard,
            {
              backgroundColor: theme.card,
              transform: [{ translateY: contentCardTranslateY }],
            },
          ]}
        >
          {/* Quick Actions Section */}
          <View style={styles.section}>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <NeumorphicActionCard
                  key={index}
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  color={action.color}
                  index={index}
                  onPress={() => {
                    if (index === 3) {
                      navigation.navigate("Main", { screen: "Marketplace" });
                    } else {
                      navigation.navigate("Main", { screen: "Policies" });
                    }
                  }}
                />
              ))}
            </View>
          </View>

          {/* Promotional Banner Carousel */}
          <View style={styles.carouselSection}>
            <BannerCarousel />
          </View>

          {/* Active Policies by Type */}
          {activePoliciesByType.map((item, index) => (
            <View key={index} style={styles.section}>
              <TouchableOpacity
                style={[styles.policyTile, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate("Main", { screen: "Policies" })}
                activeOpacity={0.8}
              >
                <View style={styles.policyTileHeader}>
                  <View style={styles.policyTileLeft}>
                    <View style={[styles.policyTypeIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons 
                        name={item.icon as any}
                        size={24} 
                        color={item.color} 
                      />
                    </View>
                    <View style={styles.policyTileText}>
                      <Text style={[styles.policyTypeName, { color: theme.text }]}>
                        {item.policy.plan?.name || item.typeName}
                      </Text>
                      <Text style={[styles.policyNumber, { color: theme.textSecondary }]}>
                        {item.policy.policy_number || `Policy #${item.policy.user_policy_id}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.policyDaysContainer}>
                    <Text style={[styles.policyDaysText, { color: item.color }]}>
                      {item.daysRemaining}
                    </Text>
                    <Text style={[styles.policyDaysLabel, { color: theme.textSecondary }]}>
                      days left
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBackground, { backgroundColor: theme.borderLight }]}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${item.progress * 100}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* Quick Action Tiles */}
          <View style={styles.section}>
            <View style={styles.quickTilesRow}>
              {/* File a Claim Tile */}
              <TouchableOpacity
                style={[styles.quickTile, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate("Main", { screen: "Claims" })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#E0E7FF', '#EDE9FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickTileGradient}
                >
                  <View style={styles.quickTileContent}>
                    <View style={[styles.quickTileIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                      <Ionicons name="document-text" size={20} color="#6366F1" />
                    </View>
                    <Text style={[styles.quickTileTitle, { color: '#6366F1' }]}>File a Claim</Text>
                    <Text style={[styles.quickTileSubtitle, { color: '#818CF8' }]}>Submit claim</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Active Policies Tile */}
              <TouchableOpacity
                style={[styles.quickTile, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate("Main", { screen: "Policies" })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ECFDF5', '#D1FAE5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickTileGradient}
                >
                  <View style={styles.quickTileContent}>
                    <View style={[styles.quickTileIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                    </View>
                    <Text style={[styles.quickTileTitle, { color: '#10B981' }]}>{activePoliciesCount}</Text>
                    <Text style={[styles.quickTileSubtitle, { color: '#34D399' }]}>Active Policies</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Call for Help Tile */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.helpTile, { backgroundColor: '#FFF4E6', borderColor: '#FF8C42', borderWidth: 2 }]}
              onPress={() => Linking.openURL('tel:+1234567890')}
              activeOpacity={0.8}
            >
              <View style={styles.helpTileContent}>
                <View style={styles.helpTileLeft}>
                  <View style={[styles.helpTileIconContainer, { backgroundColor: '#FF8C42' }]}>
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.helpTileTextContainer}>
                    <Text style={[styles.helpTileTitle, { color: '#FF8C42' }]}>Need Help?</Text>
                    <Text style={[styles.helpTileSubtitle, { color: '#D2691E' }]}>Call us anytime</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward-circle" size={24} color="#FF8C42" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaViewContext>
  );
};

// Style functions
const getHomeScreenStyles = (theme: any, isDark: boolean, insets: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  whiteBottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT / 3,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: insets.top + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    zIndex: 5,
    elevation: 5,
    overflow: 'visible',
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
    width: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerUserName: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileButton: {
    marginLeft: 16,
  },
  invisibleProfileButton: {
    position: 'absolute',
    top: insets.top + 20,
    right: 20,
    width: 80,
    height: 80,
    zIndex: 20,
    elevation: 20,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  headerProfileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + 20,
    paddingBottom: 120,
  },
  contentCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: SCREEN_HEIGHT,
    paddingTop: 24,
    marginTop: 0,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  carouselSection: {
    marginTop: 24,
    marginBottom: 0,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: '100%',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  quickTilesRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: 'space-between',
  },
  quickTile: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickTileGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  quickTileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickTileTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  quickTileSubtitle: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  helpTile: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  helpTileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  helpTileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  helpTileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpTileTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  helpTileTitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  helpTileSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 13,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  policyTile: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  policyTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  policyTileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  policyTileText: {
    flex: 1,
  },
  policyTypeName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  policyNumber: {
    fontSize: 12,
    fontWeight: "500",
  },
  policyDaysContainer: {
    alignItems: 'flex-end',
  },
  policyDaysText: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },
  policyDaysLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

const getNeumorphicCardStyles = (theme: any, isDark: boolean, color: string) => StyleSheet.create({
  cardContainer: {
    width: "48.5%",
    height: 140,
  },
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: isDark ? '#2A2A2D' : '#F5F5F5',
    position: 'relative',
    overflow: 'hidden',
  },
  shadowLight: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 28,
    backgroundColor: isDark ? theme.neumorphicShadowLight : theme.neumorphicShadowLight,
    opacity: isDark ? 0.05 : 0.7,
  },
  shadowDark: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 16,
    backgroundColor: isDark ? theme.neumorphicShadowDark : theme.neumorphicShadowDark,
    opacity: isDark ? 0.5 : 0.15,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
});

const getBannerStyles = (theme: any) => StyleSheet.create({
  carouselContainer: {
    marginTop: 0,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  bannerSlide: {
    width: SCREEN_WIDTH - 40,
    height: 160,
    marginHorizontal: 20,
  },
  touchable: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  banner: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    height: '100%',
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  promoSubtitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  promoButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  promoButtonText: {
    color: theme.textInverse,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoIcon: {
    opacity: 0.4,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default HomeScreen;
