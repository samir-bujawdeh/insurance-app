import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  Appearance,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur"; // ✨ Native blur for iOS

import HomeScreen from "../screens/HomeScreen";
import PoliciesScreen from "../screens/PoliciesScreen";
import ClaimsScreen from "../screens/ClaimsScreen";
import MarketplaceScreen from "../screens/MarketplaceScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");
const tabRoutes = ["Home", "Policies", "+", "Claims", "Notifications"];
const tabWidth = (width - 56) / tabRoutes.length;
const isDarkMode = Appearance.getColorScheme() === "dark";

const TabNavigator = () => {
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const currentTabIndex = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTabPress = (routeName: string, navigation: any) => {
    // Reset opacity to 0.5, then fade in
    fadeAnim.setValue(0.5);
    navigation.navigate(routeName);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const renderTabBar = ({ state, descriptors, navigation }: any) => {
    if (currentTabIndex.current !== state.index) {
      currentTabIndex.current = state.index;
      Animated.spring(indicatorPosition, {
        toValue: state.index,
        useNativeDriver: true,
        tension: 70,
        friction: 8,
      }).start();
    }

    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.pillContainer}>
          {/* ✅ Frosted iOS 26-style indicator */}
          <Animated.View
            style={[
              styles.indicatorWrapper,
              {
                transform: [
                  {
                    translateX: indicatorPosition.interpolate({
                      inputRange: [0, tabRoutes.length - 1],
                      outputRange: [
                        8,
                        8 + (tabRoutes.length - 1) * tabWidth,
                      ],
                    }),
                  },
                ],
              },
            ]}
          >
            {Platform.OS === "ios" ? (
              <BlurView
                tint={isDarkMode ? "dark" : "light"}
                intensity={30}
                style={styles.indicator}
              />
            ) : (
              <View style={[styles.indicator, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            )}
          </Animated.View>

          {/* Tab buttons */}
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const iconMap: { [key: string]: string } = {
              Home: "home",
              Policies: "briefcase",
              "+": "add-circle",
              Claims: "document-text",
              Notifications: "notifications",
            };

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(route.name, navigation)}
                style={styles.tabButton}
              >
                <Ionicons
                  name={
                    isFocused
                      ? (iconMap[route.name] as any)
                      : (`${iconMap[route.name]}-outline` as any)
                  }
                  size={24}
                  color={isFocused ? "#764ba2" : "#8E8E93"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={renderTabBar}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Policies" component={PoliciesScreen} />
        <Tab.Screen name="+" component={MarketplaceScreen} />
        <Tab.Screen name="Claims" component={ClaimsScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
      </Tab.Navigator>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...(Platform.OS === "ios" && {
      backgroundColor: "rgba(255, 255, 255, 0.75)",
    }),
  },
  indicatorWrapper: {
    position: "absolute",
    left: 0,
    top: 5,
    width: tabWidth,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  indicator: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#764ba2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});

export default TabNavigator;
