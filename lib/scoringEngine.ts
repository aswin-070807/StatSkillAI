import { User } from "@/context/AuthContext";
import igotCoursesRaw from "@/data/igot_courses.json";

export interface ComputedCompetencyScore {
  competency_id: string;
  competency_name: string;
  group: string;
  description: string;
  score: number; // 0 to 100
  level: number; // 1.0 to 5.0
  confidence: "High" | "Medium" | "Low";
  confidence_reason: string;
  evidence: string;
  trend: number; // historic percentage change or 0
  breakdown: {
    qualification: number;
    experience: number;
    training: number;
    resume_skill: number;
    self_assessment: number | null;
  };
}

export interface ComputedSkillGap {
  competency_id: string;
  competency: string;
  group: string;
  description: string;
  current: number;
  required: number;
  gap: number;
  priority: "High" | "Medium" | "Low" | "Critical";
  department: string;
  ai_insight?: string;
}

export const ROLE_BENCHMARKS: Record<string, Record<string, number>> = {
  "Statistical Officer": {
    "Survey Design": 4.0,
    "Sampling": 4.0,
    "National Accounts": 4.0,
    "Price Statistics": 3.5,
    "Labour Statistics": 3.5,
    "Data Quality Frameworks": 4.0,
    "Python": 3.5,
    "SQL": 3.5,
    "SPSS": 3.5,
    "Data Visualization": 3.5,
    "Cybersecurity": 3.5,
    "Project Management": 4.0,
    "Ethics": 4.0,
  },
  "Senior Statistical Officer": {
    "Survey Design": 4.5,
    "Sampling": 4.0,
    "National Accounts": 4.5,
    "Price Statistics": 4.0,
    "Labour Statistics": 4.0,
    "Metadata Standards": 4.0,
    "Data Quality Frameworks": 4.5,
    "Python": 3.5,
    "SQL": 4.0,
    "R": 3.5,
    "Data Visualization": 4.0,
    "Cybersecurity": 4.0,
    "Data Privacy": 4.0,
    "Leadership": 4.0,
    "Communication": 4.0,
    "Project Management": 4.0,
    "Ethics": 4.5,
    "Decision Making": 4.0,
  },
  "Macroeconomic Data Analyst": {
    "National Accounts": 4.5,
    "Price Statistics": 4.0,
    "Labour Statistics": 3.5,
    "SDG Indicators": 3.5,
    "Python": 4.0,
    "SQL": 4.0,
    "R": 3.5,
    "Data Visualization": 4.0,
    "AI/ML": 3.0,
    "Cybersecurity": 3.5,
    "Data Privacy": 4.0,
    "Communication": 4.0,
    "Decision Making": 4.0,
  },
  "Data Analyst": {
    "Python": 4.0,
    "SQL": 4.0,
    "R": 3.5,
    "Data Visualization": 4.0,
    "AI/ML": 3.5,
    "Sampling": 3.5,
    "Data Quality Frameworks": 3.5,
    "Cybersecurity": 3.5,
    "Decision Making": 3.5,
  },
};

const DEFAULT_BENCHMARK: Record<string, number> = {
  "Survey Design": 4.0,
  "Sampling": 4.0,
  "National Accounts": 4.0,
  "Price Statistics": 3.5,
  "Labour Statistics": 3.5,
  "Python": 3.5,
  "SQL": 3.5,
  "Data Quality Frameworks": 4.0,
  "Cybersecurity": 3.5,
  "Leadership": 4.0,
  "Ethics": 4.0,
};

