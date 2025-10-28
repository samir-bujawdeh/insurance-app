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
import { loginUser, getCurrentUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values - using useRef to persist between renders
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      const userData = await getCurrentUser();
      login(userData);
      Alert.alert("Success", `Welcome ${userData.name}`);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      let errorMessage = "Unknown error occurred";
      
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMessage = "Connection timeout. Please check:\n1. Is the backend server running?\n2. Is the IP address correct?\n3. Are you on the same network?";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Login failed", errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}> Welcome</Text>
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
              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={24} 
                  color={emailFocused ? "#2196F3" : "#999"} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  autoComplete="email"
                />
              </View>

              {/* Password Input */}
              <View style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={24} 
                  color={passwordFocused ? "#2196F3" : "#999"} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{" "}
                  <Text 
                    style={styles.linkText}
                    onPress={() => navigation.navigate("Signup" as never)}
                  >
                    Sign up
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
    color: "#0D47A1",
  },
  formContainer: {
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: "#F5F7FA",
  },
  inputContainerFocused: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#2196F3",
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
  passwordInput: {
    paddingRight: 8,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    backgroundColor: "#2196F3",
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
    color: "#2196F3",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default LoginScreen;
