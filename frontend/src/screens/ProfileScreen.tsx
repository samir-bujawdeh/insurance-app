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
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  
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
          <Ionicons name={icon as any} size={24} color="#2196F3" />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
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
              <Ionicons name="person" size={40} color="#2196F3" />
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
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 36,
    paddingBottom: 36,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2196F3",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#666",
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
    color: "#1C1C1E",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#F0F0F0",
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
    backgroundColor: "#E3F2FD",
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
    color: "#1C1C1E",
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#FF3B30",
    marginLeft: 8,
  },
});

export default ProfileScreen;
