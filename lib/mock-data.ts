export const user = {
  name: "Dr. Sharma",
  initials: "DS",
  role: "Statistical Officer",
  department: "National Statistical Office (NSO)",
  experience: "12 years experience",
  overall: 68,
  growth: 14,
};

export type Priority = "Critical" | "High" | "Medium" | "Low";

export const competencyGroups = [
  { key: "statistical", label: "Statistical", score: 78, token: "var(--secondary)" },
  { key: "technical", label: "Technical", score: 56, token: "var(--warning)" },
  { key: "digital", label: "Digital Governance", score: 64, token: "var(--teal)" },
  { key: "behavioural", label: "Behavioural", score: 74, token: "var(--purple)" },
] as const;

export type GroupKey = (typeof competencyGroups)[number]["key"];

export interface CompetencyDetail {
  name: string;
  description: string;
  level: number; // 1 to 5
  evidence: string;
  trend: number; // percentage change (+ or -)
}

export const competencyDetails: Record<GroupKey, CompetencyDetail[]> = {
  statistical: [
    {
      name: "Survey Design",
      description: "Formulating questionnaires, sampling frames, and field execution protocols for large-scale household and enterprise surveys.",
      level: 4,
      evidence: "Peer Review & Survey Manuals - Level 4",
      trend: 5,
    },
    {
      name: "Sampling",
      description: "Designing simple random, stratified, cluster, and multi-stage sampling methodologies for official statistics.",
      level: 3,
      evidence: "Diagnostic Test - 78%",
      trend: 6,
    },
    {
      name: "National Accounts",
      description: "Compiling Gross Value Added (GVA), Gross Domestic Product (GDP), and input-output tables following SNA 2008 standards.",
      level: 4,
      evidence: "Supervisor Assessment & GDP Estimation Logs",
      trend: 0,
    },
    {
      name: "Price Statistics",
      description: "Constructing Wholesale Price Index (WPI), Consumer Price Index (CPI), and basket weighting schemes.",
      level: 3,
      evidence: "Assessment - 71%",
      trend: -2,
    },
    {
      name: "Labour Statistics",
      description: "Analyzing Periodic Labour Force Survey (PLFS) indicators, workforce participation rates, and unemployment metrics.",
      level: 3,
      evidence: "PLFS Analytical Report Certification",
      trend: 4,
    },
    {
      name: "Agricultural Statistics",
      description: "Estimating crop yields, land usage data, and agricultural census aggregations.",
      level: 3,
      evidence: "Agri-Census Module Completion",
      trend: 2,
    },
    {
      name: "Industrial Statistics",
      description: "Processing Annual Survey of Industries (ASI) data and computing Index of Industrial Production (IIP).",
      level: 4,
      evidence: "ASI Validation Audit - 88%",
      trend: 3,
    },
    {
      name: "SDG Indicators",
      description: "Monitoring Sustainable Development Goals (SDG) National Indicator Framework metadata and progress reporting.",
      level: 3,
      evidence: "MoSPI NIF Workshop Certification",
      trend: 7,
    },
    {
      name: "Metadata Standards",
      description: "Structuring microdata documentation according to SDMX and DDI statistical metadata standards.",
      level: 2,
      evidence: "Diagnostic Test - 58%",
      trend: 4,
    },
    {
      name: "Data Quality Frameworks",
      description: "Implementing National Quality Assurance Framework (NQAF) for validating official data integrity.",
      level: 3,
      evidence: "Quality Assurance Evaluation - 74%",
      trend: 1,
    },
  ],
  technical: [
    {
      name: "Python",
      description: "Writing automated data cleaning scripts, Pandas DataFrame manipulations, and statistical models in Python.",
      level: 2,
      evidence: "Diagnostic Test - 36%",
      trend: 5,
    },
    {
      name: "R",
      description: "Conducting parametric/non-parametric tests, survey package estimations, and reproducible R Markdown reports.",
      level: 3,
      evidence: "Course Completion - iGOT Karmayogi",
      trend: 8,
    },
    {
      name: "SQL",
      description: "Querying relational databases, complex joins, aggregation pipelines, and window functions for survey microdata.",
      level: 2,
      evidence: "Diagnostic Test - 41%",
      trend: 2,
    },
    {
      name: "Stata",
      description: "Running econometric regressions, panel data analysis, and survey weighting adjustments using Stata syntax.",
      level: 3,
      evidence: "NSSTA Workshop Evaluation - 76%",
      trend: 3,
    },
    {
      name: "SPSS",
      description: "Performing cross-tabulations, factor analysis, and descriptive statistical summaries using IBM SPSS.",
      level: 3,
      evidence: "Survey Analysis Certificate",
      trend: 1,
    },
    {
      name: "SAS",
      description: "Executing enterprise data analytics macros and statistical data handling in SAS environments.",
      level: 2,
      evidence: "Self Assessment - Basic",
      trend: 0,
    },
    {
      name: "GIS",
      description: "Spatial data analysis, geo-tagging survey enumeration blocks, and thematic map rendering using QGIS/ArcGIS.",
      level: 2,
      evidence: "Assessment - 47%",
      trend: 3,
    },
    {
      name: "Data Visualization",
      description: "Building interactive dashboards, charts, and public infographics using PowerBI, Tableau, and D3/Plotly.",
      level: 3,
      evidence: "MoSPI Dashboard Module - 82%",
      trend: 6,
    },
    {
      name: "AI/ML",
      description: "Applying machine learning algorithms (Random Forests, Gradient Boosting) for automated imputation and anomaly detection.",
      level: 1,
      evidence: "Self Assessment - Beginner",
      trend: -1,
    },
    {
      name: "Cloud Computing",
      description: "Deploying data pipelines and statistical analytical workloads on cloud infrastructures (MeghRaj / AWS).",
      level: 2,
      evidence: "Digital India Cloud Certification",
      trend: 4,
    },
    {
      name: "APIs",
      description: "Developing and consuming RESTful web APIs for automated microdata dissemination and system interoperability.",
      level: 2,
      evidence: "Developer Module - 62%",
      trend: 3,
    },
    {
      name: "Open Data",
      description: "Publishing anonymized machine-readable statistical datasets on Open Government Data (OGD) Portal.",
      level: 3,
      evidence: "OGD Compliance Audit - Passed",
      trend: 5,
    },
  ],
  digital: [
    {
      name: "Cybersecurity",
      description: "Adhering to CERT-In security protocols, password hygiene, phishing defense, and secure data handling.",
      level: 4,
      evidence: "Mandatory Cyber Module - 92%",
      trend: 1,
    },
    {
      name: "Data Privacy",
      description: "Applying Digital Personal Data Protection (DPDP) Act guidelines, anonymization, and confidentiality rules.",
      level: 3,
      evidence: "NSSTA Workshop - 80%",
      trend: 5,
    },
    {
      name: "Digital Signatures",
      description: "Using e-Sign, PKI certificates, and e-Office authentication for official document validation.",
      level: 4,
      evidence: "e-Office Verification Audit",
      trend: 2,
    },
    {
      name: "Government Cloud",
      description: "Utilizing NIC / GI Cloud (MeghRaj) hosting services and security guidelines for official software applications.",
      level: 3,
      evidence: "Cloud Admin Assessment",
      trend: 4,
    },
    {
      name: "Digital Public Infrastructure",
      description: "Leveraging India Stack, Aadhaar e-KYC, DigiLocker, and UPI integrations within digital governance workflows.",
      level: 4,
      evidence: "DPI Training Certificate",
      trend: 6,
    },
  ],
  behavioural: [
    {
      name: "Leadership",
      description: "Guiding survey field teams, managing statistical units, and fostering collaborative research environments.",
      level: 3,
      evidence: "Supervisor Performance Review",
      trend: 2,
    },
    {
      name: "Communication",
      description: "Presenting complex statistical insights clearly to policymakers, stakeholders, and general public audiences.",
      level: 4,
      evidence: "360° Peer Feedback",
      trend: 4,
    },
    {
      name: "Project Management",
      description: "Planning survey timelines, allocating field resources, and tracking milestone completion within budget limits.",
      level: 3,
      evidence: "PMI / iGOT Module - 79%",
      trend: 3,
    },
    {
      name: "Ethics",
      description: "Upholding Fundamental Principles of Official Statistics, integrity, impartiality, and professional code of conduct.",
      level: 4,
      evidence: "Mandatory Ethics Module - 95%",
      trend: 0,
    },
    {
      name: "Decision Making",
      description: "Synthesizing empirical evidence and risk evaluations to formulate actionable policy recommendations.",
      level: 4,
      evidence: "Case Study Assessment - 84%",
      trend: 6,
    },
    {
      name: "Change Management",
      description: "Driving digital transformation, adapting to new statistical technologies, and guiding staff through transition.",
      level: 3,
      evidence: "Leadership Workshop Evaluation",
      trend: 3,
    },
  ],
};

