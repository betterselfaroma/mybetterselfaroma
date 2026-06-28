import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.betterselfaroma.admin",
  appName: "香气读懂你的心 Admin",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      backgroundColor: "#f7f1e6",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      backgroundColor: "#2f5d46",
      style: "LIGHT"
    },
    Keyboard: {
      resize: "body",
      style: "light",
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
