import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  getInsuranceTypes,
  getPolicies,
  InsuranceType,
  InsurancePolicy,
} from "../api/marketplace";

type Step = "chooseType" | "questionnaire" | "results";

type QuestionOption = { label: string; value: string | number };
type Question = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "toggle";
  placeholder?: string;
  options?: QuestionOption[];
};

const QUESTION_BANK: Record<string, Question[]> = {
  health: [
    { key: "age", label: "Age", type: "number", placeholder: "e.g. 35" },
    {
      key: "dependents",
      label: "Number of dependents",
      type: "number",
      placeholder: "e.g. 2",
    },
    {
      key: "coverage",
      label: "Coverage level",
      type: "select",
      options: [
        { label: "Basic", value: "basic" },
        { label: "Standard", value: "standard" },
        { label: "Comprehensive", value: "comprehensive" },
      ],
    },
  ],
  motor: [
    { key: "vehicle_make", label: "Vehicle make", type: "text", placeholder: "e.g. Toyota" },
    { key: "vehicle_model", label: "Vehicle model", type: "text", placeholder: "e.g. Corolla" },
    { key: "year", label: "Year", type: "number", placeholder: "e.g. 2021" },
    {
      key: "usage",
      label: "Usage",
      type: "select",
      options: [
        { label: "Personal", value: "personal" },
        { label: "Commercial", value: "commercial" },
      ],
    },
  ],
  travel: [
    { key: "destination", label: "Destination", type: "text", placeholder: "e.g. Europe" },
    { key: "duration_days", label: "Duration (days)", type: "number", placeholder: "e.g. 14" },
    {
      key: "trip_type",
      label: "Trip type",
      type: "select",
      options: [
        { label: "Single trip", value: "single" },
        { label: "Annual multi-trip", value: "annual" },
      ],
    },
  ],
  home: [
    { key: "property_type", label: "Property type", type: "text", placeholder: "e.g. Apartment" },
    { key: "rebuild_cost", label: "Rebuild cost ($)", type: "number", placeholder: "e.g. 250000" },
    {
      key: "security",
      label: "Security",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Enhanced (alarms/guards)", value: "enhanced" },
      ],
    },
  ],
};

