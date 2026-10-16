/* ============================================================
   KNOWLEDGE PACK - everything the assistant is allowed to know.
   This is the ONLY file to edit when facts about Mir change.

   The assistant answers from this file and nothing else. If a
   fact is not in here, it says it does not know and points the
   visitor to Mir. So:
     - only put in things that are true and already public
       (on the website or the CV you send to employers)
     - never put in phone numbers, home address, salary, or
       anything you would not say to a recruiter
     - after any edit, run `npm test` (checks the format) and,
       once deployed, `npm run eval` (checks the behaviour)

   Each section:
     id     short, lowercase, hyphens. The model cites these.
            Changing an id breaks nothing, but keep them stable.
     label  what the visitor sees on the source link
     url    where the source link goes (must be on the site,
            LinkedIn, or a mailto)
     text   the facts, in plain sentences

   House rules apply here too: British English, no em-dashes
   or en-dashes, no numbers that are not on the CV or the site.
   ============================================================ */

export const PACK = {
  version: "2026-10-11",

  /* Shown as clickable prompts before the first question. Keep
     them to questions the pack can answer well. */
  starters: [
    "What did Mir do at TUI Airlines?",
    "What has he built with AI?",
    "What kind of roles is he looking for?",
    "Tell me about his consulting experience"
  ],

  /* The one fixed answer the model must give word for word if
     asked about visas, sponsorship or right to work. It is the
     line from Mir's CV. Delete the text (leave "") to make the
     assistant send people to Mir instead. */
  rightToWork: "Mir has the right to work in the UK without sponsorship.",

  contactEmail: "mirabbasun@gmail.com",

  sections: [
    {
      id: "profile",
      label: "About Mir",
      url: "https://mirmahadiabbas.com/#about",
      text: "Mir Mahadi Abbas is a consulting and project analyst based in Milton Keynes, UK. He describes his focus as the structure underneath a programme and the analysis behind a decision: work that sits between strategy and delivery, where someone has to work out what is actually being asked, structure the analysis, and make sure the answer survives a steering committee. His route there: a mechanical engineering degree, two years as a software engineer at Infosys, consulting and CEO support at WSPL, then an MSc in Management at Cranfield University (Distinction) and a PMO internship at TUI Airlines. Alongside that he builds AI and workflow automation tools, several of which are live on his Builds page. He is a Lean Six Sigma Green Belt. He speaks English, Urdu, Hindi and Kannada. Outside work he sketches, lifts weights and runs small side projects."
    },
    {
      id: "looking-for",
      label: "Contact and availability",
      url: "https://mirmahadiabbas.com/#contact",
      text: "Mir is open to work. He is looking for consulting, PMO and business analyst roles in the UK, and also takes on freelance projects: web builds, AI and workflow automation, dashboards and video editing. The best way to reach him is email at mirabbasun@gmail.com, or LinkedIn at linkedin.com/in/mirmahadiabbas."
    },
    {
      id: "tui",
      label: "TUI Airlines",
      url: "https://mirmahadiabbas.com/#xp-tui",
      text: "Project Management Intern in the PMO at TUI Airlines, Luton, UK, from June to September 2025. TUI Airlines is the airline division of TUI Group. He worked on the Advance Crew Management System (ACMS) programme, which was replacing crew management tooling across five European airline entities. What he did: ran current-state analysis of crew management across the five entities through interviews with subject matter experts, giving the programme an evidence base of pain points and system gaps for its requirements. Built weighted RFI and RFP scorecards in MS Forms and Excel for the Crew Tracking workstream, turning supplier responses into like-for-like comparisons that fed into the steering committee's vendor selection. Helped facilitate scoping workshops with 8 to 10 technology, operations and crew stakeholders across five regions, resolving conflicting regional needs into one agreed requirements baseline. Produced the programme's PID, RACI matrix and RAID log, and moved the stakeholder communications plan onto SharePoint so all five entities worked from one version-controlled source. Most of what he produced went to the steering committee."
    },
    {
      id: "wspl",
      label: "WSPL",
      url: "https://mirmahadiabbas.com/#xp-wspl",
      text: "Associate Consultant and executive support to the CEO at WSPL, Bengaluru, India, from November 2023 to September 2024. WSPL is a consulting firm delivering strategy and digital work, working with early-stage technology companies across a group of three companies. As a consultant: delivered competitor benchmarking, feature differentiation and pricing analysis for Topiq, a GenAI e-commerce SaaS, building the market evidence and pitch deck that helped it secure a $1M seed round. Led a full brand and digital revamp for the client Truedigital, directing designers, content writers and SEO specialists across a new website, LinkedIn presence and content strategy, which generated 30+ leads in its first month. Supporting the CEO: ran the CEO's office across the three companies, setting the leadership meeting cadence, preparing briefing materials and tracking agreed actions to closure. Built KPI dashboards and executive reports from performance data on 40+ staff across the firm and two sister companies, used by the CEO for resourcing and performance decisions."
    },
    {
      id: "infosys",
      label: "Infosys",
      url: "https://mirmahadiabbas.com/#xp-infosys",
      text: "System Engineer at Infosys, Bengaluru, India, from October 2021 to September 2023. Infosys is a global IT services and consulting company. He spent two years in an Agile team on a video-analytics programme for Comcast, a US telecom client. Built an ML-based video analytics proof of concept detecting broadcast distortions including macro-blocking, pixelation and audio-video sync errors, with 90% accuracy. Restructured RDK-B broadband testing on Raspberry Pi devices, automating regression test cases and cutting testing cycle time by 50%. Co-built a Grafana defect dashboard with timestamped alerts, giving engineering and client teams real-time visibility of stream quality issues. Independently scoped and delivered an audio-caption synchronisation module in Python, extending the platform's accessibility compliance coverage."
    },
    {
      id: "gxo",
      label: "GXO Logistics",
      url: "https://mirmahadiabbas.com/#xp-gxo",
      text: "Mir currently works part-time in warehouse operations at GXO Logistics in Milton Keynes, on the Marks & Spencer distribution operation, alongside his job search. He started in late 2025."
    },
    {
      id: "cranfield",
      label: "Cranfield University",
      url: "https://mirmahadiabbas.com/#education",
      text: "MSc Management at Cranfield University, UK, September 2024 to October 2025, graduated with Distinction. Key modules: project management, consulting, strategy, operations and supply chain, taught with a strong applied focus: live client briefs, case competitions and team simulations. His thesis was titled Leading Digital Transformation through Adaptive Project Management Practices and Strategic Tools. At Cranfield he was Green Team Event Manager (sustainability and biodiversity initiatives across campus), Circuit Training Club Coordinator, and a Consulting Club member."
    },
    {
      id: "thesis",
      label: "MSc thesis",
      url: "https://mirmahadiabbas.com/builds/thesis/",
      text: "His Cranfield MSc thesis, Leading Digital Transformation, looks at how adaptive project management, digital tools and leadership adaptability combine into delivery excellence. It was built from three months inside TUI Airlines' transformation division and eleven practitioner interviews. A presentation of it is on the Builds page."
    },
    {
      id: "nmit",
      label: "Nitte Meenakshi Institute of Technology",
      url: "https://mirmahadiabbas.com/#education",
      text: "BE Mechanical Engineering at Nitte Meenakshi Institute of Technology, Bengaluru, India, 2018 to 2021, First Class. Side projects there pulled him toward systems and software. He founded the Spyder_Bots robotics club, which grew to around 200 members and competed in national robotics competitions."
    },
    {
      id: "competitions",
      label: "Competitions and challenges",
      url: "https://mirmahadiabbas.com/#beyond",
      text: "Case competitions and simulations from his time at Cranfield, all in 2025. Levy UK and Ireland Consulting Challenge: winner. He led a team that designed and presented a hospitality growth strategy for 21 to 30 year olds to Levy senior executives, run with Levy UK and Ireland and Universitat Politècnica de València; first place across the cohort. Cranfield Colworth Innovation Challenge: 2nd place. Built a commercialisation strategy and business model for an edible packaging concept for ice cream and liquid foods, pitched to dsm-firmenich, running from market research and gap analysis to a business model. Revas Business Simulation: 8th globally and 1st in his market. Ran a virtual travel agency over six simulated months, making decisions on pricing, marketing, hiring and operations. Hult Prize, university round: runner-up. Designed RenewAge, a repair-skills platform connecting older generations with Gen Z to cut waste and encourage circular-economy habits."
    },
    {
      id: "skills",
      label: "Skills and tools",
      url: "https://mirmahadiabbas.com/#about",
      text: "Consulting and governance: market research, competitor benchmarking, pricing analysis, current-state analysis, requirements gathering, vendor evaluation (RFI and RFP), programme governance (PID, RACI, RAID), steering committee reporting, stakeholder management and communications, workshop facilitation, process mapping, Six Sigma (DMAIC), KPI dashboards. Tools: Advanced Excel, Power BI, MS Project, Jira, SharePoint, Python, SQL, Grafana, Make.com, Google Apps Script, Apify, GitHub Actions, Mermaid.js and the Claude API."
    },
    {
      id: "certifications",
      label: "Certifications",
      url: "https://mirmahadiabbas.com/#about",
      text: "Lean Six Sigma Green Belt (ILSSI). Generative AI for Project Managers (Project Management Institute). Career Essentials in Project Management (Microsoft and LinkedIn). Python Associate (Infosys)."
    },
    {
      id: "volunteering",
      label: "Volunteering",
      url: "https://mirmahadiabbas.com/#about",
      text: "During COVID-19 he volunteered with WhoIsHussain.org, coordinating food and medical supplies for 100+ families. At Cranfield he was part of the Green Team, working on sustainability and biodiversity initiatives across campus."
    },
    {
      id: "builds",
      label: "Builds page",
      url: "https://mirmahadiabbas.com/builds/",
      text: "Since November 2025 Mir has been doing self-directed upskilling in practical AI and automation: API integration, automated workflows and data pipelines. The Builds page at mirmahadiabbas.com/builds lists the tools visitors can try: this site assistant, a UK visa sponsor licence search, a process description to process map tool, an AI meeting minutes service, a meeting cost counter, and his MSc thesis."
    },
    {
      id: "sponsor-search",
      label: "UK Visa Sponsor Licence Search",
      url: "https://mirmahadiabbas.com/builds/sponsor-search/",
      text: "A search tool for the Home Office register of licensed sponsors: search by company name, visa route or location across around 142,000 entries. Built because the official register is published as a spreadsheet that is awkward to search. A Python script prepares the register, and a Cloudflare Worker searches it at the edge. It deliberately uses no AI."
    },
    {
      id: "process-map",
      label: "Process Description to Process Map",
      url: "https://mirmahadiabbas.com/builds/process-map/",
      text: "Describe a business process in plain English and get back a rendered flowchart, a structured breakdown, the points where it may be wasting time (a Lean waste analysis) and the questions a business analyst would ask next. Runs on the page in about 20 seconds. Built with Make.com, the Claude API and Mermaid.js, using synchronous webhooks and constrained model output."
    },
    {
      id: "meeting-minutes",
      label: "AI Meeting Minutes",
      url: "https://mirmahadiabbas.com/builds/meeting-minutes/",
      text: "Paste a meeting transcript and get clean minutes back by email as a PDF: summary, decisions, actions with owners, and open questions. It is live with a public form on the page and a sample transcript to try. Built as a webhook-triggered pipeline on Make.com, the Claude API and Google Docs."
    },
    {
      id: "meeting-cost",
      label: "Meeting Cost Counter",
      url: "https://mirmahadiabbas.com/builds/meeting-cost/",
      text: "A browser tool: set the headcount, the average hourly cost and the length, and see what a meeting costs, with a live ticker to leave running during the meeting. Runs entirely in the browser with no backend."
    },
    {
      id: "automation-projects",
      label: "Automation projects",
      url: "https://mirmahadiabbas.com/#projects",
      text: "Other automation projects he built for his own use. Job discovery pipeline: a scheduled scraper (Apify, Python, GitHub Actions, SQLite) that pulls fresh listings every few days, deduplicates them, scores each against a weighted profile with Claude, and emails a ranked shortlist; it runs unattended on a 72 hour cycle. Job application tracker: pulls job details into Google Sheets with Apps Script and uses Claude to tidy and structure each entry. Expense tracker: logs expenses from a single text message, parsed by Claude through Twilio and Make.com and appended to Google Sheets; built from idea to working tool in a weekend."
    },
    {
      id: "services",
      label: "Freelance services",
      url: "https://mirmahadiabbas.com/#services",
      text: "Mir takes on a small number of freelance projects: web design and build (hand-built, fast, responsive sites on GitHub Pages, with domain and hosting set up), AI automation (Claude API, Make.com, Python), workflow automation (Make.com, Apps Script, Google Workspace), dashboards and reporting (Power BI, Excel, Google Sheets), video editing (short and long form, with captions), and adjacent work such as research, pitch decks and process mapping. He has no packages or public rate card: every engagement starts with a short conversation, by email at mirabbasun@gmail.com."
    },
    {
      id: "about-assistant",
      label: "How this assistant works",
      url: "https://mirmahadiabbas.com/builds/site-assistant/",
      text: "This assistant was built by Mir. It answers from a fixed set of facts that Mir wrote from his CV and this website, and nothing else, so it says so when it does not know something rather than guessing. Questions go from the page to a Cloudflare Worker, which holds the API key, applies rate limits, and calls Anthropic's Claude API (a Haiku model). The site itself does not keep a record of questions. Mir tests its behaviour against a fixed set of questions with expected answers whenever the facts change. The website itself is hand-built HTML, CSS and JavaScript, hosted on GitHub Pages, and was built with Claude."
    }
  ]
};
