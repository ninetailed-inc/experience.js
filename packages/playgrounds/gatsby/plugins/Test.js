import { NinetailedAnalyticsPlugin } from "@ninetailed/experience.js-plugin-analytics"

class Test extends NinetailedAnalyticsPlugin {
  name = "Test"

  onTrackComponent() {
    console.log("Track component")
  }

  onTrackExperience() {
    console.log("Track experience")
  }
}

export default Test