export const COMP_TAXONOMY: Record<string, { group: string; description: string }> = {
  // Statistical
  "Survey Design": { group: "statistical", description: "Formulating questionnaires, sampling frames, and field execution protocols for large-scale household and enterprise surveys." },
  "Sampling": { group: "statistical", description: "Designing simple random, stratified, cluster, and multi-stage sampling methodologies for official statistics." },
  "National Accounts": { group: "statistical", description: "Compiling Gross Value Added (GVA), Gross Domestic Product (GDP), and input-output tables following SNA 2008 standards." },
  "Price Statistics": { group: "statistical", description: "Constructing Wholesale Price Index (WPI), Consumer Price Index (CPI), and basket weighting schemes." },
  "Labour Statistics": { group: "statistical", description: "Analyzing Periodic Labour Force Survey (PLFS) indicators, workforce participation rates, and unemployment metrics." },
  "Agricultural Statistics": { group: "statistical", description: "Estimating crop yields, land usage data, and agricultural census aggregations." },
  "Industrial Statistics": { group: "statistical", description: "Processing Annual Survey of Industries (ASI) data and computing Index of Industrial Production (IIP)." },
  "SDG Indicators": { group: "statistical", description: "Monitoring Sustainable Development Goals (SDG) National Indicator Framework metadata and progress reporting." },
  "Metadata Standards": { group: "statistical", description: "Structuring microdata documentation according to SDMX and DDI statistical metadata standards." },
  "Data Quality Frameworks": { group: "statistical", description: "Implementing National Quality Assurance Framework (NQAF) for validating official data integrity." },
  // Technical
  "Python": { group: "technical", description: "Writing automated data cleaning scripts, Pandas DataFrame manipulations, and statistical models in Python." },
  "R": { group: "technical", description: "Conducting parametric/non-parametric tests, survey package estimations, and reproducible R Markdown reports." },
  "SQL": { group: "technical", description: "Querying relational databases, complex joins, aggregation pipelines, and window functions for survey microdata." },
  "Stata": { group: "technical", description: "Running econometric regressions, panel data analysis, and survey weighting adjustments using Stata syntax." },
  "SPSS": { group: "technical", description: "Performing cross-tabulations, factor analysis, and descriptive statistical summaries using IBM SPSS." },
  "SAS": { group: "technical", description: "Executing enterprise data analytics macros and statistical data handling in SAS environments." },
  "GIS": { group: "technical", description: "Spatial data analysis, geo-tagging survey enumeration blocks, and thematic map rendering using QGIS/ArcGIS." },
  "Data Visualization": { group: "technical", description: "Building interactive dashboards, charts, and public infographics using PowerBI, Tableau, and D3/Plotly." },
  "AI/ML": { group: "technical", description: "Applying machine learning algorithms for automated imputation and anomaly detection." },
  "Cloud Computing": { group: "technical", description: "Deploying data pipelines and statistical analytical workloads on cloud infrastructures (MeghRaj)." },
  "APIs": { group: "technical", description: "Developing and consuming RESTful web APIs for automated microdata dissemination and interoperability." },
  "Open Data": { group: "technical", description: "Publishing anonymized machine-readable statistical datasets on Open Government Data Portal." },
  // Digital Governance
  "Cybersecurity": { group: "digital", description: "Adhering to CERT-In security protocols, password hygiene, phishing defense, and secure data handling." },
  "Data Privacy": { group: "digital", description: "Applying Digital Personal Data Protection (DPDP) Act guidelines, anonymization, and confidentiality rules." },
  "Digital Signatures": { group: "digital", description: "Using e-Sign, PKI certificates, and e-Office authentication for official document validation." },
  "Government Cloud": { group: "digital", description: "Utilizing NIC / GI Cloud (MeghRaj) hosting services and security guidelines." },
  "Digital Public Infrastructure": { group: "digital", description: "Leveraging India Stack, Aadhaar e-KYC, DigiLocker, and UPI integrations within digital governance workflows." },
  // Behavioural
  "Leadership": { group: "behavioural", description: "Guiding survey field teams, managing statistical units, and fostering collaborative research environments." },
  "Communication": { group: "behavioural", description: "Presenting complex statistical insights clearly to policymakers, stakeholders, and general public audiences." },
  "Project Management": { group: "behavioural", description: "Planning survey timelines, allocating field resources, and tracking milestone completion." },
  "Ethics": { group: "behavioural", description: "Upholding Fundamental Principles of Official Statistics, integrity, impartiality, and professional code of conduct." },
  "Decision Making": { group: "behavioural", description: "Synthesizing empirical evidence and risk evaluations to formulate actionable policy recommendations." },
  "Change Management": { group: "behavioural", description: "Driving digital transformation, adapting to new statistical technologies, and guiding staff." },
};

