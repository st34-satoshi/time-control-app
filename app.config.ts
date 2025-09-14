import { ExpoConfig, ConfigContext } from 'expo/config';
import * as fs from "fs";
import * as path from "path";
import packageJson from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  // iOS用 GoogleService-Info.plist
  const iosPlistBase64 = process.env.IOS_GOOGLESERVICE_INFO_PLIST_BASE64;
  const iosPlistPath = path.resolve("./ios/GoogleService-Info.plist");

  if (!iosPlistBase64) {
    if (process.env.CI) {
      throw new Error("IOS_GOOGLESERVICE_INFO_PLIST_BASE64 is not set for this environment (e.g. production).");
    } else {
      console.warn("IOS_GOOGLESERVICE_INFO_PLIST_BASE64 is not set; skipping iOS plist generation.");
    }
  } else {
    fs.mkdirSync(path.dirname(iosPlistPath), { recursive: true });
    fs.writeFileSync(iosPlistPath, Buffer.from(iosPlistBase64, "base64"));
  }

  return {
    ...config,
    name: "時間管理24",
    slug: "time-control-app-24",
    version: packageJson.version,
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
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleShortVersionString: packageJson.version,
        CFBundleVersion: "1"
      },
      associatedDomains: ["applinks:time-control-app.web.app"]
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: "time-control-app.web.app"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "3078a34c-06ec-4f84-8d12-726fbce40165"
      },
      firebase: {
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
      }
    },
    owner: "st34",
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/3078a34c-06ec-4f84-8d12-726fbce40165"
    },
    runtimeVersion: packageJson.version,
  };
};
