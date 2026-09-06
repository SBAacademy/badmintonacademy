export type AnalyticsEvent = 
  | "whatsapp_click"
  | "phone_click"
  | "generate_lead"
  | "trial_booked"
  | "branch_view"
  | "program_enquiry"
  | "gallery_view"
  | "map_directions_click";

export function trackEvent(eventName: AnalyticsEvent, params: Record<string, any> = {}) {
  if (typeof window !== "undefined") {
    // Standard Google Analytics 4 (gtag) dispatch if initialized
    if ((window as any).gtag) {
      (window as any).gtag("event", eventName, params);
    }
    // GTM dataLayer dispatch
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString(),
      });
    }
    // Helpful development debug log
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics Event] ${eventName}:`, params);
    }
  }
}
