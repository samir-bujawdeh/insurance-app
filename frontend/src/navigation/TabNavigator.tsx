import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import PoliciesScreen from "../screens/PoliciesScreen";
import ClaimsScreen from "../screens/ClaimsScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Policies") iconName = "briefcase-outline";
          else if (route.name === "Claims") iconName = "document-text-outline";
          else if (route.name === "Payments") iconName = "card-outline";
          else if (route.name === "Profile") iconName = "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Policies" component={PoliciesScreen} />
      <Tab.Screen name="Claims" component={ClaimsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

