"use client";

import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";

const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
const site = process.env.NEXT_PUBLIC_DATADOG_SITE;
const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE;
const env = process.env.NEXT_PUBLIC_DATADOG_ENV;
const version = process.env.NEXT_PUBLIC_DATADOG_VERSION ?? "0.0.0";

export default function DatadogRumInit() {
  useEffect(() => {
    if (!applicationId || !clientToken || !site || !service || !env) {
      return;
    }

    if (datadogRum.getInitConfiguration()) {
      return;
    }

    datadogRum.init({
      applicationId,
      clientToken,
      site,
      service,
      env,
      version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackResources: true,
      trackUserInteractions: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });

    datadogRum.startSessionReplayRecording();
  }, []);

  return null;
}
