import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Animated,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { matchPolicies, MatchedPolicy } from "../api/marketplace";
import { purchasePolicy } from "../api/policies";
import { BASE_URL } from "../api/axios";

// Helper function to get full logo URL
const getLogoUrl = (logoUrl: string | undefined | null): string | null => {
  if (!logoUrl) return null;
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  
  // If it's a relative path, prepend the API base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = logoUrl.startsWith("/") ? logoUrl.slice(1) : logoUrl;
  return `${BASE_URL}/${cleanPath}`;
};

type InsuranceClass = "A" | "B" | "C" | "";
type InsuranceType = "family" | "individual" | "";

interface FamilyMemberDOB {
  id: number;
  date: Date | null;
}

const HealthQuoteScreen = () => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const styles = HealthQuoteScreenStyles(theme, isDark);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<InsuranceClass>("");
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("");
  const [numberOfFamilyMembers, setNumberOfFamilyMembers] = useState<string>("");
  const [primaryMemberDOB, setPrimaryMemberDOB] = useState<Date | null>(null);
  const [familyMemberDOBs, setFamilyMemberDOBs] = useState<FamilyMemberDOB[]>([]);
  
  // Date picker states
  const [showPrimaryDatePicker, setShowPrimaryDatePicker] = useState(false);
  const [showFamilyDatePickers, setShowFamilyDatePickers] = useState<{ [key: number]: boolean }>({});
  
  // Temporary date values for iOS picker (only update on Done)
  const [tempPrimaryDate, setTempPrimaryDate] = useState<Date | null>(null);
  const [tempFamilyDates, setTempFamilyDates] = useState<{ [key: number]: Date | null }>({});
  
  // Dropdown states
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Focus states for inputs
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Step 2 states - Policy selection
  const [matchedPolicies, setMatchedPolicies] = useState<MatchedPolicy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Set<number>>(new Set());
  const [selectedPolicy, setSelectedPolicy] = useState<MatchedPolicy | null>(null);
  // Track selected outpatient options for each policy (key: policy_id, value: tariff_id of selected outpatient option)
  const [selectedOutpatientOptions, setSelectedOutpatientOptions] = useState<{ [policyId: number]: number | null }>({});
  // Track card heights for stacked effect (key: providerId, value: height)
  const [cardHeights, setCardHeights] = useState<{ [providerId: number]: number }>({});

  // Step 3 states - Review
  const [submittingApplication, setSubmittingApplication] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate progress bar when step changes
    // Calculate progress: 0 for step 1, 0.5 for step 2, 1 for step 3
    const progressValue = (currentStep - 1) / 2;
    Animated.spring(progressAnim, {
      toValue: progressValue,
      friction: 8,
      tension: 50,
      useNativeDriver: false, // Must be false for width animation
    }).start();
  }, [currentStep]);

  useEffect(() => {
    // Initialize family member DOBs when number of family members changes
    if (insuranceType === "family" && numberOfFamilyMembers) {
      const num = parseInt(numberOfFamilyMembers);
      if (num > 0 && num !== familyMemberDOBs.length) {
        const newDOBs: FamilyMemberDOB[] = Array.from({ length: num }, (_, index) => ({
          id: index + 1,
          date: familyMemberDOBs[index]?.date || null,
        }));
        setFamilyMemberDOBs(newDOBs);
      }
    } else if (insuranceType === "individual") {
      setFamilyMemberDOBs([]);
      setNumberOfFamilyMembers("");
    }
  }, [numberOfFamilyMembers, insuranceType]);

  const handleClassSelect = (classType: InsuranceClass) => {
    setSelectedClass(classType);
    setShowClassDropdown(false);
  };

  const handleInsuranceTypeSelect = (type: InsuranceType) => {
    setInsuranceType(type);
    setShowTypeDropdown(false);
    if (type === "individual") {
      setNumberOfFamilyMembers("");
      setFamilyMemberDOBs([]);
    }
  };

  const handlePrimaryDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // Android: Update immediately and close
      if (selectedDate) {
        setPrimaryMemberDOB(selectedDate);
      }
      setShowPrimaryDatePicker(false);
    } else {
      // iOS: Only update temporary value during scrolling
      // Never update actual state here - only when Done is clicked
      if (selectedDate) {
        // User is scrolling - update temporary value for display
        setTempPrimaryDate(selectedDate);
      }
      // Note: We don't handle "set" or "dismissed" here
      // Those are handled by the Done/Cancel buttons
    }
  };

  const handlePrimaryDateDone = () => {
    // Apply the temporary value or keep current value
    if (tempPrimaryDate) {
      setPrimaryMemberDOB(tempPrimaryDate);
    }
    setTempPrimaryDate(null);
    setShowPrimaryDatePicker(false);
    setFocusedField(null);
  };

  const handlePrimaryDateCancel = () => {
    // Discard temporary value
    setTempPrimaryDate(null);
    setShowPrimaryDatePicker(false);
    setFocusedField(null);
  };

  const handleFamilyDateChange = (memberId: number, event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // Android: Update immediately and close
      if (selectedDate) {
        setFamilyMemberDOBs((prev) =>
          prev.map((member) =>
            member.id === memberId ? { ...member, date: selectedDate } : member
          )
        );
      }
      setShowFamilyDatePickers((prev) => ({ ...prev, [memberId]: false }));
    } else {
      // iOS: Only update temporary value during scrolling
      // Never update actual state here - only when Done is clicked
      if (selectedDate) {
        // User is scrolling - update temporary value for display
        setTempFamilyDates((prev) => ({ ...prev, [memberId]: selectedDate }));
      }
      // Note: We don't handle "set" or "dismissed" here
      // Those are handled by the Done/Cancel buttons
    }
  };

  const handleFamilyDateDone = (memberId: number) => {
    // Apply the temporary value or keep current value
    const tempDate = tempFamilyDates[memberId];
    if (tempDate) {
      setFamilyMemberDOBs((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, date: tempDate } : member
        )
      );
    }
    setTempFamilyDates((prev) => {
      const newDates = { ...prev };
      delete newDates[memberId];
      return newDates;
    });
    setShowFamilyDatePickers((prev) => ({ ...prev, [memberId]: false }));
    setFocusedField(null);
  };

  const handleFamilyDateCancel = (memberId: number) => {
    // Discard temporary value
    setTempFamilyDates((prev) => {
      const newDates = { ...prev };
      delete newDates[memberId];
      return newDates;
    });
    setShowFamilyDatePickers((prev) => ({ ...prev, [memberId]: false }));
    setFocusedField(null);
  };

  // Silent validation check (no alerts) - used for UI state
  const isStep1Valid = (): boolean => {
    if (!selectedClass) return false;
    if (!insuranceType) return false;
    if (insuranceType === "family") {
      const num = parseInt(numberOfFamilyMembers);
      if (!numberOfFamilyMembers || isNaN(num) || num <= 0) return false;
    }
    if (!primaryMemberDOB) return false;
    if (insuranceType === "family") {
      const missingDOBs = familyMemberDOBs.filter((member) => !member.date);
      if (missingDOBs.length > 0) return false;
    }
    return true;
  };

  // Validation with alerts - called only when user tries to proceed
  const validateStep1 = (): boolean => {
    if (!selectedClass) {
      Alert.alert("Validation Error", "Please select an insurance class");
      return false;
    }

    if (!insuranceType) {
      Alert.alert("Validation Error", "Please select Family or Individual");
      return false;
    }

    if (insuranceType === "family") {
      const num = parseInt(numberOfFamilyMembers);
      if (!numberOfFamilyMembers || isNaN(num) || num <= 0) {
        Alert.alert("Validation Error", "Please enter a valid number of family members");
        return false;
      }
    }

    if (!primaryMemberDOB) {
      Alert.alert("Validation Error", "Please select the date of birth for the primary member");
      return false;
    }

    if (insuranceType === "family") {
      const missingDOBs = familyMemberDOBs.filter((member) => !member.date);
      if (missingDOBs.length > 0) {
        Alert.alert(
          "Validation Error",
          `Please select date of birth for all ${numberOfFamilyMembers} family member(s)`
        );
        return false;
      }
    }

    return true;
  };

  // Calculate age from date of birth
  const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch matching policies when entering Step 2
  useEffect(() => {
    if (currentStep === 2 && primaryMemberDOB && selectedClass && insuranceType) {
      fetchMatchingPolicies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const fetchMatchingPolicies = async () => {
    if (!primaryMemberDOB) return;

    setLoadingPolicies(true);
    try {
      const primaryAge = calculateAge(primaryMemberDOB);
      const familyAges = familyMemberDOBs
        .filter((member) => member.date)
        .map((member) => calculateAge(member.date!));

      const criteria = {
        insurance_class: selectedClass,
        insurance_type: insuranceType,
        primary_age: primaryAge,
        family_size: insuranceType === "family" ? parseInt(numberOfFamilyMembers) : undefined,
        family_ages: insuranceType === "family" && familyAges.length > 0 ? familyAges : undefined,
      };

      const policies = await matchPolicies(criteria);
      setMatchedPolicies(policies);
    } catch (error: any) {
      console.error("Error fetching matching policies:", error);
      Alert.alert("Error", error?.response?.data?.detail || "Failed to fetch matching policies");
    } finally {
      setLoadingPolicies(false);
    }
  };

  const toggleProviderExpansion = (providerId: number) => {
    setExpandedProviders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(providerId)) {
        newSet.delete(providerId);
      } else {
        newSet.add(providerId);
      }
      return newSet;
    });
  };

  const handlePolicySelect = (policy: MatchedPolicy) => {
    setSelectedPolicy(policy);
  };

  const handleOutpatientOptionToggle = (policyId: number, tariffId: number) => {
    setSelectedOutpatientOptions((prev) => {
      const current = prev[policyId];
      // If this option is already selected, deselect it; otherwise, select it
      return {
        ...prev,
        [policyId]: current === tariffId ? null : tariffId,
      };
    });
  };

  const handleProceed = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!selectedPolicy) {
        Alert.alert("Selection Required", "Please select a policy to continue");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleApplyForInsurance();
    }
  };

  const handleApplyForInsurance = async () => {
    if (!selectedPolicy || !user) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setSubmittingApplication(true);
    try {
      const result = await purchasePolicy(user.user_id, selectedPolicy.policy.policy_id);
      console.log("Policy purchase successful:", result);
      Alert.alert(
        "Success",
        "Your insurance application has been submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error applying for insurance:", error);
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        "Failed to submit application. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleStepNavigation = (stepNumber: number) => {
    // Only allow navigation to completed steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };


  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: "Information" },
      { number: 2, label: "Policies" },
      { number: 3, label: "Review" },
    ];

    // Calculate the available width for the progress line
    // Container width minus padding (20px each side) minus left/right offsets (45px each)
    const screenWidth = Dimensions.get("window").width;
    const containerPadding = 20 * 2; // paddingHorizontal on progressContainer
    const lineOffsets = 45 * 2; // left + right on progressLine
    const availableWidth = screenWidth - containerPadding - lineOffsets;

    return (
      <View style={styles.progressBarContent}>
        {/* Background Line */}
        <View style={styles.progressLineBackground} />
        
        {/* Completed Progress Line */}
        <Animated.View
          style={[
            styles.progressLineCompleted,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, availableWidth],
              }),
            },
          ]}
        />

        {/* Step Indicators */}
        <View style={styles.progressStepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const isPending = currentStep < step.number;
            const isClickable = step.number <= currentStep;

            return (
              <TouchableOpacity
                key={step.number}
                style={styles.progressStepWrapper}
                onPress={() => handleStepNavigation(step.number)}
                disabled={!isClickable}
                activeOpacity={isClickable ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.progressStepCircle,
                    isActive && styles.progressStepCircleActive,
                    isCompleted && styles.progressStepCircleCompleted,
                    isPending && styles.progressStepCirclePending,
                    isClickable && styles.progressStepCircleClickable,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={18} color={theme.textInverse} />
                  ) : isActive ? (
                    <View style={styles.progressStepDot} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.progressStepLabel,
                    isActive && styles.progressStepLabelActive,
                    isCompleted && styles.progressStepLabelCompleted,
                    isPending && styles.progressStepLabelPending,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                >
                  {step.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderPicker = (
    label: string,
    value: string,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void,
    icon: string,
    show: boolean,
    setShow: (show: boolean) => void
  ) => {
    const isFocused = focusedField === label;
    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : label;
    
    return (
      <View style={styles.pickerWrapper}>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && [styles.inputContainerFocused, { borderColor: theme.inputBorderFocused }],
            show && [styles.inputContainerFocused, { borderColor: theme.inputBorderFocused }],
          ]}
          onPress={() => {
            setFocusedField(label);
            // Close other dropdowns
            if (label === "Select Insurance Class") {
              setShowTypeDropdown(false);
            } else if (label === "Select Coverage Type") {
              setShowClassDropdown(false);
            }
            // Toggle this dropdown
            setShow(!show);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={show || isFocused ? theme.inputBorderFocused : theme.inputPlaceholder}
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.dropdownText,
              !value && styles.dropdownPlaceholder,
            ]}
          >
            {displayText}
          </Text>
          <Ionicons
            name={show ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.inputPlaceholder}
          />
        </TouchableOpacity>
        
        {show && (
          <View style={styles.dropdownMenu}>
            <ScrollView 
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownMenuItem,
                    value === option.value && styles.dropdownMenuItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setShow(false);
                    setFocusedField(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownMenuItemText,
                      value === option.value && styles.dropdownMenuItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.buttonPrimary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderInput = (
    field: string,
    placeholder: string,
    icon: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = "default",
    editable: boolean = true
  ) => {
    const isFocused = focusedField === field;
    
    return (
      <View
        style={[
          styles.inputContainer,
          isFocused && [styles.inputContainerFocused, { borderColor: theme.inputBorderFocused }],
          !editable && styles.inputContainerDisabled,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isFocused ? theme.inputBorderFocused : theme.inputPlaceholder}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          keyboardType={keyboardType}
          editable={editable}
          style={[styles.input, !editable && styles.inputDisabled]}
        />
      </View>
    );
  };

  const renderDatePicker = (
    label: string,
    value: Date | null,
    showPicker: boolean,
    onShow: () => void,
    onChange: (event: any, selectedDate?: Date) => void,
    onDone: () => void,
    onCancel: () => void,
    icon: string = "calendar-outline",
    tempValue?: Date | null
  ) => {
    const isFocused = focusedField === label;
    // Use temp value if available (iOS scrolling), otherwise use actual value
    const displayValue = Platform.OS === "ios" && tempValue ? tempValue : (value || new Date());
    
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && [styles.inputContainerFocused, { borderColor: theme.inputBorderFocused }],
          ]}
          onPress={() => {
            setFocusedField(label);
            onShow();
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={isFocused ? theme.inputBorderFocused : theme.inputPlaceholder}
            style={styles.inputIcon}
          />
          <Text
            style={[
              styles.dropdownText,
              !value && styles.dropdownPlaceholder,
            ]}
          >
            {value ? value.toLocaleDateString() : label}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.inputPlaceholder} />
        </TouchableOpacity>
        
        {showPicker && (
          <View style={styles.datePickerContainer}>
            {Platform.OS === "ios" && (
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={styles.datePickerCancelButton}
                >
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDone}
                  style={styles.datePickerDoneButton}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={displayValue}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChange}
              maximumDate={new Date()}
              style={styles.datePicker}
              themeVariant={isDark ? "dark" : "light"}
              textColor={theme.text}
            />
          </View>
        )}
      </View>
    );
  };

  const renderStep1 = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Insurance Information</Text>
            <Text style={styles.sectionSubtitle}>Please provide the following details to get a quote</Text>

            {/* Name Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              {renderInput(
                "userName",
                "Full Name",
                "person-outline",
                user?.name || "",
                () => {},
                "default",
                false
              )}
            </View>

            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              {renderInput(
                "userEmail",
                "Email Address",
                "mail-outline",
                user?.email || "",
                () => {},
                "email-address",
                false
              )}
            </View>

            {/* Phone Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              {renderInput(
                "userPhone",
                "Phone Number",
                "call-outline",
                user?.phone || "",
                () => {},
                "phone-pad",
                false
              )}
            </View>

            {/* Insurance Class Picker */}
            <View style={[styles.inputWrapper, showClassDropdown && styles.inputWrapperActive]}>
              <Text style={styles.label}>Insurance Class</Text>
              {renderPicker(
                "Select Insurance Class",
                selectedClass,
                [
                  { label: "Class A", value: "A" },
                  { label: "Class B", value: "B" },
                  { label: "Class C", value: "C" },
                ],
                (value) => handleClassSelect(value as InsuranceClass),
                "shield-outline",
                showClassDropdown,
                setShowClassDropdown
              )}
            </View>

            {/* Insurance Type Picker */}
            <View style={[styles.inputWrapper, showTypeDropdown && styles.inputWrapperActive]}>
              <Text style={styles.label}>Coverage Type</Text>
              {renderPicker(
                "Select Coverage Type",
                insuranceType,
                [
                  { label: "Family Coverage", value: "family" },
                  { label: "Individual Coverage", value: "individual" },
                ],
                (value) => handleInsuranceTypeSelect(value as InsuranceType),
                "people-outline",
                showTypeDropdown,
                setShowTypeDropdown
              )}
            </View>

            {/* Number of Family Members */}
            {insuranceType === "family" && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Number of Family Members</Text>
                {renderInput(
                  "numberOfFamilyMembers",
                  "Enter number of family members",
                  "people-outline",
                  numberOfFamilyMembers,
                  setNumberOfFamilyMembers,
                  "number-pad",
                  true
                )}
              </View>
            )}

            {/* Primary Member Date of Birth */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Primary Member Date of Birth
                {user?.name && ` (${user.name})`}
              </Text>
              {renderDatePicker(
                "Primary Member Date of Birth",
                primaryMemberDOB,
                showPrimaryDatePicker,
                () => {
                  setTempPrimaryDate(primaryMemberDOB);
                  setShowPrimaryDatePicker(true);
                },
                handlePrimaryDateChange,
                handlePrimaryDateDone,
                handlePrimaryDateCancel,
                undefined,
                tempPrimaryDate
              )}
            </View>

            {/* Family Member Date of Birth Fields */}
            {insuranceType === "family" &&
              familyMemberDOBs.length > 0 &&
              familyMemberDOBs.map((member) => (
                <View key={member.id} style={styles.inputWrapper}>
                  <Text style={styles.label}>Family Member {member.id} Date of Birth</Text>
                  {renderDatePicker(
                    `Family Member ${member.id} Date of Birth`,
                    member.date,
                    showFamilyDatePickers[member.id] || false,
                    () => {
                      setTempFamilyDates((prev) => ({ ...prev, [member.id]: member.date }));
                      setShowFamilyDatePickers((prev) => ({ ...prev, [member.id]: true }));
                    },
                    (event, date) => handleFamilyDateChange(member.id, event, date),
                    () => handleFamilyDateDone(member.id),
                    () => handleFamilyDateCancel(member.id),
                    undefined,
                    tempFamilyDates[member.id]
                  )}
                </View>
              ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // Group policies by provider
  const groupPoliciesByProvider = (policies: MatchedPolicy[]) => {
    const grouped: { [key: number]: MatchedPolicy[] } = {};
    policies.forEach((policy) => {
      const providerId = policy.policy.provider.provider_id;
      if (!grouped[providerId]) {
        grouped[providerId] = [];
      }
      grouped[providerId].push(policy);
    });
    return grouped;
  };

  const renderPolicyCard = (policy: MatchedPolicy, isSelected: boolean) => {
    const tariff = policy.matching_tariff;
    const premium = tariff.total_usd || tariff.inpatient_usd || 0;
    const selectedOutpatientTariffId = selectedOutpatientOptions[policy.policy.policy_id] || null;
    const selectedOutpatientOption = policy.outpatient_options.find(
      opt => opt.tariff_id === selectedOutpatientTariffId
    );
    const totalPrice = premium + (selectedOutpatientOption?.outpatient_price_usd || 0);

    return (
      <TouchableOpacity
        key={`${policy.policy.policy_id}-${tariff.tariff_id}`}
        style={[
          styles.policyCard,
          isSelected && styles.policyCardSelected,
        ]}
        onPress={() => handlePolicySelect(policy)}
        activeOpacity={0.7}
      >
        <View style={styles.policyCardHeader}>
          <View style={styles.policyCardTitleRow}>
            <Text style={styles.policyCardTitle}>{policy.policy.name}</Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={theme.buttonPrimary} />
            )}
          </View>
          {getLogoUrl(policy.policy.provider.logo_url) && (
            <Image
              source={{ uri: getLogoUrl(policy.policy.provider.logo_url)! }}
              style={styles.providerLogo}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={styles.providerName}>{policy.policy.provider.name}</Text>

        {policy.policy.description && (
          <Text style={styles.policyDescription} numberOfLines={2}>
            {policy.policy.description}
          </Text>
        )}

        <View style={styles.policyCardFooter}>
          <View style={styles.premiumContainer}>
            <Text style={styles.premiumLabel}>Premium</Text>
            <Text style={styles.premiumAmount}>${totalPrice.toFixed(2)}</Text>
          </View>
          {policy.policy.duration && (
            <Text style={styles.durationText}>{policy.policy.duration}</Text>
          )}
        </View>
        {selectedOutpatientOption && (
          <Text style={styles.premiumBreakdown}>
            (Base: ${premium.toFixed(2)} + Outpatient: +${selectedOutpatientOption.outpatient_price_usd?.toFixed(2) || '0.00'})
          </Text>
        )}

        {/* Outpatient Options as Add-ons */}
        {policy.outpatient_options.length > 0 && (
          <View style={styles.outpatientOptionsContainer}>
            <Text style={styles.outpatientOptionsTitle}>Outpatient Coverage (Add-ons):</Text>
            <View style={styles.outpatientOptionsList}>
              {policy.outpatient_options.map((option) => {
                const isSelected = selectedOutpatientTariffId === option.tariff_id;
                return (
                  <TouchableOpacity
                    key={option.tariff_id}
                    style={[
                      styles.outpatientOptionItem,
                      isSelected && styles.outpatientOptionItemSelected,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOutpatientOptionToggle(policy.policy.policy_id, option.tariff_id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.outpatientOptionContent}>
                      <View style={[
                        styles.outpatientOptionCheckbox,
                        isSelected && styles.outpatientOptionCheckboxSelected,
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={theme.textInverse} />
                        )}
                      </View>
                      <Text style={styles.outpatientOptionText}>
                        {(option.outpatient_coverage_percentage * 100).toFixed(0)}% Coverage
                      </Text>
                    </View>
                    {option.outpatient_price_usd !== undefined && option.outpatient_price_usd !== null && (
                      <Text style={styles.outpatientOptionPrice}>
                        +${option.outpatient_price_usd.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderProviderSection = (providerId: number, policies: MatchedPolicy[]) => {
    const isExpanded = expandedProviders.has(providerId);
    const provider = policies[0].policy.provider;
    const visiblePolicies = isExpanded ? policies : [policies[0]];
    const hasMore = policies.length > 1;
    const hiddenCount = policies.length - 1;
    // Show stacked cards (max 3) when collapsed
    const stackedCardsCount = !isExpanded && hasMore ? Math.min(hiddenCount, 3) : 0;

    return (
      <View key={providerId} style={styles.providerSection}>
        <View style={styles.providerHeader}>
          <View style={styles.providerHeaderLeft}>
            {getLogoUrl(provider.logo_url) && (
              <Image
                source={{ uri: getLogoUrl(provider.logo_url)! }}
                style={styles.providerHeaderLogo}
                resizeMode="contain"
              />
            )}
            <View>
              <Text style={styles.providerHeaderName}>{provider.name}</Text>
              {provider.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
          {hasMore && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => toggleProviderExpansion(providerId)}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>
                {isExpanded ? "Show Less" : `Show More (${policies.length - 1})`}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.buttonPrimary}
              />
            </TouchableOpacity>
          )}
        </View>

        {!isExpanded ? (
          // Render only the main card when collapsed
          <View style={styles.policiesContainer}>
            {renderPolicyCard(
              visiblePolicies[0],
              selectedPolicy?.policy.policy_id === visiblePolicies[0].policy.policy_id
            )}
          </View>
        ) : (
          // Render normally when expanded
          <View style={styles.policiesContainer}>
            {visiblePolicies.map((policy) =>
              renderPolicyCard(policy, selectedPolicy?.policy.policy_id === policy.policy.policy_id)
            )}
          </View>
        )}
      </View>
    );
  };

  const renderStep2 = () => {
    if (loadingPolicies) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.buttonPrimary} />
          <Text style={styles.loadingText}>Finding matching policies...</Text>
        </View>
      );
    }

    if (matchedPolicies.length === 0) {
      return (
        <View style={styles.placeholderContainer}>
          <Ionicons name="search-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.placeholderTitle}>No Matching Policies</Text>
          <Text style={styles.placeholderDescription}>
            We couldn't find any policies that match your criteria. Please try adjusting your search parameters.
          </Text>
        </View>
      );
    }

    const groupedPolicies = groupPoliciesByProvider(matchedPolicies);
    const providerIds = Object.keys(groupedPolicies)
      .map(Number)
      .sort((a, b) => {
        const providerA = groupedPolicies[a][0].policy.provider;
        const providerB = groupedPolicies[b][0].policy.provider;
        return (providerB.rating || 0) - (providerA.rating || 0); // Sort by rating descending
      });

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.step2Content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Available Policies</Text>
        <Text style={styles.sectionSubtitle}>
          Select a policy that best fits your needs
        </Text>

        {providerIds.map((providerId) =>
          renderProviderSection(providerId, groupedPolicies[providerId])
        )}
      </ScrollView>
    );
  };

  const renderStep3 = () => {
    if (!selectedPolicy) {
      return (
        <View style={styles.placeholderContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.placeholderTitle}>No Policy Selected</Text>
          <Text style={styles.placeholderDescription}>
            Please go back and select a policy.
          </Text>
        </View>
      );
    }

    const tariff = selectedPolicy.matching_tariff;
    const premium = tariff.total_usd || tariff.inpatient_usd || 0;
    const primaryAge = primaryMemberDOB ? calculateAge(primaryMemberDOB) : 0;
    const selectedOutpatientTariffId = selectedOutpatientOptions[selectedPolicy.policy.policy_id] || null;
    const selectedOutpatientOption = selectedPolicy.outpatient_options.find(
      opt => opt.tariff_id === selectedOutpatientTariffId
    );
    const totalPrice = premium + (selectedOutpatientOption?.outpatient_price_usd || 0);

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.step3Content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Review Your Application</Text>
        <Text style={styles.sectionSubtitle}>
          Please review all information before submitting
        </Text>

        {/* User Information Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Your Information</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Name</Text>
            <Text style={styles.reviewValue}>{user?.name || "N/A"}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Email</Text>
            <Text style={styles.reviewValue}>{user?.email || "N/A"}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Phone</Text>
            <Text style={styles.reviewValue}>{user?.phone || "N/A"}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Insurance Class</Text>
            <Text style={styles.reviewValue}>
              Class {selectedClass}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Coverage Type</Text>
            <Text style={styles.reviewValue}>
              {insuranceType === "family" ? "Family Coverage" : "Individual Coverage"}
            </Text>
          </View>
          {insuranceType === "family" && (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Family Members</Text>
              <Text style={styles.reviewValue}>{numberOfFamilyMembers}</Text>
            </View>
          )}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Primary Member Age</Text>
            <Text style={styles.reviewValue}>{primaryAge} years</Text>
          </View>
          {insuranceType === "family" && familyMemberDOBs.length > 0 && (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Family Member Ages</Text>
              <Text style={styles.reviewValue}>
                {familyMemberDOBs
                  .filter((m) => m.date)
                  .map((m) => calculateAge(m.date!))
                  .join(", ")} years
              </Text>
            </View>
          )}
        </View>

        {/* Policy Details Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Selected Policy</Text>
          <View style={styles.policyReviewCard}>
            <View style={styles.policyReviewHeader}>
              {getLogoUrl(selectedPolicy.policy.provider.logo_url) && (
                <Image
                  source={{ uri: getLogoUrl(selectedPolicy.policy.provider.logo_url)! }}
                  style={styles.policyReviewLogo}
                  resizeMode="contain"
                />
              )}
              <View style={styles.policyReviewHeaderText}>
                <Text style={styles.policyReviewName}>{selectedPolicy.policy.name}</Text>
                <Text style={styles.policyReviewProvider}>
                  {selectedPolicy.policy.provider.name}
                </Text>
              </View>
            </View>

            {selectedPolicy.policy.description && (
              <Text style={styles.policyReviewDescription}>
                {selectedPolicy.policy.description}
              </Text>
            )}

            <View style={styles.policyReviewDetails}>
              <View style={styles.policyReviewDetailItem}>
                <Text style={styles.policyReviewDetailLabel}>Class Type</Text>
                <Text style={styles.policyReviewDetailValue}>
                  {tariff.class_type.toUpperCase()}
                </Text>
              </View>
              {selectedPolicy.policy.duration && (
                <View style={styles.policyReviewDetailItem}>
                  <Text style={styles.policyReviewDetailLabel}>Duration</Text>
                  <Text style={styles.policyReviewDetailValue}>
                    {selectedPolicy.policy.duration}
                  </Text>
                </View>
              )}
              {selectedOutpatientOption && (
                <View style={styles.policyReviewDetailItem}>
                  <Text style={styles.policyReviewDetailLabel}>Outpatient Coverage</Text>
                  <Text style={styles.policyReviewDetailValue}>
                    {(selectedOutpatientOption.outpatient_coverage_percentage * 100).toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Cost Breakdown Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Cost Breakdown</Text>
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base Premium</Text>
              <Text style={styles.costValue}>${premium.toFixed(2)}</Text>
            </View>
            {selectedOutpatientOption && selectedOutpatientOption.outpatient_price_usd && selectedOutpatientOption.outpatient_price_usd > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  Outpatient Coverage ({(selectedOutpatientOption.outpatient_coverage_percentage * 100).toFixed(0)}%)
                </Text>
                <Text style={styles.costValue}>+${selectedOutpatientOption.outpatient_price_usd.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.costRow, styles.costRowTotal]}>
              <Text style={styles.costLabelTotal}>Total</Text>
              <Text style={styles.costValueTotal}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.fullBackground}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.topBackButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {renderProgressBar()}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {renderCurrentStep()}
        </View>

        {/* Footer with Proceed Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              (currentStep === 1 && !isStep1Valid()) && styles.proceedButtonDisabled,
              (currentStep === 2 && !selectedPolicy) && styles.proceedButtonDisabled,
              submittingApplication && styles.proceedButtonDisabled,
            ]}
            onPress={handleProceed}
            disabled={
              (currentStep === 1 && !isStep1Valid()) ||
              (currentStep === 2 && !selectedPolicy) ||
              submittingApplication
            }
            activeOpacity={0.8}
          >
            {submittingApplication ? (
              <>
                <ActivityIndicator size="small" color={theme.textInverse} />
                <Text style={styles.proceedButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.proceedButtonText}>
                  {currentStep === 3 ? "Apply for Insurance" : "Proceed"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={theme.textInverse} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewContext>
  );
};

const HealthQuoteScreenStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    fullBackground: {
      flex: 1,
      backgroundColor: theme.background,
    },
    topBackButton: {
      position: "absolute",
      top: 20,
      left: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 20,
    },
    progressContainer: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      paddingTop: 60,
    },
    progressBarContent: {
      paddingVertical: 0,
      paddingHorizontal: 0,
      position: "relative",
      minHeight: 60,
      justifyContent: "center",
    },
    progressLineBackground: {
      position: "absolute",
      left: 45, // Start after first circle
      right: 45, // End before last circle
      top: 30, // Center of 40px circle (20px radius) at 30px from top
      marginTop: -1.5, // Half of height (3px) to center the line on the circle
      height: 3,
      backgroundColor: theme.borderLight,
      zIndex: 0,
    },
    progressLineCompleted: {
      position: "absolute",
      left: 45, // Start after first circle
      top: 30, // Center of 40px circle (20px radius) at 30px from top
      marginTop: -1.5, // Half of height (3px) to center the line on the circle
      height: 3,
      backgroundColor: theme.buttonPrimary,
      zIndex: 1,
    },
    progressStepsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 2,
      paddingVertical: 12,
    },
    progressStepWrapper: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },
    progressStepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
      borderWidth: 2,
      backgroundColor: theme.card,
      borderColor: theme.borderMedium,
    },
    progressStepCircleActive: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
      borderWidth: 3,
    },
    progressStepCircleCompleted: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
    progressStepCirclePending: {
      backgroundColor: theme.card,
      borderColor: theme.borderLight,
    },
    progressStepCircleClickable: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    progressStepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.textInverse,
    },
    progressStepLabel: {
      fontSize: 11,
      fontWeight: "500",
      color: theme.textSecondary,
      textAlign: "center",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      maxWidth: 90,
    },
    progressStepLabelActive: {
      color: theme.text,
      fontWeight: "700",
      fontSize: 12,
    },
    progressStepLabelCompleted: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 11,
    },
    progressStepLabelPending: {
      color: theme.textTertiary,
    },
    contentCard: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    formContainer: {
      padding: 24,
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    sectionSubtitle: {
      fontSize: 16,
      fontWeight: "400",
      color: theme.textTertiary,
      marginBottom: 32,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    inputWrapper: {
      marginBottom: 24,
      zIndex: 1,
    },
    inputWrapperActive: {
      zIndex: 100,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.borderMedium,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 4,
      backgroundColor: theme.inputBackground,
      minHeight: 56,
    },
    inputContainerFocused: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
    },
    inputContainerDisabled: {
      backgroundColor: theme.borderLight,
      opacity: 0.6,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      color: theme.text,
      paddingVertical: 16,
    },
    inputDisabled: {
      color: theme.textTertiary,
    },
    pickerWrapper: {
      position: "relative",
      zIndex: 10,
    },
    dropdownMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      marginTop: 8,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderLight,
      maxHeight: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 1000,
    },
    dropdownScrollView: {
      maxHeight: 200,
    },
    dropdownMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    dropdownMenuItemSelected: {
      backgroundColor: theme.inputBackground,
    },
    dropdownMenuItemText: {
      fontSize: 16,
      fontWeight: "400",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      color: theme.text,
    },
    dropdownMenuItemTextSelected: {
      fontWeight: "600",
      color: theme.buttonPrimary,
    },
    dropdownText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      color: theme.text,
      paddingVertical: 16,
    },
    dropdownPlaceholder: {
      color: theme.inputPlaceholder,
    },
    datePickerContainer: {
      marginTop: 12,
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: Platform.OS === "ios" ? 16 : 0,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    datePickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    datePickerCancelButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    datePickerCancelText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    datePickerDoneButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.buttonPrimary,
      borderRadius: 8,
      alignItems: "center",
    },
    datePickerDoneText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textInverse,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    datePicker: {
      width: "100%",
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    placeholderTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginTop: 24,
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    placeholderSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 16,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    placeholderDescription: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: "center",
      lineHeight: 22,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    footer: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: 30,
      backgroundColor: theme.background,
    },
    proceedButton: {
      flexDirection: "row",
      backgroundColor: theme.buttonPrimary,
      borderRadius: 12,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    proceedButtonDisabled: {
      backgroundColor: theme.border,
      opacity: 0.5,
    },
    proceedButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.textInverse,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      letterSpacing: 0.5,
    },
    // Step 2 Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    step2Content: {
      padding: 24,
      paddingBottom: 100,
    },
    providerSection: {
      marginBottom: 32,
    },
    providerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    providerHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    providerHeaderLogo: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    providerHeaderName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    showMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    showMoreText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.buttonPrimary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policiesContainer: {
      gap: 16,
    },
    stackedCardsContainer: {
      position: "relative",
      marginBottom: 12,
      paddingTop: 12, // Space for upward offset of stacked cards
      paddingRight: 18, // Space for right offset of stacked cards (doesn't affect centering)
    },
    stackedCard: {
      position: "absolute",
      left: 0,
      right: 0,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
    },
    stackedCardTop: {
      position: "relative",
      zIndex: 10, // Main card is on top
      width: "100%", // Ensure full width for centering
    },
    policyCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.borderLight,
      marginBottom: 12,
    },
    policyCardSelected: {
      borderColor: theme.buttonPrimary,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
    },
    policyCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    policyCardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 8,
    },
    policyCardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      flex: 1,
    },
    providerLogo: {
      width: 50,
      height: 50,
    },
    providerName: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      marginBottom: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyDescription: {
      fontSize: 14,
      color: theme.textTertiary,
      marginBottom: 12,
      lineHeight: 20,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    premiumContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
    premiumLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    premiumAmount: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.buttonPrimary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    durationText: {
      fontSize: 12,
      color: theme.textTertiary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    outpatientBadge: {
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: isDark
        ? "rgba(34, 197, 94, 0.2)"
        : "rgba(34, 197, 94, 0.1)",
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    outpatientText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#22c55e",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    outpatientOptionsContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    outpatientOptionsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    outpatientOptionsList: {
      gap: 8,
    },
    outpatientOptionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderLight,
      backgroundColor: theme.inputBackground,
    },
    outpatientOptionItemSelected: {
      borderColor: theme.buttonPrimary,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
    },
    outpatientOptionContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    outpatientOptionCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.borderMedium,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.card,
    },
    outpatientOptionCheckboxSelected: {
      backgroundColor: theme.buttonPrimary,
      borderColor: theme.buttonPrimary,
    },
    outpatientOptionText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    outpatientOptionPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.buttonPrimary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    premiumBreakdown: {
      fontSize: 11,
      color: theme.textTertiary,
      marginTop: 8,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      textAlign: "left",
    },
    // Step 3 Styles
    step3Content: {
      padding: 24,
      paddingBottom: 100,
    },
    reviewSection: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    reviewSectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 16,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    reviewItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    reviewLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    reviewValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      textAlign: "right",
      flex: 1,
      marginLeft: 16,
    },
    policyReviewCard: {
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.buttonPrimary,
    },
    policyReviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    policyReviewLogo: {
      width: 50,
      height: 50,
      marginRight: 12,
    },
    policyReviewHeaderText: {
      flex: 1,
    },
    policyReviewName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyReviewProvider: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyReviewDescription: {
      fontSize: 14,
      color: theme.textTertiary,
      lineHeight: 20,
      marginBottom: 16,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyReviewDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    policyReviewDetailItem: {
      flex: 1,
      minWidth: "45%",
    },
    policyReviewDetailLabel: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.textSecondary,
      marginBottom: 4,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    policyReviewDetailValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    costBreakdown: {
      gap: 12,
    },
    costRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    costLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.textSecondary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    costValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    costRowTotal: {
      borderTopWidth: 2,
      borderTopColor: theme.borderMedium,
      paddingTop: 16,
      marginTop: 8,
    },
    costLabelTotal: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    costValueTotal: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.buttonPrimary,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
  });

export default HealthQuoteScreen;