export const skillGaps: {
  competency: string;
  current: number;
  required: number;
  gap: number;
  priority: Priority;
  group: GroupKey;
  department: string;
}[] = [
  { competency: "Python", current: 1.8, required: 3.5, gap: 1.7, priority: "Critical", group: "technical", department: "NSO" },
  { competency: "SQL", current: 2.0, required: 3.5, gap: 1.5, priority: "High", group: "technical", department: "NSO" },
  { competency: "GIS", current: 2.1, required: 3.0, gap: 0.9, priority: "Medium", group: "digital", department: "CSO" },
  { competency: "Sampling", current: 3.0, required: 4.0, gap: 1.0, priority: "Medium", group: "statistical", department: "NSO" },
  { competency: "AI/ML", current: 1.2, required: 2.5, gap: 1.3, priority: "High", group: "technical", department: "State Directorates" },
  { competency: "Data Visualization", current: 2.6, required: 3.5, gap: 0.9, priority: "Medium", group: "digital", department: "CSO" },
  { competency: "Communication", current: 3.4, required: 4.0, gap: 0.6, priority: "Low", group: "behavioural", department: "NSO" },
];

export const recommendedCourses = [
  {
    title: "Python for Statistical Analysis",
    provider: "iGOT",
    hours: 6,
    tag: "Closes Python gap",
  },
  {
    title: "SQL for Data Management",
    provider: "NSSTA",
    hours: 4,
    tag: "Closes SQL gap",
  },
];

