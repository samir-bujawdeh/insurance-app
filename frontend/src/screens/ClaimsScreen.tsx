import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
import { listClaims, Claim } from "../api/claims";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ClaimsScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = ClaimsScreenStyles(theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values for header opacity based on scroll
  const headerTextOpacity = useRef(new Animated.Value(1)).current;
  const headerIconOpacity = useRef(new Animated.Value(1)).current;

  // Mock data for demonstration since the API returns empty array
  const mockClaims: Claim[] = [
    {
      claim_id: 1,
      user_policy_id: 1,
      date_filed: "2024-01-10",
      claim_amount: 2500,
      status: "approved",
      description: "Auto accident - rear bumper damage",
    },
    {
      claim_id: 2,
      user_policy_id: 2,
      date_filed: "2024-01-08",
      claim_amount: 1250,
      status: "pending",
      description: "Home water damage claim",
    },
    {
      claim_id: 3,
      user_policy_id: 3,
      date_filed: "2024-01-05",
      claim_amount: 500,
      status: "approved",
      description: "Travel insurance - lost luggage",
    },
    {
      claim_id: 4,
      user_policy_id: 4,
      date_filed: "2023-12-20",
      claim_amount: 850,
      status: "rejected",
      description: "Health insurance claim - dental procedure",
    },
  ];

  const loadClaims = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const data = await listClaims();
      setClaims(Array.isArray(data) && data.length > 0 ? data : mockClaims);
    } catch (error) {
      console.error("Error loading claims:", error);
      Alert.alert("Error", "Failed to load claims");
      // Use mock data on error
      setClaims(mockClaims);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [user]);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return theme.success;
      case "pending":
        return theme.warning;
      case "rejected":
      case "denied":
        return theme.error;
      case "processing":
        return theme.info;
      default:
        return theme.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "rejected":
      case "denied":
        return "close-circle";
      case "processing":
        return "hourglass";
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderClaimItem = ({ item }: { item: Claim }) => (
    <TouchableOpacity style={styles.claimCard} activeOpacity={0.7}>
      <View style={styles.claimCardContent}>
        <View style={styles.claimHeader}>
          <View style={styles.claimTitleContainer}>
            <Text style={styles.claimNumber}>Claim #{item.claim_id}</Text>
            <Text style={styles.claimDate}>Filed {formatDate(item.date_filed)}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) + "15" }]}>
            <Ionicons
              name={getStatusIcon(item.status) as any}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.claimDescription}>{item.description}</Text>
        )}

        <View style={styles.claimDetails}>
          {item.claim_amount && (
            <View style={styles.amountRow}>
              <Ionicons name="cash" size={16} color={theme.success} />
              <Text style={styles.amountLabel}>Claim Amount:</Text>
              <Text style={styles.amountValue}>${item.claim_amount.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.policyRow}>
            <Ionicons name="document-text" size={16} color="#666" />
            <Text style={styles.policyId}>Policy ID: {item.user_policy_id}</Text>
          </View>
        </View>

        <View style={styles.claimActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye" size={16} color={theme.accent} />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={16} color="#666" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
                <Text style={styles.headerGreeting}>My Claims</Text>
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
              <Text style={styles.headerGreeting}>My Claims</Text>
            </Animated.View>
            <Animated.View style={{ opacity: headerIconOpacity }}>
              <View style={styles.headerProfileAvatar}>
                <Ionicons name="document-text" size={24} color={theme.textInverse} />
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
            {/* Claims List */}
            <View style={styles.section}>
              {claims.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="document-outline" size={64} color={theme.textSecondary} />
                  </View>
                  <Text style={styles.emptyTitle}>No claims yet</Text>
                  <Text style={styles.emptySubtitle}>
                    You haven't filed any claims yet. File a claim from your policy details.
                  </Text>
                  <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate("Main", { screen: "Policies" })}
                  >
                    <Text style={styles.browseButtonText}>View Policies</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.textInverse} />
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={claims}
                  keyExtractor={(item) => String(item.claim_id)}
                  renderItem={renderClaimItem}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadClaims} />}
                  contentContainerStyle={styles.claimsList}
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

const ClaimsScreenStyles = (theme: any) => StyleSheet.create({
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
    backgroundColor: theme.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textTertiary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  browseButton: {
    flexDirection: "row",
    backgroundColor: theme.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  browseButtonText: {
    color: theme.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
  claimsList: {
    paddingBottom: 20,
  },
  claimCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  claimCardContent: {
    padding: 20,
  },
  claimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  claimTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  claimNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  claimDate: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  claimDescription: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  claimDetails: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.textTertiary,
  },
  amountValue: {
    fontSize: 16,
    color: theme.success,
    fontWeight: "600",
    marginLeft: "auto",
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  policyId: {
    fontSize: 13,
    color: theme.textTertiary,
  },
  claimActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomWhiteSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    height: 200,
    zIndex: 5,
    elevation: 5,
  },
});

export default ClaimsScreen;
