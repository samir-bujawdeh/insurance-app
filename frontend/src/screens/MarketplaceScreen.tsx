import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type InsuranceCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
};

const INSURANCE_CATEGORIES: InsuranceCategory[] = [
  { id: "health-life", name: "Health & Life", icon: "medical", iconColor: "#F44336" },
  { id: "motor", name: "Motor", icon: "car", iconColor: "#FF9800" },
  { id: "travel", name: "Travel", icon: "airplane", iconColor: "#4CAF50" },
  { id: "property-business", name: "Property & Business Interruptions", icon: "business", iconColor: "#9C27B0" },
  { id: "engineering-construction", name: "Engineering & Construction", icon: "build", iconColor: "#2196F3" },
  { id: "marine-transport", name: "Marine & Transport", icon: "boat", iconColor: "#00BCD4" },
  { id: "energy-power", name: "Energy & Power", icon: "flash", iconColor: "#FFC107" },
  { id: "financial-lines", name: "Financial Lines & Professional Liability", icon: "card", iconColor: "#607D8B" },
  { id: "cyber-crime", name: "Cyber & Crime", icon: "shield", iconColor: "#3F51B5" },
  { id: "special-fine-art", name: "Special & Fine Art", icon: "color-palette", iconColor: "#E91E63" },
  { id: "casualty-liability", name: "Casualty & Liability", icon: "warning", iconColor: "#FF5722" },
];

const MarketplaceScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = MarketplaceScreenStyles(theme);

  const handleCategoryPress = (category: InsuranceCategory) => {
    if (category.id === "health-life") {
      navigation.navigate("HealthQuote");
    } else {
      // Placeholder navigation - will be replaced when detail screens are created
      Alert.alert(
        category.name,
        `Navigation to ${category.name} screen will be implemented here.`,
        [{ text: "OK" }]
      );
    }
  };

  const renderCategoryCard = ({ item }: { item: InsuranceCategory }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: theme.actionCard }]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + "15" }]}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={['left', 'right']}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fullBackground}
      >
        {/* Fixed Header Content */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerGreeting}>Get Insurance</Text>
            </View>
            <View style={styles.headerProfileAvatar}>
              <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.textInverse} />
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* White Content Card */}
          <View style={styles.contentCard}>
            <View style={styles.section}>
              <Text style={styles.title}>Choose Insurance Type</Text>
              <Text style={styles.subtitle}>Select a category to get started</Text>
              <FlatList
                data={INSURANCE_CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryCard}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom white section positioned absolutely */}
        <View style={styles.bottomWhiteSection} />
      </LinearGradient>
    </SafeAreaViewContext>
  );
};

const MarketplaceScreenStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 0,
    paddingBottom: 0,
  },
  fullBackground: { flex: 1 },
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: { flex: 1 },
  headerGreeting: { fontSize: 34, fontWeight: "700", color: theme.textInverse },
  headerProfileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.overlayDark,
    borderWidth: 2,
    borderColor: theme.overlayMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  contentCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 140,
    minHeight: '100%',
  },
  section: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 20 },

  title: { fontSize: 24, fontWeight: "700", color: theme.text, marginBottom: 8, marginTop: 4, marginLeft: 4 },
  subtitle: { fontSize: 16, color: theme.textSecondary, marginBottom: 24, marginLeft: 4 },
  
  // Category cards
  listContent: { paddingTop: 4 },
  categoryCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },

  // Choose type
  typeCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typeName: { fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 6 },
  typeDesc: { fontSize: 12, color: theme.textTertiary },

  // Questionnaire
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  backLink: { color: theme.accent, fontSize: 14, fontWeight: "600" },
  questionBlock: { marginBottom: 14 },
  questionLabel: { fontSize: 14, fontWeight: "600", color: theme.text, marginBottom: 8 },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.text,
  },
  selectRow: { flexDirection: "row", flexWrap: "wrap" },
  optionChip: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  optionChipText: { fontSize: 13, color: theme.textTertiary, fontWeight: "500" },
  optionChipTextActive: { color: theme.textInverse },
  primaryBtn: { backgroundColor: theme.accent, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: theme.textInverse, fontSize: 16, fontWeight: "700" },

  // Results / aggregator
  resultsHeader: { marginTop: 4, marginBottom: 12 },
  resultsTitle: { fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 8 },
  sortRow: { flexDirection: "row", alignItems: "center" },
  sortLabel: { marginRight: 8, color: theme.textTertiary },
  policyRow: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.borderLight,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  policyName: { fontSize: 16, fontWeight: "700", color: theme.text },
  coverageText: { fontSize: 12, color: theme.accent, marginTop: 6 },
  priceCol: { minWidth: 120, alignItems: "flex-end" },
  policyPrice: { fontSize: 16, fontWeight: "700", color: theme.text },
  policyDuration: { fontSize: 12, color: theme.textTertiary, marginBottom: 8 },
  quoteButton: { backgroundColor: theme.text, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  quoteButtonText: { color: theme.textInverse, fontSize: 14, fontWeight: "600" },
  separator: { height: 8 },

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

export default MarketplaceScreen;