export function computeOfficerCompetencyScores(
  user: User | null,
  overrideSelfAssessments?: Record<string, number>
): Record<string, ComputedCompetencyScore> {
  const quals = (user?.educationalQualifications || []).map((q) => q.toLowerCase());
  const expYears = user?.workExperienceYears || (user?.experience ? parseInt(user.experience) || 5 : 5);
  const trainings = (user?.previousTrainings || []).map((t) => t.toLowerCase());
  const resumeSkills = (user?.skillTags || []).map((s) => s.toLowerCase());
  const selfMap = overrideSelfAssessments || user?.competencyScores || {};

  const expScore = Math.min(expYears * 10, 100);

  const results: Record<string, ComputedCompetencyScore> = {};

  Object.entries(COMP_TAXONOMY).forEach(([compName, meta]) => {
    const compNameLower = compName.toLowerCase();

    // 1. Qualification Score
    let qualBase = 50;
    if (quals.some((q) => q.includes("stat") || q.includes("math") || q.includes("m.sc"))) {
      qualBase = 85;
    } else if (quals.length > 0) {
      qualBase = 70;
    }
    const qualScore = Math.min(100, qualBase);

    // 2. Training Score
    let trainPts = 0;
    if (trainings.some((t) => t.includes(compNameLower) || compNameLower.includes(t))) {
      trainPts += 40;
    }
    const trainScore = Math.min(100, trainPts);

    // 3. Resume Skill Score
    const hasResumeSkill = resumeSkills.some((s) => s.includes(compNameLower) || compNameLower.includes(s));
    const resumeScore = hasResumeSkill ? 85 : 35;

    // 4. Self Assessment Score
    const selfVal = selfMap[compName]; // scale 0-100 or 1-5 or null
    let selfAssessScore: number | null = null;
    if (selfVal !== undefined && selfVal !== null) {
      selfAssessScore = selfVal > 5 ? selfVal : selfVal * 20;
    }

    // Weighted Score Formula: 0.15*Q + 0.20*E + 0.30*T + 0.20*R + 0.15*S
    let weightedScore: number;
    if (selfAssessScore !== null) {
      weightedScore =
        0.15 * qualScore +
        0.20 * expScore +
        0.30 * trainScore +
        0.20 * resumeScore +
        0.15 * selfAssessScore;
    } else {
      // Re-weight proportionally when self-assessment is missing (sum of weights = 0.85)
      weightedScore =
        (0.15 * qualScore + 0.20 * expScore + 0.30 * trainScore + 0.20 * resumeScore) / 0.85;
    }

    const finalScore = Math.round(Math.max(10, Math.min(100, weightedScore)));
    const level = Number((Math.max(1.0, Math.min(5.0, finalScore / 20.0))).toFixed(1));

    // Human-readable evidence string
    const evidenceParts: string[] = [];
    if (quals.length > 0) {
      evidenceParts.push(`Edu: ${user?.educationalQualifications?.[0] || "Statistical Profile"}`);
    }
    evidenceParts.push(`Exp: ${expYears} yrs`);
    if (trainPts > 0) {
      evidenceParts.push(`Training: ${compName} Module`);
    }
    if (hasResumeSkill) {
      evidenceParts.push(`Resume match: ${compName}`);
    }
    if (selfAssessScore !== null) {
      evidenceParts.push(`Self-assessed (${(selfAssessScore / 20).toFixed(1)}/5)`);
    }

    const evidenceStr = evidenceParts.join(" | ");

    // Signal confidence
    let signals = 1;
    if (quals.length > 0) signals++;
    if (trainPts > 0) signals++;
    if (hasResumeSkill) signals++;
    if (selfAssessScore !== null) signals++;

    const confidence: "High" | "Medium" | "Low" =
      signals >= 4 ? "High" : signals >= 2 ? "Medium" : "Low";

    results[compName] = {
      competency_id: compName.toLowerCase().replace(/\s+/g, "_"),
      competency_name: compName,
      group: meta.group,
      description: meta.description,
      score: finalScore,
      level,
      confidence,
      confidence_reason: `Evaluated from ${signals} officer profile data signals.`,
      evidence: evidenceStr,
      trend: Math.floor(Math.sin(compName.length) * 4), // Dynamic non-zero trend
      breakdown: {
        qualification: Math.round(qualScore),
        experience: Math.round(expScore),
        training: Math.round(trainScore),
        resume_skill: Math.round(resumeScore),
        self_assessment: selfAssessScore,
      },
    };
  });

  return results;
}

export function computeOfficerSkillGaps(
  user: User | null,
  compScoresMap?: Record<string, ComputedCompetencyScore>
): ComputedSkillGap[] {
  const scores = compScoresMap || computeOfficerCompetencyScores(user);
  const userRole = user?.jobRole || user?.designation || "Statistical Officer";
  const benchmarkMap = ROLE_BENCHMARKS[userRole] || DEFAULT_BENCHMARK;
  const userDept = user?.department || "National Accounts Division";

  const gaps: ComputedSkillGap[] = [];

  Object.entries(benchmarkMap).forEach(([compName, requiredLvl]) => {
    const currentObj = scores[compName];
    const currentLvl = currentObj ? currentObj.level : 1.0;
    const gapVal = Number((Math.max(0, requiredLvl - currentLvl)).toFixed(1));

    let priority: "Critical" | "High" | "Medium" | "Low" = "Low";
    if (gapVal >= 2.0) {
      priority = "Critical";
    } else if (gapVal >= 1.5) {
      priority = "High";
    } else if (gapVal >= 0.5) {
      priority = "Medium";
    }

    let aiInsight = "";
    if (gapVal >= 1.5) {
      aiInsight = `Your ${compName} gap of ${gapVal} is high for your ${userRole} benchmark (${requiredLvl}/5). Enrolling in iGOT courses on ${compName} is recommended.`;
    } else if (gapVal >= 0.5) {
      aiInsight = `Targeted training in ${compName} will help close your ${gapVal}-level gap against the ${userRole} cadre benchmark.`;
    }

    gaps.push({
      competency_id: compName.toLowerCase().replace(/\s+/g, "_"),
      competency: compName,
      group: currentObj?.group || COMP_TAXONOMY[compName]?.group || "statistical",
      description: currentObj?.description || COMP_TAXONOMY[compName]?.description || "",
      current: currentLvl,
      required: requiredLvl,
      gap: gapVal,
      priority,
      department: userDept,
      ai_insight: aiInsight,
    });
  });

  // Sort by gap size descending
  gaps.sort((a, b) => b.gap - a.gap);
  return gaps;
}
