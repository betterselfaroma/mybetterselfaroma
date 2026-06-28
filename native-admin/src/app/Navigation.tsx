import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import BookingsScreen from "../screens/BookingsScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import MembersScreen from "../screens/MembersScreen";
import MemberDetailScreen from "../screens/MemberDetailScreen";
import ScanScreen from "../screens/ScanScreen";
import RewardsScreen from "../screens/RewardsScreen";
import RewardFormScreen from "../screens/RewardFormScreen";
import CmsScreen from "../screens/CmsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import NoPermissionScreen from "../screens/NoPermissionScreen";
import LoadingState from "../components/LoadingState";
import { useAuth } from "./AuthProvider";
import { colors } from "../theme";
import type { Booking, Customer, RewardProduct } from "../lib/types";

export type TabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Scan: undefined;
  Members: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  BookingDetail: { booking: Booking };
  MemberDetail: { customer: Customer };
  RewardForm: { product?: RewardProduct };
  Rewards: undefined;
  Cms: undefined;
  NoPermission: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ label, focused, scan }: { label: string; focused: boolean; scan?: boolean }) {
  if (scan) {
    return (
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: focused ? colors.gold : colors.forest,
          alignItems: "center",
          justifyContent: "center",
          marginTop: -18,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <Text style={{ color: colors.ivory, fontWeight: "800", fontSize: 16 }}>QR</Text>
      </View>
    );
  }

  return <Text style={{ color: focused ? colors.forest : colors.muted, fontSize: 12, fontWeight: "700" }}>{label}</Text>;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: colors.ivory,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: "首页", tabBarIcon: ({ focused }) => <TabIcon label="首页" focused={focused} /> }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarLabel: "预约", tabBarIcon: ({ focused }) => <TabIcon label="预约" focused={focused} /> }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: "扫码", tabBarIcon: ({ focused }) => <TabIcon label="QR" focused={focused} scan /> }} />
      <Tab.Screen name="Members" component={MembersScreen} options={{ tabBarLabel: "会员", tabBarIcon: ({ focused }) => <TabIcon label="会员" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "设置", tabBarIcon: ({ focused }) => <TabIcon label="设置" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { booting, session, profile, error } = useAuth();

  if (booting) return <LoadingState text="正在启动 Admin App..." />;
  if (!session) return <LoginScreen initialError={error} />;
  if (!profile?.canAccessAdmin) return <NoPermissionScreen profile={profile} authError={error} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
        <Stack.Screen name="RewardForm" component={RewardFormScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="Cms" component={CmsScreen} />
        <Stack.Screen name="NoPermission" component={NoPermissionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