const MarketplaceScreen = () => {
  const [step, setStep] = useState<Step>("chooseType");
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [selectedType, setSelectedType] = useState<InsuranceType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortKey, setSortKey] = useState<"price" | "name">("price");

  useEffect(() => {
    const init = async () => {
      try {
        const types = await getInsuranceTypes();
        setInsuranceTypes(types);
      } catch (e) {
        Alert.alert("Error", "Failed to load insurance types");
      }
    };
    init();
  }, []);

  const normalizedTypeKey = useMemo(() => {
    if (!selectedType) return "";
    return selectedType.name?.toLowerCase?.().trim?.() || "";
  }, [selectedType]);

  const questions: Question[] = useMemo(() => {
    if (!normalizedTypeKey) return [];
    return QUESTION_BANK[normalizedTypeKey] || [
      { key: "coverage", label: "Coverage preference", type: "select", options: [
        { label: "Basic", value: "basic" },
        { label: "Standard", value: "standard" },
        { label: "Comprehensive", value: "comprehensive" },
      ]},
      { key: "budget", label: "Monthly budget ($)", type: "number", placeholder: "e.g. 50" },
    ];
  }, [normalizedTypeKey]);

  const handleTypeSelect = (type: InsuranceType) => {
    setSelectedType(type);
    setAnswers({});
    setStep("questionnaire");
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleFindPolicies = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    try {
      const results = await getPolicies(selectedType.type_id);
      const sorted = [...results].sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name);
        const ap = a.premium ?? Number.MAX_SAFE_INTEGER;
        const bp = b.premium ?? Number.MAX_SAFE_INTEGER;
        return ap - bp;
      });
      setPolicies(sorted);
      setStep("results");
    } catch (e) {
      Alert.alert("Error", "Failed to fetch matching policies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQuote = (policy: InsurancePolicy) => {
    if (policy.premium) {
      Alert.alert("Estimated Quote", `$${policy.premium.toFixed(2)} per ${policy.duration || "term"}`);
    } else {
      Alert.alert("Quote", "Price on request. A representative will contact you.");
    }
  };

  const renderTypeCard = ({ item }: { item: InsuranceType }) => (
    <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect(item)}>
      <Text style={styles.typeName}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.typeDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderPolicyRow = ({ item }: { item: InsurancePolicy }) => (
    <View style={styles.policyRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.policyName}>{item.name}</Text>
        {item.coverage_summary ? (
          <Text style={styles.coverageText} numberOfLines={2}>{item.coverage_summary}</Text>
        ) : null}
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.policyPrice}>
          {item.premium ? `$${item.premium.toFixed(2)}` : "—"}
        </Text>
        <Text style={styles.policyDuration}>{item.duration || ""}</Text>
        <TouchableOpacity style={styles.quoteButton} onPress={() => handleGetQuote(item)}>
          <Text style={styles.quoteButtonText}>Get Quote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ChooseTypeSection = () => (
    <>
      <Text style={styles.title}>Find the right insurance</Text>
      <Text style={styles.subtitle}>What do you want to insure?</Text>
      <FlatList
        data={insuranceTypes}
        keyExtractor={(item) => String(item.type_id)}
        renderItem={renderTypeCard}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
        scrollEnabled={false}
      />
    </>
  );

  const ResultsHeader = () => (
    <View style={styles.resultsHeader}>
      <Text style={styles.resultsTitle}>Matching policies</Text>
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {["price", "name"].map((k) => {
          const active = sortKey === (k as "price" | "name");
          return (
            <TouchableOpacity
              key={k}
              onPress={() => setSortKey(k as "price" | "name")}
              style={[styles.optionChip, active && styles.optionChipActive]}
            >
              <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                {k === "price" ? "Price" : "Name"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const ResultsSection = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setStep("questionnaire")}>
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Results</Text>
      </View>
      <ResultsHeader />
      <FlatList
        data={policies}
        keyExtractor={(item) => String(item.policy_id)}
        renderItem={renderPolicyRow}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        scrollEnabled={false}
      />
    </>
  );

  const QuestionnaireSection = () => (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setStep("chooseType")}>
          <Text style={styles.backLink}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedType?.name}</Text>
      </View>
      <Text style={styles.subtitle}>Answer a few questions to tailor options</Text>
      {questions.map((q) => (
        <View key={q.key} style={styles.questionBlock}>
          <Text style={styles.questionLabel}>{q.label}</Text>
          {q.type === "select" && q.options ? (
            <View style={styles.selectRow}>
              {q.options.map((opt) => {
                const active = answers[q.key] === String(opt.value);
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    onPress={() => handleAnswerChange(q.key, String(opt.value))}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <TextInput
              value={answers[q.key] || ""}
              onChangeText={(t) => handleAnswerChange(q.key, t)}
              placeholder={q.placeholder}
              keyboardType={q.type === "number" ? "numeric" : "default"}
              style={styles.input}
              placeholderTextColor="#9AA0A6"
            />
          )}
        </View>
      ))}
      <TouchableOpacity disabled={isLoading} style={styles.primaryBtn} onPress={handleFindPolicies}>
        <Text style={styles.primaryBtnText}>{isLoading ? "Finding..." : "See matching policies"}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={['left', 'right']}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fullBackground}
      >
        {/* Fixed Header Content */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerGreeting}>
                {step === "chooseType" ? "Marketplace" : step === "questionnaire" ? (selectedType?.name || "Questionnaire") : "Results"}
              </Text>
            </View>
            <View style={styles.headerProfileAvatar} />
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
              {step === "chooseType" && <ChooseTypeSection />}
              {step === "questionnaire" && <QuestionnaireSection />}
              {step === "results" && <ResultsSection />}
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
  headerGreeting: { fontSize: 34, fontWeight: "700", color: "#FFFFFF" },
  headerProfileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 140,
    minHeight: '100%',
  },
  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },

  title: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#8E8E93", marginBottom: 16 },

  // Choose type
  typeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typeName: { fontSize: 16, fontWeight: "600", color: "#1C1C1E", marginBottom: 6 },
  typeDesc: { fontSize: 12, color: "#6B7280" },

  // Questionnaire
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  backLink: { color: "#007AFF", fontSize: 14, fontWeight: "600" },
  questionBlock: { marginBottom: 14 },
  questionLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  selectRow: { flexDirection: "row", flexWrap: "wrap" },
  optionChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  optionChipText: { fontSize: 13, color: "#666", fontWeight: "500" },
  optionChipTextActive: { color: "#FFFFFF" },
  primaryBtn: { backgroundColor: "#007AFF", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  // Results / aggregator
  resultsHeader: { marginTop: 4, marginBottom: 12 },
  resultsTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  sortRow: { flexDirection: "row", alignItems: "center" },
  sortLabel: { marginRight: 8, color: "#6B7280" },
  policyRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  policyName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  coverageText: { fontSize: 12, color: "#007AFF", marginTop: 6 },
  priceCol: { minWidth: 120, alignItems: "flex-end" },
  policyPrice: { fontSize: 16, fontWeight: "700", color: "#111827" },
  policyDuration: { fontSize: 12, color: "#9CA3AF", marginBottom: 8 },
  quoteButton: { backgroundColor: "#111827", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  quoteButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  separator: { height: 12 },

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

export default MarketplaceScreen;


