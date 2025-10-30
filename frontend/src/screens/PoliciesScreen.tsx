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
  Animated
} from "react-native";
import { useSafeAreaInsets, SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { getMyPolicies, UserPolicyDetail } from "../api/policies";
import { useAuth } from "../context/AuthContext";

const PoliciesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [policies, setPolicies] = useState<UserPolicyDetail[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  
  // Animation values for header opacity based on scroll
  const headerTextOpacity = useRef(new Animated.Value(1)).current;
  const headerIconOpacity = useRef(new Animated.Value(1)).current;

  const loadPolicies = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const userPolicies = await getMyPolicies(user.user_id);
      setPolicies(userPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
      Alert.alert("Error", "Failed to load policies");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPolicies();
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
    switch (status) {
      case "active":
        return "#4CAF50";
      case "pending_payment":
        return "#FF9800";
      case "expired":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "checkmark-circle";
      case "pending_payment":
        return "time";
      case "expired":
        return "close-circle";
      default:
        return "help-circle";
    }
  };


  const renderPolicyItem = ({ item }: { item: UserPolicyDetail }) => (
    <TouchableOpacity style={styles.policyCard} activeOpacity={0.7}>
      <View style={styles.policyCardContent}>
        <View style={styles.policyHeader}>
          <View style={styles.policyTitleContainer}>
            <Text style={styles.policyName}>{item.policy.name}</Text>
            <View style={styles.policyTypeBadge}>
              <Text style={styles.policyTypeText}>{item.policy.insurance_type.name}</Text>
            </View>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) + "15" }]}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.policyDetails}>
          <View style={styles.providerRow}>
            <Ionicons name="business" size={16} color="#007AFF" />
            <Text style={styles.providerName}>{item.policy.provider.name}</Text>
          </View>
          
          {item.policy_number && (
            <View style={styles.policyNumberRow}>
              <Ionicons name="document-text" size={16} color="#666" />
              <Text style={styles.policyNumber}>#{item.policy_number}</Text>
            </View>
          )}
          
          {item.premium_paid && (
            <View style={styles.premiumRow}>
              <Ionicons name="card" size={16} color="#4CAF50" />
              <Text style={styles.premiumPaid}>${item.premium_paid.toFixed(2)} paid</Text>
            </View>
          )}
          
          {item.start_date && item.end_date && (
            <View style={styles.coverageRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.coveragePeriod}>
                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
        
        {item.policy.coverage_summary && (
          <View style={styles.coverageSummaryContainer}>
            <Text style={styles.coverageSummary}>{item.policy.coverage_summary}</Text>
          </View>
        )}
        
        <View style={styles.policyActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye" size={16} color="#007AFF" />
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
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fullBackground}
        >
          <View style={styles.fixedHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerGreeting}>My Policies</Text>
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
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fullBackground}
      >
        {/* Fixed Header Content */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <Animated.View style={[styles.headerTextContainer, { opacity: headerTextOpacity }]}>
              <Text style={styles.headerGreeting}>My Policies</Text>
            </Animated.View>
            <Animated.View style={{ opacity: headerIconOpacity }}>
              <View style={styles.headerProfileAvatar}>
                <Ionicons name="briefcase" size={24} color="#FFFFFF" />
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

            {/* Policies List */}
            <View style={styles.section}>
              {policies.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="document-outline" size={64} color="#C7C7CC" />
                  </View>
                  <Text style={styles.emptyTitle}>No policies yet</Text>
                  <Text style={styles.emptySubtitle}>
                    You don't have any policies yet. Visit the marketplace to purchase one!
                  </Text>
                  <TouchableOpacity 
                    style={styles.browseButton}
                    onPress={() => navigation.navigate("Main", { screen: "Marketplace" })}
                  >
                    <Text style={styles.browseButtonText}>Browse Marketplace</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={policies}
                  keyExtractor={(item) => String(item.user_policy_id)}
                  renderItem={renderPolicyItem}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadPolicies} />}
                  contentContainerStyle={styles.policiesList}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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
    backgroundColor: "#FFFFFF",
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
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  
  },
  headerProfileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
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
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  browseButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  policiesList: {
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  policyCardContent: {
    padding: 20,
  },
  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  policyTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  policyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  policyTypeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  policyTypeText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
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
  policyDetails: {
    marginBottom: 16,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  providerName: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  policyNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  policyNumber: {
    fontSize: 13,
    color: "#666",
  },
  premiumRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  premiumPaid: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
  },
  coverageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coveragePeriod: {
    fontSize: 13,
    color: "#666",
  },
  coverageSummaryContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  coverageSummary: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  policyActions: {
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
    backgroundColor: "#FFFFFF",
    height: 200,
    zIndex: 5,
    elevation: 5,
  },
});

export default PoliciesScreen;
