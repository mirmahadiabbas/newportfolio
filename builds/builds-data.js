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
  intro: "Hands-on work published here so you can explore it properly: tools that run in your browser, AI pipelines, and the research behind how I think about delivery. New builds get added as they are ready.",
  owner: "Mir Mahadi <em>Abbas</em>",
  mainSite: "../",
  // NOTE: builds/test/ is a private scratch page. It is deliberately NOT
  // listed here and is marked noindex, so nothing links to it. Leave it out.
  items: [
    {
      slug: "sponsor-search",
      title: "UK Visa Sponsor Licence Search",
      status: "live",
      type: "data",
      desc: "Search the Home Office register of licensed sponsors by company name, visa route or location. Around 142,000 entries, searched at the edge. Built because the official register is published as a spreadsheet that is awkward to search.",
      tags: ["Cloudflare Workers", "Python", "No AI"]
    },
    {
      slug: "process-map",
      title: "Process Description to Process Map",
      status: "live",
      type: "ai",
      desc: "Describe a business process in plain English and get back a flowchart, the points where it may be leaking time, and the questions a business analyst would ask next. Runs on the page in about 20 seconds.",
      tags: ["Make.com", "Claude API", "Mermaid.js"]
    },
    {
      slug: "meeting-minutes",
      title: "AI Meeting Minutes",
      status: "live",
      type: "ai",
      desc: "Paste a meeting transcript, get clean minutes back by email: summary, decisions, actions with owners, and open questions, as a PDF. Live: fill the form on the page and try it, sample transcript included.",
      tags: ["Make.com", "Claude API", "Google Docs"]
    },
    {
      slug: "thesis",
      title: "Leading Digital Transformation",
      status: "complete",
      type: "research",
      desc: "MSc thesis at Cranfield: how adaptive project management, digital tools and leadership adaptability combine into delivery excellence. Built from three months inside TUI Airlines' transformation division and eleven practitioner interviews.",
      tags: ["Qualitative research", "TUI Airlines", "Strategy"]
    },
    {
      slug: "meeting-cost",
      title: "Meeting Cost Counter",
      status: "live",
      type: "browser",
      desc: "Set the headcount, the average hourly cost and the length, and see what a meeting really costs. Includes a live ticker you can leave running during the meeting itself.",
      tags: ["HTML/CSS/JS", "No backend"]
    }
  ]
};
