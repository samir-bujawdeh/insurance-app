import React, { useState, useContext, useRef, useEffect } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signupUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const SignupScreen = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Start animations on mount
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }
    
    if (!email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      Alert.alert("Validation Error", "Please enter a password");
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long");
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { name, email, password, phone } = formData;
      const response = await signupUser({ name, email, password, phone });
      
      // Store the access token
      await SecureStore.setItemAsync("access_token", response.access_token);
      
      // Log the user in automatically
      login(response.user);
      
      Alert.alert(
        "Success", 
        `Welcome ${response.user.name}! Your account has been created and you're now logged in.`,
        [{ text: "OK" }]
      );
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      let errorMessage = "Unknown error occurred";
      
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMessage = "Connection timeout. Please check:\n1. Is the backend server running?\n2. Is the IP address correct?\n3. Are you on the same network?";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Signup failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    field: string,
    placeholder: string,
    icon: string,
    keyboardType: any = "default",
    secureTextEntry: boolean = false,
    showPasswordToggle: boolean = false
  ) => {
    const isFocused = focusedField === field;
    const value = formData[field as keyof typeof formData];
    
    return (
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isFocused ? "#764ba2" : "#999"} 
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={(text) => updateField(field, text)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          autoCapitalize={field === "email" ? "none" : "words"}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          autoComplete={field === "email" ? "email" : field === "password" ? "password" : "off"}
        />
        {showPasswordToggle && (
          <TouchableOpacity 
            onPress={() => {
              if (field === "password") {
                setShowPassword(!showPassword);
              } else {
                setShowConfirmPassword(!showConfirmPassword);
              }
            }}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={
                (field === "password" ? showPassword : showConfirmPassword) 
                  ? "eye-off-outline" 
                  : "eye-outline"
              } 
              size={24} 
              color="#999" 
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View 
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our insurance platform and get started instantly</Text>
          </Animated.View>

          {/* Form Container */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Full Name Input */}
            {renderInput("name", "Full Name", "person-outline")}

            {/* Email Input */}
            {renderInput("email", "Email Address", "mail-outline", "email-address")}

            {/* Phone Input */}
            {renderInput("phone", "Phone Number (Optional)", "call-outline", "phone-number")}

            {/* Password Input */}
            {renderInput("password", "Password", "lock-closed-outline", "default", !showPassword, true)}

            {/* Confirm Password Input */}
            {renderInput("confirmPassword", "Confirm Password", "lock-closed-outline", "default", !showConfirmPassword, true)}

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.signupButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text 
                  style={styles.linkText}
                  onPress={() => navigation.navigate("Login" as never)}
                >
                  Sign in
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerContainer: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#1C1C1E",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#666",
  },
  formContainer: {
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: "#F5F7FA",
  },
  inputContainerFocused: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#764ba2",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#333",
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  signupButton: {
    borderRadius: 12,
    backgroundColor: "#764ba2",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  linkText: {
    color: "#764ba2",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default SignupScreen;