export const learningPath = [
  {
    step: 1,
    status: "completed" as const,
    title: "Introduction to Statistics for Officials",
    provider: "NSSTA",
    hours: 2,
    tags: ["Statistical", "Foundation"],
    progress: 100,
  },
  {
    step: 2,
    status: "in-progress" as const,
    title: "Python for Data Analysis",
    provider: "iGOT",
    hours: 4,
    tags: ["Technical", "Python"],
    progress: 60,
  },
  {
    step: 3,
    status: "not-started" as const,
    title: "Advanced Sampling Techniques",
    provider: "NSSTA",
    hours: 8,
    tags: ["Statistical", "Sampling"],
    progress: 0,
  },
  {
    step: 4,
    status: "locked" as const,
    title: "Comprehensive Assessment",
    provider: "StatSkill AI",
    hours: 1,
    tags: ["Certification"],
    progress: 0,
  },
];

export const quizQuestions = [
  {
    question: "Which sampling method ensures every member has equal chance of selection?",
    options: [
      "Convenience Sampling",
      "Simple Random Sampling",
      "Quota Sampling",
      "Purposive Sampling",
    ],
    answer: 1,
    explanation:
      "Simple Random Sampling gives every unit in the population an equal and independent probability of being selected, which makes estimates unbiased.",
    difficulty: "Easy",
    bloom: "Remember",
  },
  {
    question: "In a stratified sample, strata should be formed so that units are:",
    options: [
      "Heterogeneous within strata",
      "Homogeneous within strata",
      "Randomly assigned to strata",
      "Equal in size across strata",
    ],
    answer: 1,
    explanation:
      "Strata are formed so units within a stratum are homogeneous, reducing within-stratum variance and improving precision.",
    difficulty: "Medium",
    bloom: "Understand",
  },
  {
    question: "The Consumer Price Index in India is compiled primarily by:",
    options: ["RBI", "NSO", "SEBI", "NITI Aayog"],
    answer: 1,
    explanation:
      "The National Statistical Office (NSO), under MoSPI, compiles and releases the Consumer Price Index.",
    difficulty: "Easy",
    bloom: "Remember",
  },
];

export const priorityStyles: Record<Priority, string> = {
  Critical: "bg-destructive/12 text-destructive border-destructive/30",
  High: "bg-warning/15 text-warning-foreground border-warning/40",
  Medium: "bg-warning/10 text-warning-foreground border-warning/25",
  Low: "bg-success/12 text-success border-success/30",
};
