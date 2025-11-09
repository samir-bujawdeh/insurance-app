import React, { useContext, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Animated,
  Dimensions,
  Platform,
  Switch
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, themeMode, isDark, setThemeMode } = useTheme();
  const styles = ProfileScreenStyles(theme);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={theme.secondary} />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={theme.secondary} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </Animated.View>

        {/* Profile Sections */}
        <Animated.View 
          style={[
            styles.sectionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <ProfileItem
                icon="person-outline"
                title="Personal Information"
                subtitle="Update your profile details"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
              <ProfileItem
                icon="shield-checkmark-outline"
                title="Security"
                subtitle="Password and security settings"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
              <ProfileItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Manage your notification preferences"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionContent}>
              <ProfileItem
                icon="help-circle-outline"
                title="Help Center"
                subtitle="Get help and support"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
              <ProfileItem
                icon="chatbubble-outline"
                title="Contact Us"
                subtitle="Get in touch with our team"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
              <ProfileItem
                icon="document-text-outline"
                title="Terms & Privacy"
                subtitle="Read our terms and privacy policy"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.sectionContent}>
              <View style={styles.profileItem}>
                <View style={styles.profileItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons 
                      name={isDark ? "moon" : "sunny-outline"} 
                      size={24} 
                      color={theme.secondary} 
                    />
                  </View>
                  <View style={styles.profileItemText}>
                    <Text style={styles.profileItemTitle}>Dark Mode</Text>
                    <Text style={styles.profileItemSubtitle}>
                      {themeMode === "system" 
                        ? "Following system" 
                        : isDark 
                        ? "Enabled" 
                        : "Disabled"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={(value) => {
                    setThemeMode(value ? "dark" : "light");
                  }}
                  trackColor={{ false: theme.border, true: theme.buttonPrimary }}
                  thumbColor={isDark ? theme.textInverse : theme.surface}
                />
              </View>
              <TouchableOpacity 
                style={styles.profileItem}
                onPress={() => {
                  const options = ["Light", "Dark", "System (Follow Device)"];
                  Alert.alert(
                    "Theme Mode",
                    "Choose theme mode:",
                    [
                      ...options.map((option) => ({
                        text: option,
                        onPress: () => {
                          if (option === "Light") setThemeMode("light");
                          else if (option === "Dark") setThemeMode("dark");
                          else setThemeMode("system");
                        },
                      })),
                      { text: "Cancel", style: "cancel" },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.profileItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="color-palette-outline" size={24} color={theme.secondary} />
                  </View>
                  <View style={styles.profileItemText}>
                    <Text style={styles.profileItemTitle}>Theme Mode</Text>
                    <Text style={styles.profileItemSubtitle}>
                      Current: {themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
              <ProfileItem
                icon="information-circle-outline"
                title="About"
                subtitle="App version and information"
                onPress={() => Alert.alert("About", "Insurance Suite v1.0.0\nBuilt with React Native")}
              />
              <ProfileItem
                icon="star-outline"
                title="Rate App"
                subtitle="Rate us on the app store"
                onPress={() => Alert.alert("Coming Soon", "This feature will be available soon")}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileScreenStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 36,
    paddingBottom: 36,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: theme.surface,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.secondary + "15", // Light tint of secondary color
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.textTertiary,
  },
  sectionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.secondary + "15", // Light tint of secondary color
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.text,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.textTertiary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: theme.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;
