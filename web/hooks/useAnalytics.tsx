import { useEffect } from "react";
import mixpanel from "mixpanel-browser";
import useAppStore from "./useAppStore";

function useAnalytics() {
  const isDevelopment = process.env.APP_ENV === "development";
  const { userId } = useAppStore()

  useEffect(() => {
    if (!process.env.MIXPANEL_PROJECT_TOKEN) {
      console.error("Mixpanel project token is not set.");
      return;
    }

    // Setup Mixpanel logging
    mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN || "", {
      debug: isDevelopment,
      ignore_dnt: true,
    });

    if (!userId) {
      console.warn("userId is undefined. Mixpanel identify and people.set will not be called.");
      return;
    }

    // Set this to a unique identifier for the user performing the event
    try {
      mixpanel.identify(userId);
      // Set user properties, including the username
      mixpanel.people.set({
        $name: userId,
        $app: process.env.APP_NAME,
      });
    } catch (error) {
      console.error("Mixpanel error:", error);
    }
  }, []);

  function trackEvent(eventName: string, tags: Record<string, string> = {}) {
    // Ensure Mixpanel is initialized before tracking events
    if (!mixpanel.has_opted_in_tracking()) {
      console.warn("Mixpanel tracking called before initialization or user has opted out.");
      return;
    }
    const allTags = {
      enviroment: process.env.APP_ENV,
      app: process.env.APP_NAME,
      ...tags,
    };
    try {
      mixpanel.track(eventName, allTags);
    } catch (error) {
      console.error("Error tracking event in Mixpanel:", error);
    }

    if (isDevelopment) {
      console.log("tracked", eventName, allTags);
    }
  }

  return { trackEvent };
}

export default useAnalytics;
