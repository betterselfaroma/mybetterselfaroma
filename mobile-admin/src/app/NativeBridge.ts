import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Keyboard } from "@capacitor/keyboard";
import { Preferences } from "@capacitor/preferences";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export const LAST_ROUTE_KEY = "better_self_aroma_admin_last_route";

export async function initializeNativeBridge() {
  await Promise.allSettled([
    StatusBar.setBackgroundColor({ color: "#17392a" }),
    StatusBar.setStyle({ style: Style.Light }),
    Keyboard.setAccessoryBarVisible({ isVisible: false }),
  ]);
}

export function hideNativeSplash() {
  return SplashScreen.hide().catch(() => undefined);
}

export function onNativeBackButton(handler: () => void) {
  return CapacitorApp.addListener("backButton", handler);
}

export async function openExternalUrl(url: string) {
  if (!url) return;
  try {
    await Browser.open({ url });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export async function hapticSuccess() {
  await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
}

export async function hapticWarning() {
  await Haptics.notification({ type: NotificationType.Warning }).catch(() => undefined);
}

export async function hapticTap() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
}

export async function exitNativeApp() {
  await CapacitorApp.exitApp().catch(() => undefined);
}

export async function saveLastRoute(hash: string) {
  if (!hash) return;
  await Preferences.set({ key: LAST_ROUTE_KEY, value: hash }).catch(() => undefined);
}

export async function readLastRoute() {
  const { value } = await Preferences.get({ key: LAST_ROUTE_KEY }).catch(() => ({ value: null }));
  return value;
}

export function installKeyboardClassHandlers() {
  const add = () => document.documentElement.classList.add("keyboard-open");
  const remove = () => document.documentElement.classList.remove("keyboard-open");

  const show = Keyboard.addListener("keyboardWillShow", add);
  const hide = Keyboard.addListener("keyboardWillHide", remove);

  return () => {
    show.then((handle) => handle.remove()).catch(() => undefined);
    hide.then((handle) => handle.remove()).catch(() => undefined);
  };
}
