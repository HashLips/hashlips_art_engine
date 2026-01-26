import PlatformNotConfigured from "@/app/(marketing)/platform-not-configured/page";
import { hasD1Binding } from "./config";

export function requirePlatformConfigured() {
  if (!hasD1Binding()) {
    return <PlatformNotConfigured />;
  }
  return null;
}
