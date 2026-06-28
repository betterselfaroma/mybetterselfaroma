import type { OperatorProfile } from "../../lib/types";
import type { RouteKey } from "../../routes";
import BottomTabBar from "./BottomTabBar";
import FloatingScanButton from "./FloatingScanButton";
import MobileHeader from "./MobileHeader";
import SafeAreaView from "./SafeAreaView";

export default function MobileShell({
  profile,
  route,
  onNavigate,
  onLogout,
  children,
}: {
  profile: OperatorProfile;
  route: RouteKey;
  onNavigate: (route: RouteKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView>
      <MobileHeader userEmail={profile.email} onLogout={onLogout} />
      <main className="app-content">{children}</main>
      {route !== "scan" && <FloatingScanButton onNavigate={onNavigate} />}
      <BottomTabBar active={route} onNavigate={onNavigate} />
    </SafeAreaView>
  );
}
