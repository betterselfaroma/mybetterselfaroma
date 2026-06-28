import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
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
import { colors, radius, shadow } from "../theme";
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

const TAB_META: Record<keyof TabParamList, { label: string; glyph: string }> = {
  Dashboard: { label: "首页", glyph: "H" },
  Bookings: { label: "预约", glyph: "B" },
  Scan: { label: "扫码", glyph: "QR" },
  Members: { label: "会员", glyph: "M" },
  Settings: { label: "设置", glyph: "S" },
};

function TabIcon({ route, focused }: { route: keyof TabParamList; focused: boolean }) {
  const meta = TAB_META[route];
  const isScan = route === "Scan";
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive, isScan && styles.scanWrap, isScan && focused && styles.scanWrapActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive, isScan && styles.scanText]}>{meta.glyph}</Text>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabel: TAB_META[route.name as keyof TabParamList].label,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ focused }) => <TabIcon route={route.name as keyof TabParamList} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Members" component={MembersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 76,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,253,247,0.96)",
    borderTopWidth: 0,
    borderRadius: 28,
    ...shadow.lifted,
  },
  tabItem: { borderRadius: radius.lg },
  tabLabel: { fontSize: 11, fontWeight: "900", marginTop: 2 },
  iconWrap: {
    minWidth: 32,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: { backgroundColor: colors.forestMist },
  iconText: { color: colors.muted, fontWeight: "900", fontSize: 12 },
  iconTextActive: { color: colors.forest },
  scanWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.forest,
    marginTop: -24,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.lifted,
  },
  scanWrapActive: { backgroundColor: colors.gold },
  scanText: { color: colors.ivory, fontSize: 15 },
});
