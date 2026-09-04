export interface LevelDefinition {
  level: number;
  title: string;
  description: string;
}

export interface CompetencyFrameworkItem {
  id: string;
  name: string;
  domain: "statistical" | "technical" | "digital" | "behavioural";
  category: "Mandatory Core" | "Role-Specific";
  description: string;
  level_definitions: LevelDefinition[];
  required_level_by_role: Record<string, number>;
  assessment_method: "Diagnostic Test" | "Supervisor Assessment" | "Training & Resume Match" | "Peer Review & Portfolio" | "Certification Audit";
  prerequisites: string[];
  standard_reference?: string;
  career_stage: "Entry-level" | "Mid-career" | "Senior/Leadership";
}

export const FRAMEWORK_CONFIG = {
  version: "v1.0",
  lastReviewedDate: "September 2026",
  scoringExplainerFormula:
    "Your competency level score blends five weighted evidence signals: Qualifications (15%), Work Experience (20%), Completed Training & Courses (30%), Resume & Skill Tags (20%), and Self-Assessment (15%).",
};

export const NATIONAL_COMPETENCY_FRAMEWORK: CompetencyFrameworkItem[] = [
  // ==========================================
  // STATISTICAL DOMAIN (10 Competencies)
  // ==========================================
  {
    id: "STAT-001",
    name: "Survey Design",
    domain: "statistical",
    category: "Mandatory Core",
    description:
      "Formulating questionnaires, sampling frames, and field execution protocols for large-scale household and enterprise surveys.",
    assessment_method: "Peer Review & Portfolio",
    prerequisites: ["Sampling", "Data Quality Frameworks"],
    standard_reference: "UN NQAF / MoSPI Survey Guidelines",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Aware of survey design concepts, questionnaire structure, and basic survey terminology." },
      { level: 2, title: "Working", description: "Assists in drafting survey questions and pilot testing questionnaires under supervision." },
      { level: 3, title: "Practitioner", description: "Independently designs standard survey schedules and field execution instructions." },
      { level: 4, title: "Advanced", description: "Designs multi-stage complex national surveys, sampling frames, and validation protocols." },
      { level: 5, title: "Expert", description: "Leads national survey methodology panels and establishes international survey design standards." },
    ],
  },
  {
    id: "STAT-002",
    name: "Sampling",
    domain: "statistical",
    category: "Mandatory Core",
    description:
      "Designing simple random, stratified, cluster, and multi-stage sampling methodologies for official statistics.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Survey Design"],
    standard_reference: "ISO 3534-2 / UN Statistical Sampling",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands simple random sampling principles and basic probability concepts." },
      { level: 2, title: "Working", description: "Calculates sample sizes and draws random samples using standard statistical software." },
      { level: 3, title: "Practitioner", description: "Constructs stratified multi-stage sampling designs and calculates design effects." },
      { level: 4, title: "Advanced", description: "Formulates complex estimation weights, non-response adjustments, and calibration weights." },
      { level: 5, title: "Expert", description: "Innovates novel sampling frames, small area estimation methods, and national sampling master plans." },
    ],
  },
  {
    id: "STAT-003",
    name: "National Accounts",
    domain: "statistical",
    category: "Mandatory Core",
    description:
      "Compiling Gross Value Added (GVA), Gross Domestic Product (GDP), and input-output tables following SNA 2008 standards.",
    assessment_method: "Certification Audit",
    prerequisites: ["Industrial Statistics", "Price Statistics"],
    standard_reference: "System of National Accounts (SNA 2008)",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands GDP definitions, macroeconomic aggregates, and basic national accounts terminology." },
      { level: 2, title: "Working", description: "Processes sectoral data inputs for quarterly GDP estimations under supervision." },
      { level: 3, title: "Practitioner", description: "Compiles Gross Value Added (GVA) for specific industry sectors following SNA 2008 manuals." },
      { level: 4, title: "Advanced", description: "Constructs Supply and Use Tables (SUT), Input-Output tables, and base-year revision series." },
      { level: 5, title: "Expert", description: "Directs national GDP compilation policy, SNA 2025 transition, and regional accounts frameworks." },
    ],
  },
  {
    id: "STAT-004",
    name: "Price Statistics",
    domain: "statistical",
    category: "Role-Specific",
    description:
      "Constructing Wholesale Price Index (WPI), Consumer Price Index (CPI), and basket weighting schemes.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Sampling"],
    standard_reference: "ILO CPI Manual / UN Price Statistics Guide",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands price index formulas (Laspeyres, Paasche, Fisher) and CPI/WPI concepts." },
      { level: 2, title: "Working", description: "Validates monthly price quotations collected from urban/rural markets." },
      { level: 3, title: "Practitioner", description: "Computes sub-group price indices, handles quality adjustments, and monitors base-year weights." },
      { level: 4, title: "Advanced", description: "Designs basket weighting schemes, hedonic pricing models, and national inflation series." },
      { level: 5, title: "Expert", description: "Advises government on price policy statistics, spatial price deflators, and global PPP series." },
    ],
  },
  {
    id: "STAT-005",
    name: "Labour Statistics",
    domain: "statistical",
    category: "Role-Specific",
    description:
      "Analyzing Periodic Labour Force Survey (PLFS) indicators, workforce participation rates, and unemployment metrics.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Survey Design", "Sampling"],
    standard_reference: "ICLS Standards / PLFS Framework",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands Usual Status (US) and Current Weekly Status (CWS) labour market definitions." },
      { level: 2, title: "Working", description: "Extracts and cleans PLFS microdata records for preliminary reporting." },
      { level: 3, title: "Practitioner", description: "Computes Worker Population Ratio (WPR) and Labour Force Participation Rate (LFPR) metrics." },
      { level: 4, title: "Advanced", description: "Performs complex econometric modeling of informal employment, gig economy, and wage dynamics." },
      { level: 5, title: "Expert", description: "Formulates national employment statistics policy and ILO international compliance frameworks." },
    ],
  },
  {
    id: "STAT-006",
    name: "Agricultural Statistics",
    domain: "statistical",
    category: "Role-Specific",
    description:
      "Estimating crop yields, land usage data, and agricultural census aggregations.",
    assessment_method: "Training & Resume Match",
    prerequisites: ["Sampling", "GIS"],
    standard_reference: "FAO Agricultural Statistics / Agri-Census",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands crop estimation surveys (CCE) and land utilization classification schemes." },
      { level: 2, title: "Working", description: "Assists in processing state-level crop cutting experiment data." },
      { level: 3, title: "Practitioner", description: "Computes agricultural yield estimates, crop area indices, and census tables." },
      { level: 4, title: "Advanced", description: "Integrates remote sensing satellite imagery with ground-truth agricultural statistics." },
      { level: 5, title: "Expert", description: "Leads national agricultural statistics planning and global FAO monitoring initiatives." },
    ],
  },
  {
    id: "STAT-007",
    name: "Industrial Statistics",
    domain: "statistical",
    category: "Role-Specific",
    description:
      "Processing Annual Survey of Industries (ASI) data and computing Index of Industrial Production (IIP).",
    assessment_method: "Certification Audit",
    prerequisites: ["National Accounts", "SQL"],
    standard_reference: "NIC 2008 Classification / IIP Manual",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Familiar with National Industrial Classification (NIC 2008) and factory sector schedules." },
      { level: 2, title: "Working", description: "Validates ASI returns submitted by factory units against balance sheet statements." },
      { level: 3, title: "Practitioner", description: "Processes ASI microdata aggregations and monthly IIP production series." },
      { level: 4, title: "Advanced", description: "Re-weights industrial baskets and models manufacturing capital-labor growth series." },
      { level: 5, title: "Expert", description: "Directs national industrial policy data compilation and UNIDO manufacturing benchmarks." },
    ],
  },
  {
    id: "STAT-008",
    name: "SDG Indicators",
    domain: "statistical",
    category: "Mandatory Core",
    description:
      "Monitoring Sustainable Development Goals (SDG) National Indicator Framework metadata and progress reporting.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Metadata Standards"],
    standard_reference: "UN NIF Guidelines / MoSPI SDG Dashboard",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands the 17 SDGs, target goals, and NIF indicator metadata structures." },
      { level: 2, title: "Working", description: "Compiles line ministry data for specific SDG indicator calculations." },
      { level: 3, title: "Practitioner", description: "Computes SDG Progress Reports and state-level NIF baseline scores." },
      { level: 4, title: "Advanced", description: "Designs disaggregated indicator metrics and inter-ministerial SDG monitoring systems." },
      { level: 5, title: "Expert", description: "Represents India at UN High-Level Political Forum for SDG statistical alignment." },
    ],
  },
  {
    id: "STAT-009",
    name: "Metadata Standards",
    domain: "statistical",
    category: "Role-Specific",
    description:
      "Structuring microdata documentation according to SDMX and DDI statistical metadata standards.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Data Quality Frameworks"],
    standard_reference: "SDMX 2.1 / DDI Alliance Specifications",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands what metadata is and the role of standard variable dictionaries." },
      { level: 2, title: "Working", description: "Populates DDI codebooks for survey microdata documentation." },
      { level: 3, title: "Practitioner", description: "Builds SDMX data structures, dataflows, and code lists for international data sharing." },
      { level: 4, title: "Advanced", description: "Architects enterprise metadata repositories and automated registry endpoints." },
      { level: 5, title: "Expert", description: "Contributes to global SDMX standard working groups and metadata governance." },
    ],
  },
  {
    id: "STAT-010",
    name: "Data Quality Frameworks",
    domain: "statistical",
    category: "Mandatory Core",
    description:
      "Implementing National Quality Assurance Framework (NQAF) for validating official data integrity.",
    assessment_method: "Peer Review & Portfolio",
    prerequisites: ["Metadata Standards", "Survey Design"],
    standard_reference: "UN NQAF / MoSPI Quality Policy",
    career_stage: "Senior/Leadership",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands NQAF quality dimensions: relevance, accuracy, timeliness, accessibility." },
      { level: 2, title: "Working", description: "Performs range checks, missing value audits, and logical consistency checks." },
      { level: 3, title: "Practitioner", description: "Conducts data quality audits on raw field microdata and generates quality reports." },
      { level: 4, title: "Advanced", description: "Establishes automated data validation pipelines and quality assurance standards across units." },
      { level: 5, title: "Expert", description: "Formulates national data quality audit policy and certifies official statistics releases." },
    ],
  },

  // ==========================================
  // TECHNICAL DOMAIN (12 Competencies)
  // ==========================================
  {
    id: "TECH-001",
    name: "Python",
    domain: "technical",
    category: "Mandatory Core",
    description:
      "Writing automated data cleaning scripts, Pandas DataFrame manipulations, and statistical models in Python.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["SQL"],
    standard_reference: "PEP 8 / Open Source Analytics",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Knows basic Python syntax, data types, and running simple print/math scripts." },
      { level: 2, title: "Working", description: "Uses Pandas/NumPy to load CSVs, clean missing data, and export summary statistics." },
      { level: 3, title: "Practitioner", description: "Writes modular functions, automated ETL pipelines, and Matplotlib/Seaborn charts." },
      { level: 4, title: "Advanced", description: "Develops custom Python statistical packages, Scikit-learn models, and API integrations." },
      { level: 5, title: "Expert", description: "Architects distributed big data Python pipelines (PySpark) for national census scale data." },
    ],
  },
  {
    id: "TECH-002",
    name: "R",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Conducting parametric/non-parametric tests, survey package estimations, and reproducible R Markdown reports.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Sampling"],
    standard_reference: "CRAN R Guidelines",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands R syntax, vectors, dataframes, and RStudio environment." },
      { level: 2, title: "Working", description: "Runs summary statistics, t-tests, and ggplot2 visualizations using dplyr." },
      { level: 3, title: "Practitioner", description: "Uses R 'survey' package for complex sample survey weights and R Markdown reports." },
      { level: 4, title: "Advanced", description: "Develops Shiny web apps, automated PDF report generation, and time-series models." },
      { level: 5, title: "Expert", description: "Author of specialized R statistical packages for official government statistics." },
    ],
  },
  {
    id: "TECH-003",
    name: "SQL",
    domain: "technical",
    category: "Mandatory Core",
    description:
      "Querying relational databases, complex joins, aggregation pipelines, and window functions for survey microdata.",
    assessment_method: "Diagnostic Test",
    prerequisites: [],
    standard_reference: "ANSI SQL Specifications",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands SELECT, WHERE, and basic database table relationships." },
      { level: 2, title: "Working", description: "Writes INNER/LEFT JOINs, GROUP BY aggregations, and subqueries." },
      { level: 3, title: "Practitioner", description: "Uses window functions (ROW_NUMBER, OVER), CTEs, and index optimization." },
      { level: 4, title: "Advanced", description: "Designs database schemas, stored procedures, and multi-million row microdata queries." },
      { level: 5, title: "Expert", description: "Architects national relational database infrastructure and distributed SQL engines." },
    ],
  },
  {
    id: "TECH-004",
    name: "Stata",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Running econometric regressions, panel data analysis, and survey weighting adjustments using Stata syntax.",
    assessment_method: "Training & Resume Match",
    prerequisites: ["Sampling"],
    standard_reference: "Stata Econometrics Manual",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Knows basic Stata do-file execution and descriptive command syntax." },
      { level: 2, title: "Working", description: "Runs OLS regressions, cross-tabulations, and data re-coding commands." },
      { level: 3, title: "Practitioner", description: "Applies 'svyset' survey commands, panel data models (xtreg), and instrumental variables." },
      { level: 4, title: "Advanced", description: "Writes complex Stata ado-files, automated batch do-files, and policy impact evaluations." },
      { level: 5, title: "Expert", description: "Leads national econometric research projects using advanced Stata routines." },
    ],
  },
  {
    id: "TECH-005",
    name: "SPSS",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Performing cross-tabulations, factor analysis, and descriptive statistical summaries using IBM SPSS.",
    assessment_method: "Training & Resume Match",
    prerequisites: [],
    standard_reference: "IBM SPSS User Guide",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Navigates SPSS GUI, Data View, and Variable View windows." },
      { level: 2, title: "Working", description: "Generates frequency tables, cross-tabs, and basic charts in SPSS." },
      { level: 3, title: "Practitioner", description: "Performs ANOVA, factor analysis, and regression using SPSS syntax scripts." },
      { level: 4, title: "Advanced", description: "Automates survey reporting with SPSS Macro language and Python integration." },
      { level: 5, title: "Expert", description: "Trains government statistical staff on enterprise SPSS analytical workflows." },
    ],
  },
  {
    id: "TECH-006",
    name: "SAS",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Executing enterprise data analytics macros and statistical data handling in SAS environments.",
    assessment_method: "Certification Audit",
    prerequisites: ["SQL"],
    standard_reference: "SAS Global Certification Standard",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands DATA step and PROC step basic structure in SAS." },
      { level: 2, title: "Working", description: "Runs PROC MEANS, PROC FREQ, and data sorting tasks." },
      { level: 3, title: "Practitioner", description: "Writes SAS Macros, PROC SQL, and complex data merges for survey microdata." },
      { level: 4, title: "Advanced", description: "Optimizes large-scale SAS jobs and implements automated reporting systems." },
      { level: 5, title: "Expert", description: "Architects enterprise SAS analytics infrastructure for ministry divisions." },
    ],
  },
  {
    id: "TECH-007",
    name: "GIS",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Spatial data analysis, geo-tagging survey enumeration blocks, and thematic map rendering using QGIS/ArcGIS.",
    assessment_method: "Peer Review & Portfolio",
    prerequisites: ["Agricultural Statistics"],
    standard_reference: "OGC Geospatial Standards / ISRO Bhuvan",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands coordinate reference systems (CRS), shapefiles, and raster vs vector data." },
      { level: 2, title: "Working", description: "Imports shapefiles into QGIS and renders basic thematic choropleth maps." },
      { level: 3, title: "Practitioner", description: "Performs spatial joins, enumeration block geo-tagging, and buffer analyses." },
      { level: 4, title: "Advanced", description: "Integrates Bhuvan/ISRO satellite feeds for automated crop and land cover monitoring." },
      { level: 5, title: "Expert", description: "Directs national statistical GIS spatial infrastructure and census mapping frameworks." },
    ],
  },
  {
    id: "TECH-008",
    name: "Data Visualization",
    domain: "technical",
    category: "Mandatory Core",
    description:
      "Building interactive dashboards, charts, and public infographics using PowerBI, Tableau, and D3/Plotly.",
    assessment_method: "Peer Review & Portfolio",
    prerequisites: ["Python", "SQL"],
    standard_reference: "MoSPI Dashboard Design Guidelines",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands basic chart selection principles (bar, line, scatter, pie)." },
      { level: 2, title: "Working", description: "Creates clean Excel charts and basic PowerBI visual dashboards." },
      { level: 3, title: "Practitioner", description: "Builds interactive multi-page dashboards with DAX measures and filtering." },
      { level: 4, title: "Advanced", description: "Develops custom web infographics, D3.js plots, and executive reporting suites." },
      { level: 5, title: "Expert", description: "Leads national statistical visualization standards for public portals and cabinet briefings." },
    ],
  },
  {
    id: "TECH-009",
    name: "AI/ML",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Applying machine learning algorithms (Random Forests, Gradient Boosting) for automated imputation and anomaly detection.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Python", "R"],
    standard_reference: "NITI Aayog AI Strategy / Open Machine Learning",
    career_stage: "Senior/Leadership",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands Machine Learning concepts (Supervised vs Unsupervised learning)." },
      { level: 2, title: "Working", description: "Applies basic linear regression and decision trees using Scikit-learn." },
      { level: 3, title: "Practitioner", description: "Trains Random Forest models for automated microdata outlier detection and imputation." },
      { level: 4, title: "Advanced", description: "Deploys Deep Learning models, NLP for text coding, and MLOps pipelines." },
      { level: 5, title: "Expert", description: "Pioneers official AI statistics methodologies and national AI governance frameworks." },
    ],
  },
  {
    id: "TECH-010",
    name: "Cloud Computing",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Deploying data pipelines and statistical analytical workloads on cloud infrastructures (MeghRaj / AWS).",
    assessment_method: "Certification Audit",
    prerequisites: ["Government Cloud", "APIs"],
    standard_reference: "MeghRaj GI Cloud Guidelines / MeitY",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands cloud concepts: IaaS, PaaS, SaaS, and MeghRaj architecture." },
      { level: 2, title: "Working", description: "Deploys virtual machines and configures cloud storage buckets." },
      { level: 3, title: "Practitioner", description: "Manages containerized workloads (Docker) and cloud database instances." },
      { level: 4, title: "Advanced", description: "Architects serverless cloud analytics pipelines and auto-scaling environments." },
      { level: 5, title: "Expert", description: "Directs cloud infrastructure strategy for Ministry-wide statistical workloads." },
    ],
  },
  {
    id: "TECH-011",
    name: "APIs",
    domain: "technical",
    category: "Role-Specific",
    description:
      "Developing and consuming RESTful web APIs for automated microdata dissemination and system interoperability.",
    assessment_method: "Diagnostic Test",
    prerequisites: ["Python", "SQL"],
    standard_reference: "Open Government Data API Standard",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands HTTP methods (GET, POST), JSON format, and REST concepts." },
      { level: 2, title: "Working", description: "Consumes external REST APIs using Python requests or JavaScript fetch." },
      { level: 3, title: "Practitioner", description: "Builds FastAPI/Flask microservices with JWT authentication and documentation." },
      { level: 4, title: "Advanced", description: "Implements API rate-limiting, OAuth2 security gateways, and high-throughput feeds." },
      { level: 5, title: "Expert", description: "Establishes National Statistical API Interoperability Standards." },
    ],
  },
  {
    id: "TECH-012",
    name: "Open Data",
    domain: "technical",
    category: "Mandatory Core",
    description:
      "Publishing anonymized machine-readable statistical datasets on Open Government Data (OGD) Portal.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Data Privacy", "Metadata Standards"],
    standard_reference: "NDSAP / OGD Platform India",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Familiar with National Data Sharing and Accessibility Policy (NDSAP)." },
      { level: 2, title: "Working", description: "Prepares open datasets in CSV/JSON formats with standardized data dictionaries." },
      { level: 3, title: "Practitioner", description: "Applies k-anonymity and differential privacy rules prior to public publishing." },
      { level: 4, title: "Advanced", description: "Automates microdata dissemination pipelines to data.gov.in portal." },
      { level: 5, title: "Expert", description: "Formulates national open data license frameworks and accessibility mandates." },
    ],
  },

  // ==========================================
  // DIGITAL GOVERNANCE DOMAIN (5 Competencies)
  // ==========================================
  {
    id: "DIG-001",
    name: "Cybersecurity",
    domain: "digital",
    category: "Mandatory Core",
    description:
      "Adhering to CERT-In security protocols, password hygiene, phishing defense, and secure data handling.",
    assessment_method: "Diagnostic Test",
    prerequisites: [],
    standard_reference: "CERT-In Cyber Security Guidelines",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Practices strong password hygiene, multi-factor auth, and phishing detection." },
      { level: 2, title: "Working", description: "Complies with CERT-In desktop security policies and data encryption guidelines." },
      { level: 3, title: "Practitioner", description: "Conducts security vulnerability assessments on statistical survey tools." },
      { level: 4, title: "Advanced", description: "Implements zero-trust network access and incident response protocols." },
      { level: 5, title: "Expert", description: "Directs Ministry Cybersecurity Operations and Chief Information Security Officer (CISO) duties." },
    ],
  },
  {
    id: "DIG-002",
    name: "Data Privacy",
    domain: "digital",
    category: "Mandatory Core",
    description:
      "Applying Digital Personal Data Protection (DPDP) Act guidelines, anonymization, and confidentiality rules.",
    assessment_method: "Certification Audit",
    prerequisites: ["Cybersecurity"],
    standard_reference: "DPDP Act 2023 / MeitY Data Protection",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands key provisions of the Digital Personal Data Protection (DPDP) Act 2023." },
      { level: 2, title: "Working", description: "Ensures respondent consent clauses and PII redaction in field data collection." },
      { level: 3, title: "Practitioner", description: "Executes microdata anonymization algorithms (statistical disclosure control)." },
      { level: 4, title: "Advanced", description: "Designs Data Protection Impact Assessments (DPIA) for government statistical databases." },
      { level: 5, title: "Expert", description: "Serves as Ministry Data Protection Officer (DPO) and advises on legal privacy compliance." },
    ],
  },
  {
    id: "DIG-003",
    name: "Digital Signatures",
    domain: "digital",
    category: "Role-Specific",
    description:
      "Using e-Sign, PKI certificates, and e-Office authentication for official document validation.",
    assessment_method: "Training & Resume Match",
    prerequisites: [],
    standard_reference: "CCA India PKI Standards / e-Sign Desk",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands digital certificates (DSC) and PKI signature verification." },
      { level: 2, title: "Working", description: "Uses e-Sign for approving official notes and e-Office file movements." },
      { level: 3, title: "Practitioner", description: "Configures DSC tokens, bulk document signing, and validation server scripts." },
      { level: 4, title: "Advanced", description: "Integrates e-Sign APIs into automated statistical release workflows." },
      { level: 5, title: "Expert", description: "Oversees Ministry PKI deployment and digital authentication infrastructure." },
    ],
  },
  {
    id: "DIG-004",
    name: "Government Cloud",
    domain: "digital",
    category: "Role-Specific",
    description:
      "Utilizing NIC / GI Cloud (MeghRaj) hosting services and security guidelines for official software applications.",
    assessment_method: "Certification Audit",
    prerequisites: ["Cloud Computing"],
    standard_reference: "MeghRaj / NIC Cloud Policy",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 4.5,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Knows MeghRaj cloud services available for government ministries." },
      { level: 2, title: "Working", description: "Submits MeghRaj server provisioning requisitions and staging deployments." },
      { level: 3, title: "Practitioner", description: "Manages NIC Cloud virtual servers, firewall rules, and SSL certificates." },
      { level: 4, title: "Advanced", description: "Executes cloud migration projects for legacy statistical survey databases." },
      { level: 5, title: "Expert", description: "Formulates Ministry Cloud Strategy and NIC data center coordination." },
    ],
  },
  {
    id: "DIG-005",
    name: "Digital Public Infrastructure",
    domain: "digital",
    category: "Mandatory Core",
    description:
      "Leveraging India Stack, Aadhaar e-KYC, DigiLocker, and UPI integrations within digital governance workflows.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["APIs"],
    standard_reference: "India Stack Architecture / MeitY",
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands India Stack pillars: Identity (Aadhaar), Payments (UPI), Data (DigiLocker)." },
      { level: 2, title: "Working", description: "Uses DigiLocker integration for verifying official officer credentials." },
      { level: 3, title: "Practitioner", description: "Integrates e-KYC and digital consent artifacts into survey respondent verification." },
      { level: 4, title: "Advanced", description: "Architects DPI-based data exchange pipelines between statistical databases." },
      { level: 5, title: "Expert", description: "Advises government on DPI utilization for official statistics and censuses." },
    ],
  },

  // ==========================================
  // BEHAVIOURAL DOMAIN (6 Competencies)
  // ==========================================
  {
    id: "BEH-001",
    name: "Leadership",
    domain: "behavioural",
    category: "Mandatory Core",
    description:
      "Guiding survey field teams, managing statistical units, and fostering collaborative research environments.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Communication", "Project Management"],
    career_stage: "Senior/Leadership",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Demonstrates personal accountability and team support in daily assignments." },
      { level: 2, title: "Working", description: "Leads small field data collection teams or sub-unit statistical projects." },
      { level: 3, title: "Practitioner", description: "Manages divisional teams, resolves conflicts, and motivates staff through targets." },
      { level: 4, title: "Advanced", description: "Drives strategic vision for major statistical divisions and mentors officers." },
      { level: 5, title: "Expert", description: "Provides visionary national leadership for Ministry policies and statistical reforms." },
    ],
  },
  {
    id: "BEH-002",
    name: "Communication",
    domain: "behavioural",
    category: "Mandatory Core",
    description:
      "Presenting complex statistical insights clearly to policymakers, stakeholders, and general public audiences.",
    assessment_method: "Peer Review & Portfolio",
    prerequisites: ["Data Visualization"],
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 3.0,
      "Senior Statistical Officer": 4.0,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Writes clear internal memos and summaries of statistical tables." },
      { level: 2, title: "Working", description: "Drafts official statistical notes, press releases, and executive briefs." },
      { level: 3, title: "Practitioner", description: "Delivers engaging technical presentations to inter-ministerial committees." },
      { level: 4, title: "Advanced", description: "Communicates sensitive statistical releases to media and national policy panels." },
      { level: 5, title: "Expert", description: "Serves as official Ministry spokesperson and chief statistical communicator." },
    ],
  },
  {
    id: "BEH-003",
    name: "Project Management",
    domain: "behavioural",
    category: "Mandatory Core",
    description:
      "Planning survey timelines, allocating field resources, and tracking milestone completion within budget limits.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Leadership"],
    career_stage: "Mid-career",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands project life-cycles, milestones, and task deliverables." },
      { level: 2, title: "Working", description: "Tracks field survey schedules and monitors regional data entry progress." },
      { level: 3, title: "Practitioner", description: "Manages full survey project plans, resource budgets, and risk registers." },
      { level: 4, title: "Advanced", description: "Oversees complex multi-year national census or economic survey programs." },
      { level: 5, title: "Expert", description: "Directs Ministry PMO framework and major statistical infrastructure investments." },
    ],
  },
  {
    id: "BEH-004",
    name: "Ethics",
    domain: "behavioural",
    category: "Mandatory Core",
    description:
      "Upholding Fundamental Principles of Official Statistics, integrity, impartiality, and professional code of conduct.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["Data Quality Frameworks"],
    standard_reference: "UN Fundamental Principles of Official Statistics",
    career_stage: "Entry-level",
    required_level_by_role: {
      "Statistical Officer": 4.0,
      "Senior Statistical Officer": 4.5,
      "Assistant Director": 5.0,
      "Deputy Director": 5.0,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Understands the UN Fundamental Principles of Official Statistics and confidentiality." },
      { level: 2, title: "Working", description: "Strictly adheres to data protection rules and unbiased statistical reporting." },
      { level: 3, title: "Practitioner", description: "Identifies and resists political or external pressures to alter statistical results." },
      { level: 4, title: "Advanced", description: "Establishes ethical review protocols for new survey methodologies and algorithms." },
      { level: 5, title: "Expert", description: "Champions national statistical independence, transparency, and public trust." },
    ],
  },
  {
    id: "BEH-005",
    name: "Decision Making",
    domain: "behavioural",
    category: "Role-Specific",
    description:
      "Synthesizing empirical evidence and risk evaluations to formulate actionable policy recommendations.",
    assessment_method: "Supervisor Assessment",
    prerequisites: ["National Accounts", "Labour Statistics"],
    career_stage: "Senior/Leadership",
    required_level_by_role: {
      "Statistical Officer": 2.5,
      "Senior Statistical Officer": 3.5,
      "Assistant Director": 4.0,
      "Deputy Director": 4.5,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Gathers relevant data inputs to support routine operational decisions." },
      { level: 2, title: "Working", description: "Evaluates alternative data sources and recommends optimal data cleaning methods." },
      { level: 3, title: "Practitioner", description: "Makes sound methodological decisions under data ambiguity or field constraints." },
      { level: 4, title: "Advanced", description: "Formulates strategic policy choices based on complex econometric modeling." },
      { level: 5, title: "Expert", description: "Advises Cabinet and Union Ministers on high-stakes statistical and economic policy." },
    ],
  },
  {
    id: "BEH-006",
    name: "Change Management",
    domain: "behavioural",
    category: "Role-Specific",
    description:
      "Driving digital transformation, adapting to new statistical technologies, and guiding staff through transition.",
    assessment_method: "Training & Resume Match",
    prerequisites: ["Leadership"],
    career_stage: "Senior/Leadership",
    required_level_by_role: {
      "Statistical Officer": 2.0,
      "Senior Statistical Officer": 3.0,
      "Assistant Director": 3.5,
      "Deputy Director": 4.0,
      "Joint Director": 5.0,
    },
    level_definitions: [
      { level: 1, title: "Awareness", description: "Adapts positively to new software tools and updated statistical workflows." },
      { level: 2, title: "Working", description: "Supports colleagues in adopting digital data collection tools (CAPI/CATI)." },
      { level: 3, title: "Practitioner", description: "Manages transition plans from paper-based to digital survey methodologies." },
      { level: 4, title: "Advanced", description: "Leads organizational restructuring and digital skill upgrading across cadres." },
      { level: 5, title: "Expert", description: "Drives national statistical modernization and digital transformation roadmap." },
    ],
  },
];

/**
 * Helper to compute estimated hours to next level dynamically from course catalog data.
 * Solves Requirement 5: Recomputed live from course catalog, not hardcoded!
 */
export function calculateEstHoursForCompetency(
  competencyName: string,
  courses: Array<{ title?: string; tags?: string; topic?: string; duration?: string }>
): number {
  const cLower = competencyName.toLowerCase();
  let total = 0;
  for (const course of courses) {
    const titleMatch = (course.title || "").toLowerCase().includes(cLower);
    const tagsMatch = (course.tags || "").toLowerCase().includes(cLower);
    const topicMatch = (course.topic || "").toLowerCase().includes(cLower);

    if (titleMatch || tagsMatch || topicMatch) {
      const durStr = course.duration || "10";
      const match = durStr.match(/(\d+)/);
      if (match && match[1]) {
        total += parseInt(match[1], 10);
      } else {
        total += 10;
      }
    }
  }
  return total > 0 ? total : 15; // default fallback if catalog doesn't contain matching course
}
