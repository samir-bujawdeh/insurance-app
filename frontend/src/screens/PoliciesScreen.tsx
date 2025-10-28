import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  Alert 
} from "react-native";
import { getMyPolicies, UserPolicyDetail } from "../api/policies";
import { useAuth } from "../context/AuthContext";

const PoliciesScreen = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<UserPolicyDetail[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPolicies = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      // For now, we'll use a dummy user ID since we don't have user ID in the auth context
      // In a real app, you'd get this from the user object
      const userId = 1; // This should come from user context
      
      const userPolicies = await getMyPolicies(userId);
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

  const renderPolicyItem = ({ item }: { item: UserPolicyDetail }) => (
    <View style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <Text style={styles.policyName}>{item.policy.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.providerName}>{item.policy.provider.name}</Text>
      <Text style={styles.insuranceType}>{item.policy.insurance_type.name}</Text>
      
      {item.policy_number && (
        <Text style={styles.policyNumber}>Policy #: {item.policy_number}</Text>
      )}
      
      {item.premium_paid && (
        <Text style={styles.premiumPaid}>Premium Paid: ${item.premium_paid.toFixed(2)}</Text>
      )}
      
      {item.start_date && item.end_date && (
        <Text style={styles.coveragePeriod}>
          Coverage: {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
        </Text>
      )}
      
      {item.policy.coverage_summary && (
        <Text style={styles.coverageSummary}>{item.policy.coverage_summary}</Text>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>💼 My Policies</Text>
          <Text style={styles.subtitle}>Please log in to view your policies.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>💼 My Policies</Text>
        
        {policies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No policies found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any policies yet. Visit the marketplace to purchase one!
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Marketplace</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 20,
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginTop: 6,
    textAlign: "center",
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
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
    borderRadius: 12,
    padding: 16,
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
  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  policyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  providerName: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 4,
  },
  insuranceType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  policyNumber: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  premiumPaid: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 4,
  },
  coveragePeriod: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  coverageSummary: {
    fontSize: 13,
    color: "#333",
    fontStyle: "italic",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 6,
  },
});

export default PoliciesScreen;
