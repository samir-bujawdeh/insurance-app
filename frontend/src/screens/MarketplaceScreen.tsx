import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from "react-native";
import { 
  getProviders, 
  getInsuranceTypes, 
  getPolicies, 
  getPolicy,
  Provider,
  InsuranceType,
  InsurancePolicy 
} from "../api/marketplace";
import { purchasePolicy } from "../api/policies";
import { useAuth } from "../context/AuthContext";

const MarketplaceScreen = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<number | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<number | undefined>(undefined);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [providersData, typesData, policiesData] = await Promise.all([
        getProviders(),
        getInsuranceTypes(),
        getPolicies(selectedType, selectedProvider)
      ]);
      
      setProviders(providersData);
      setInsuranceTypes(typesData);
      setPolicies(policiesData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      Alert.alert("Error", "Failed to load marketplace data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedProvider]);

  const handlePurchasePolicy = async (policyId: number) => {
    if (!user) {
      Alert.alert("Error", "Please log in to purchase a policy");
      return;
    }

    try {
      // For now, we'll use a dummy user ID since we don't have user ID in the auth context
      // In a real app, you'd get this from the user object
      const userId = 1; // This should come from user context
      
      const userPolicy = await purchasePolicy(userId, policyId);
      Alert.alert("Success", "Policy purchased successfully!");
      console.log("Purchased policy:", userPolicy);
    } catch (error) {
      console.error("Error purchasing policy:", error);
      Alert.alert("Error", "Failed to purchase policy");
    }
  };

  const renderPolicyItem = ({ item }: { item: InsurancePolicy }) => (
    <View style={styles.policyCard}>
      <Text style={styles.policyName}>{item.name}</Text>
      <Text style={styles.policyDescription}>{item.description}</Text>
      {item.coverage_summary && (
        <Text style={styles.coverageText}>{item.coverage_summary}</Text>
      )}
      <View style={styles.policyFooter}>
        <Text style={styles.policyPrice}>
          {item.premium ? `$${item.premium.toFixed(2)}` : "Price on request"}
        </Text>
        <Text style={styles.policyDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity 
        style={styles.purchaseButton}
        onPress={() => handlePurchasePolicy(item.policy_id)}
      >
        <Text style={styles.purchaseButtonText}>Purchase</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTypeFilter = ({ item }: { item: InsuranceType }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedType === item.type_id && styles.filterChipActive
      ]}
      onPress={() => setSelectedType(
        selectedType === item.type_id ? undefined : item.type_id
      )}
    >
      <Text style={[
        styles.filterChipText,
        selectedType === item.type_id && styles.filterChipTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProviderFilter = ({ item }: { item: Provider }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedProvider === item.provider_id && styles.filterChipActive
      ]}
      onPress={() => setSelectedProvider(
        selectedProvider === item.provider_id ? undefined : item.provider_id
      )}
    >
      <Text style={[
        styles.filterChipText,
        selectedProvider === item.provider_id && styles.filterChipTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Insurance Marketplace</Text>
        
        {/* Insurance Types Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Insurance Types</Text>
          <FlatList
            horizontal
            data={insuranceTypes}
            keyExtractor={(item) => String(item.type_id)}
            renderItem={renderTypeFilter}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Providers Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Providers</Text>
          <FlatList
            horizontal
            data={providers}
            keyExtractor={(item) => String(item.provider_id)}
            renderItem={renderProviderFilter}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Policies List */}
        <FlatList
          data={policies}
          keyExtractor={(item) => String(item.policy_id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
          renderItem={renderPolicyItem}
          contentContainerStyle={styles.policiesList}
          showsVerticalScrollIndicator={false}
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 20,
    color: "#1A1A1A",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
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
  policyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  policyDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  coverageText: {
    fontSize: 13,
    color: "#007AFF",
    marginBottom: 12,
    fontStyle: "italic",
  },
  policyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  policyPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  policyDuration: {
    fontSize: 12,
    color: "#999",
  },
  purchaseButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MarketplaceScreen;


