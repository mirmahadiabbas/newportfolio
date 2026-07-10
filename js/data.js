/* ============================================================
   DATA - every word, link, image and date on the site.
   This is the ONLY file you need to edit for content changes.

   Rules of thumb:
   - Text goes inside quotes. Keep the commas between items.
   - Image paths point at the images/ folder in the repo
     (filenames are case-sensitive on GitHub).
   - Dates use "YYYY-MM" format, e.g. "2025-06".
   - To hide a whole section, remove its name from the
     `sections` list below (or comment it out with //).
   ============================================================ */

const SITE = {

  /* ----- section order. Remove or reorder lines to change the page. ----- */
  sections: [
    "hero",
    "stats",
    "about",
    "toolkit",
    "experience",   // includes the gantt board
    "education",
    "projects",
    "services",
    "beyond",
    "certificates",
    "linkedin",
    "contact"
  ],

  /* ============ HERO ============ */
  hero: {
    rotating: [
      "PMO delivery",
      "business transformation",
      "vendor evaluation",
      "stakeholder communications",
      "decision analysis",
      "AI-enabled workflows"
    ],
    // <em> wraps the italic brass word
    name: "Mir Mahadi <em>Abbas</em>",
    tagline: "Consulting and project analyst. I work on the structure underneath a programme and the analysis behind a decision.",
    photo: "headshot.jpg",
    buttons: [
      { label: "Get in touch", href: "mailto:mirabbasun@gmail.com", style: "brass" },
      { label: "Freelance services", href: "#services", style: "ghost" },
      { label: "LinkedIn", href: "https://linkedin.com/in/mirmahadiabbas/", style: "ghost", external: true }
    ],
    docStrip: [
      { k: "Base", v: "Milton Keynes, UK" },
      { k: "Status", v: "Open to opportunities" },
      { k: "Focus", v: "Consulting · PMO · BA" }
    ]
  },

  /* ============ STATS (animated counters) ============ */
  stats: [
    { value: 5,  prefix: "",  suffix: "",  label: "European airlines in scope on TUI's crew-systems programme" },
    { value: 1,  prefix: "$", suffix: "M", label: "seed round raised on pitch materials I contributed to" },
    { value: 30, prefix: "",  suffix: "+", label: "leads in month one of a digital revamp I ran end to end" },
    { value: 50, prefix: "",  suffix: "%", label: "cut in testing time through automation at Infosys" }
  ],

  /* ============ ABOUT ============ */
  about: {
    title: "Between strategy <em>and</em> delivery",
    paragraphs: [
      "I'm drawn to work that sits between strategy and delivery, where someone has to figure out what's actually being asked, structure the analysis, and make sure the answer survives a steering committee. I came at it sideways: mechanical engineering, then software at Infosys, consulting at WSPL, then Cranfield and TUI's PMO.",
      "Outside work I sketch, lift, and run small side projects. I was also part of Cranfield's Green Team, working on sustainability and biodiversity initiatives across campus. Six Sigma Green Belt, Microsoft Project certified, and fluent in English, Urdu, Hindi, and Kannada."
    ]
  },

  /* ============ TOOLKIT (scrolling strip) ============ */
  toolkit: [
    "Business transformation", "RAID & RACI", "Stakeholder comms", "Vendor evaluation",
    "Workshop facilitation", "SteerCo reporting", "Six Sigma Green Belt", "Advanced Excel",
    "Power BI", "MS Project", "Jira", "SharePoint", "Python", "SQL", "Grafana",
    "Make.com", "Apps Script", "Claude API", "Market research", "KPI dashboards"
  ],

  /* ============ EXPERIENCE ============ */
  experience: {
    title: "Delivery record",
    gantt: {
      axisStart: 2018,                 // first year on the chart
      hint: "Solid bars are roles, outlined bars are study. Select a bar to jump to the detail.",
      rows: [
        { org: "GXO Logistics",  sub: "Warehouse Associate",       from: "2025-10", to: "now",     kind: "work",  target: "xp-gxo",     logo: "images/GXO_logo.png" },
        { org: "TUI Airlines",   sub: "PM Intern, PMO",            from: "2025-06", to: "2025-09", kind: "work",  target: "xp-tui",     logo: "images/TUI_logo.png" },
        { org: "Cranfield",      sub: "MSc Management",            from: "2024-09", to: "2025-10", kind: "study", target: "education",  logo: "images/Cranfield_SOM_Logo.jpg" },
        { org: "WSPL",           sub: "Consultant & EA to CEO",    from: "2023-11", to: "2024-09", kind: "work",  target: "xp-wspl",    logo: "images/WSPL_Logo.jpg" },
        { org: "Infosys",        sub: "System Engineer",           from: "2021-10", to: "2023-09", kind: "work",  target: "xp-infosys", logo: "images/Infosys_Logo.jpg" },
        { org: "NMIT Bengaluru", sub: "BE Mechanical Engineering", from: "2018-08", to: "2021-05", kind: "study", target: "education",  logo: "images/Nitte_Logo.jpg" }
      ]
    },
    roles: [
      {
        id: "xp-gxo",
        org: "GXO Logistics",
        logo: "images/GXO_logo.png",
        date: "Oct 2025 – present",
        role: "Warehouse Associate (part-time) · a current role alongside my job search",
        current: true,
        light: true   // renders as a slim entry with no description or tags
      },
      {
        id: "xp-tui",
        org: "TUI Airlines",
        logo: "images/TUI_logo.png",
        date: "Jun – Sep 2025",
        role: "Project Management Intern (PMO) · Luton",
        desc: "Worked inside the Advance Crew Management System transformation, replacing crew tooling across five European airlines. Built RFI and RFP scorecards, ran current-state interviews with SMEs, and helped facilitate the cross-functional scoping workshop. Most of what I produced went to the SteerCo.",
        tags: ["Vendor evaluation", "RAID & RACI", "SteerCo reporting", "Stakeholder interviews", "Workshop facilitation"]
      },
      {
        id: "xp-wspl",
        org: "WSPL",
        logo: "images/WSPL_Logo.jpg",
        date: "Nov 2023 – Sep 2024",
        role: "Associate Consultant & EA to CEO · Bengaluru",
        desc: "Analyst work alongside operating support to the CEO at a firm working with early-stage tech companies. Led competitor benchmarking and pricing for Topiq, a GenAI SaaS that raised a $1M seed round on materials I contributed to. Ran the digital revamp for Truedigital, generating 30+ leads in its first month.",
        tags: ["Market research", "Competitive analysis", "GTM strategy", "KPI dashboards", "Client presentations"]
      },
      {
        id: "xp-infosys",
        org: "Infosys",
        logo: "images/Infosys_Logo.jpg",
        date: "Oct 2021 – Sep 2023",
        role: "System Engineer · Bengaluru",
        desc: "Two years on a video-analytics programme for Comcast inside an Agile team. Validated an ML detection system across distortion types, scoped and built an audio-caption synchronisation module end to end, and co-built a Grafana dashboard. Rewrote the test approach for the RDK-B module and halved testing time through automation.",
        tags: ["ML validation", "Computer vision", "Python", "Grafana", "Agile delivery"]
      }
    ]
  },

  /* ============ EDUCATION ============ */
  education: [
    {
      org: "Cranfield University",
      logo: "images/Cranfield_SOM_Logo.jpg",
      degree: "MSc Management, Distinction · 2024–2025",
      desc: "Strategy, consulting, project management, operations and supply chain, taught with a heavy applied bent: live client briefs, case competitions, and team simulations.",
      thesis: "Thesis: Leading Digital Transformation through Adaptive Project Management Practices and Strategic Tools."
    },
    {
      org: "Nitte Meenakshi Institute of Technology",
      logo: "images/Nitte_Logo.jpg",
      degree: "BE Mechanical Engineering, First Class · 2018–2021",
      desc: "Mechanical engineering with side projects that pulled me toward systems and software. Founded the Spyder_Bots robotics club, which grew to around 200 members and competed nationally."
    }
  ],

  /* ============ PROJECTS ============ */
  projects: {
    title: "Things I've <em>built</em>",
    intro: "Small automation projects I've built to solve my own problems, mostly wiring AI into everyday workflows. Each one runs a simple pipeline.",
    items: [
      {
        icon: "search",
        title: "Job Search Pipeline",
        desc: "A scheduled scraper that pulls fresh listings every few days, deduplicates them in SQLite, scores each one against my profile with Claude, and emails me a ranked shortlist.",
        pipeline: ["Apify", "Python", "Claude", "Inbox"],
        tags: ["Python", "Apify", "GitHub Actions", "SQLite", "Claude API"]
      },
      {
        icon: "doc",
        title: "Meeting Summariser",
        desc: "Turns recorded meetings into structured summaries and action items automatically.",
        pipeline: ["Jotform", "Make", "Claude", "Docs"],
        tags: ["Jotform", "Make", "Claude API", "Google Workspace"]
      },
      {
        icon: "grid",
        title: "Job Application Tracker",
        desc: "A self-updating tracker that pulls job details into a spreadsheet and uses AI to tidy and structure each entry.",
        pipeline: ["Job advert", "Apps Script", "Claude", "Sheets"],
        tags: ["Google Sheets", "Apps Script", "Claude API"]
      },
      {
        icon: "chat",
        title: "Expense Tracker",
        desc: "Logs expenses straight from a text message, parsed by AI and appended to a running spreadsheet.",
        pipeline: ["Text message", "Make", "Claude", "Sheets"],
        tags: ["Twilio", "Make", "Claude API", "Google Sheets"]
      }
    ]
  },

  /* ============ FREELANCE SERVICES ============ */
  services: {
    title: "Freelance <em>services</em>",
    intro: "Alongside everything above, I take on a small number of freelance projects. No packages and no rate card on a webpage: tell me what you need and I'll tell you honestly whether I'm the right person for it, what it would involve, and what it would cost.",
    items: [
      {
        icon: "web",
        title: "Web design & build",
        desc: "Sites like this one: designed and hand-built, fast, responsive, and easy to update yourself afterwards. Domain and hosting setup included, no page builders.",
        meta: ["HTML/CSS/JS", "GitHub Pages", "Domains & DNS"]
      },
      {
        icon: "spark",
        title: "AI automation",
        desc: "Practical AI wired into real workflows: meeting summarisers, document pipelines, scoring and triage, drafted replies. Built on the same stack as the projects above.",
        meta: ["Claude API", "Make.com", "Python"]
      },
      {
        icon: "flow",
        title: "Workflow automation",
        desc: "Connecting the tools you already use so the data moves itself: forms into sheets, messages into databases, approvals into inboxes. Fewer copy-paste jobs.",
        meta: ["Make.com", "Apps Script", "Google Workspace"]
      },
      {
        icon: "bars",
        title: "Dashboards & reporting",
        desc: "KPI dashboards and clean executive reporting that turn scattered numbers into something a decision can actually rest on.",
        meta: ["Power BI", "Excel", "Google Sheets"]
      },
      {
        icon: "film",
        title: "Video editing",
        desc: "Raw footage cut into clean, watchable content for LinkedIn, YouTube and product demos, with pacing, captions and structure handled.",
        meta: ["Short-form", "Long-form", "Captions"]
      },
      {
        icon: "plus",
        title: "Something adjacent",
        desc: "Research, pitch decks, process mapping, or a job that doesn't fit a neat box. If it involves structure, analysis or automation, it's worth asking.",
        meta: ["Just ask"]
      }
    ],
    cta: {
      label: "Tell me about your project",
      href: "mailto:mirabbasun@gmail.com?subject=Project%20enquiry",
      note: "Every engagement starts with a short conversation."
    }
  },

  /* ============ BEYOND THE CV ============ */
  beyond: {
    title: "Competitions & challenges",
    intro: "Live case competitions and simulations from my time at Cranfield, each one a real brief, a real deadline, and a panel to convince.",
    items: [
      {
        title: "Levy UK & Ireland Consulting Challenge",
        badge: "Winner",
        win: true,
        desc: "Led a team to design and present a hospitality growth strategy for 21–30 year-olds to Levy senior executives, run with Levy UK+I and Universitat Politècnica de València. First place across the cohort.",
        images: ["images/Levy-1.jpg", "images/Levy-2.jpg"],
        link: "https://www.linkedin.com/posts/mirmahadiabbas_consultingchallenge-studentlife-teamwork-activity-7338394814083674112-fAmz"
      },
      {
        title: "Cranfield–Colworth Innovation Challenge",
        badge: "2nd place",
        desc: "Built a commercialisation strategy and business model for an edible-packaging concept aimed at ice cream and liquid foods, pitched to dsm-firmenich. The work ran from market research and gap analysis through to a viable business model.",
        images: ["images/Colworth-1.jpg", "images/Colworth-2.jpg"],
        link: "https://www.linkedin.com/posts/mirmahadiabbas_innovation-sustainability-ediblepackaging-activity-7308649266963460096-3nMk"
      },
      {
        title: "Revas Business Simulation",
        badge: "8th of 88 globally",
        desc: "Ran a virtual travel agency over six simulated months, making live decisions on pricing, marketing, hiring and operations under competitive pressure. Finished 8th of 88 teams across 35 countries, and 1st in our market.",
        images: ["images/Revas-1.jpg", "images/Revas-2.jpg"],
        link: "https://www.linkedin.com/posts/mirmahadiabbas_boss-boss-businesscompetition-activity-7332209423043493888-drkj"
      },
      {
        title: "Hult Prize, University Round",
        badge: "Runner-up",
        desc: "Designed RenewAge, a repair-skills platform connecting older generations with Gen Z to cut waste and promote circular-economy habits. Took it from rapid market research to a pitched business model under a tight deadline.",
        images: ["images/Hult-1.jpg", "images/Hult-2.jpg"],
        link: "https://www.linkedin.com/posts/mirmahadiabbas_hultprize-innovation-sustainability-activity-7302489149993885696-BSKY"
      }
    ]
  },

  /* ============ CERTIFICATES ============ */
  certificates: [
    {
      name: "Lean Six Sigma Green Belt",
      issuer: "ILSSI",
      image: "images/Certificate_Six_sigma_jpg.png"
    },
    {
      name: "Generative AI for Project Managers",
      issuer: "Project Management Institute",
      image: "images/Certificate_PMI.jpg"
    },
    {
      name: "Career Essentials in Project Management",
      issuer: "Microsoft & LinkedIn",
      image: "images/Certificate_Project_Management.jpg"
    },
    {
      name: "Python Associate",
      issuer: "Infosys",
      image: "images/Certificate_Python_jpg.png"
    }
  ],

  /* ============ FROM MY LINKEDIN ============ */
  linkedin: {
    profile: "https://linkedin.com/in/mirmahadiabbas/",
    posts: [
      {
        text: "Economic analysis of Xbox Game Pass: competitive strategy and market position.",
        cap: "Economics for Managers, Cranfield",
        image: "images/LT5-Economics-1.jpg",
        link: "https://www.linkedin.com/posts/mirmahadiabbas_economicsformanagers-xboxgamepass-cranfielduniversity-activity-7278604673433935873-RFLS"
      },
      {
        text: "GCCx Summit 2024: covering India's largest GenAI and GCC innovation event.",
        cap: "Media partner via WSPL",
        image: "images/GCC_Summit-2.jpg",
        link: "https://www.linkedin.com/posts/mirmahadiabbas_gccxsummit2024-generativeai-innovation-activity-7223389524419043328-5u87"
      },
      {
        text: "Cranfield Green Team: sustainability and biodiversity initiatives on campus.",
        cap: "Volunteering",
        image: "images/Green_team-1.jpg",
        link: "https://www.linkedin.com/posts/mirmahadiabbas_sustainability-biodiversity-cranfielduniversity-activity-7363900900546940928-6tWv"
      }
    ]
  },

  /* ============ CONTACT ============ */
  contact: {
    title: "Let's <em>talk</em>",
    sub: "Open to consulting, PMO and business analyst roles in the UK, and to freelance project work: web builds, AI and workflow automation, dashboards, video editing.",
    email: "mirabbasun@gmail.com",
    linkedinUrl: "https://linkedin.com/in/mirmahadiabbas/",
    location: "Milton Keynes, United Kingdom"
  }
};
