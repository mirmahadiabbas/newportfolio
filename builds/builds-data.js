/* ============================================================
   BUILDS DATA - the only file to edit when adding a project.

   Each item:
     slug    folder name of the sub-page, e.g. "meeting-cost"
             means the page lives at builds/meeting-cost/.
             Use null if the build is not live yet (the card
             shows but is not clickable).
     title   card heading
     status  "live" or "progress"
     type    "browser" (runs fully in the visitor's browser)
             or "ai" (wired to a live AI pipeline)
     desc    one or two sentences, plain and honest
     tags    short list of the stack
   ============================================================ */

const BUILDS = {
  title: "Things you can <em>try</em>",
  intro: "Hands-on AI and automation experiments, published here so you can actually use them rather than read about them. Some run entirely in your browser, some are wired to live AI pipelines. New builds get added as they are ready.",
  owner: "Mir Mahadi <em>Abbas</em>",
  mainSite: "../",
  items: [
    {
      slug: "meeting-cost",
      title: "Meeting Cost Counter",
      status: "live",
      type: "browser",
      desc: "Set the headcount, the average hourly cost and the length, and see what a meeting really costs. Includes a live ticker you can leave running during the meeting itself.",
      tags: ["HTML/CSS/JS", "No backend"]
    },
    {
      slug: null,
      title: "Meeting Summariser",
      status: "progress",
      type: "ai",
      desc: "Submit a meeting transcript and get a structured summary with action items sent to your inbox. The pipeline works end to end; the public version is being hardened before it goes live here.",
      tags: ["Make.com", "Claude API", "Google Docs"]
    }
  ]
};
