import { ExpoConfig, ConfigContext } from 'expo/config';
import * as fs from "fs";

export default ({ config }: ConfigContext): ExpoConfig => {
  // iOS用 GoogleService-Info.plist
  const iosPlistBase64 = process.env.IOS_GOOGLESERVICE_INFO_PLIST_BASE64;
  if (iosPlistBase64) {
    fs.writeFileSync(
      "./ios/timecontrolapp/GoogleService-Info.plist",
      Buffer.from(iosPlistBase64, "base64")
    );
  }

  return {
    ...config,
    name: "time-control-app-24",
    slug: "time-control-app-24",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/time-control-app-24-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/time-control-app-24-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stu345.time-control-app-24",
      googleServicesFile: "./ios/timecontrolapp/GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "3078a34c-06ec-4f84-8d12-726fbce40165"
      }
    },
    owner: "st34",
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0
    }
  };
};
