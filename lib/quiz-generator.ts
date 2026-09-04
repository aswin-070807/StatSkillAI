export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0-indexed correct option
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  bloom: string;
}

export interface QuizAttempt {
  id: string;
  title: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  topicsCovered: string[];
  improvementsNeeded: { topic: string; recommendation: string }[];
}

export interface SensitiveDetectionResult {
  isSensitive: boolean;
  reason?: string;
  detectedTypes?: string[];
}

/**
 * Sanitizes raw text input or binary file content (such as .docx zip structures or XML markup)
 * removing control characters, binary headers, replacement symbols (\uFFFD), and extracting clean readable words.
 */
export function cleanMaterialText(
  rawText: string,
  defaultTitle: string = ""
): { sanitizedText: string; topicKeyword: string } {
  if (!rawText) {
    return { sanitizedText: "", topicKeyword: "Statistical Competency Framework" };
  }

  // 1. Remove binary control characters, replacement character (\uFFFD), and null bytes
  let cleaned = rawText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, " ")
    .replace(/PK\x03\x04[^\n]*/gi, " ") // Remove Zip file headers (.docx / .pptx)
    .replace(/\[Content_Types\]\.xml[^\n]*/gi, " ")
    .replace(/word\/(document|styles|settings|fontTable)\.xml[^\n]*/gi, " ")
    .replace(/<[^>]+>/g, " "); // Strip XML/HTML tags

  // 2. Extract valid human-readable English words (alphanumeric, min length 2)
  const validWords = cleaned
    .split(/\s+/)
    .map((w) => w.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
    .filter(
      (w) =>
        w.length >= 2 &&
        /^[a-zA-Z0-9-]+$/.test(w) &&
        !/^(pk|xml|rels|word|theme|docProps|schemas|openxmlformats|drawingml)$/i.test(w)
    );

  const sanitizedText = validWords.join(" ");

  // 3. Construct a clean, human-readable topic keyword
  let topicKeyword = defaultTitle
    .replace(/\.[^/.]+$/, "") // Strip file extension
    .replace(/[-_.]/g, " ")
    .trim();

  // If title contains binary artifacts or is generic, extract top clean words
  if (!topicKeyword || /^(pk|content|types|doc|file|custom)/i.test(topicKeyword)) {
    if (validWords.length >= 3) {
      topicKeyword = validWords.slice(0, 3).join(" ");
    } else {
      topicKeyword = "Statistical Competency Framework";
    }
  }

  // Clean title capitalization
  topicKeyword = topicKeyword
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return { sanitizedText, topicKeyword };
}

/**
 * Scans document text and filename for sensitive personal identification
 * such as Aadhaar card numbers, PAN card numbers, Passport IDs, or restricted keywords.
 */
export function detectSensitiveData(text: string, filename: string = ""): SensitiveDetectionResult {
  const combined = `${filename}\n${text}`.toLowerCase();
  const detectedTypes: string[] = [];

  // Aadhaar card 12-digit pattern (e.g. 1234 5678 9101 or 123456789101)
  const aadhaarRegex = /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/;
  // PAN card 10-character alphanumeric pattern (e.g. ABCDE1234F)
  const panRegex = /\b[a-z]{5}[0-9]{4}[a-z]\b/i;

  if (aadhaarRegex.test(text) || combined.includes("aadhaar") || combined.includes("uidai")) {
    detectedTypes.push("Aadhaar Card / UIDAI Identification Number");
  }

  if (panRegex.test(text) || combined.includes("pan card") || combined.includes("permanent account number")) {
    detectedTypes.push("PAN Card Number");
  }

  if (combined.includes("passport number") || combined.includes("voter id") || combined.includes("driving license")) {
    detectedTypes.push("Official Government Identity Document");
  }

  if (combined.includes("confidential salary") || combined.includes("bank account number") || combined.includes("credit card")) {
    detectedTypes.push("Confidential Financial Record");
  }

  if (detectedTypes.length > 0) {
    return {
      isSensitive: true,
      reason: `Sensitive / Personal information detected (${detectedTypes.join(", ")}). Uploading personal identity or confidential documents is strictly restricted for data privacy compliance.`,
      detectedTypes,
    };
  }

  return { isSensitive: false };
}

/**
 * Generates custom quiz questions tailored to the uploaded material content and selected difficulty level.
 */
export function generateQuizFromMaterial(
  materialText: string,
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  title: string = "Custom Material Assessment"
): { title: string; questions: QuizQuestion[] } {
  // Clean raw material text to remove binary artifacts, zip codes, and replacement characters (\uFFFD)
  const { topicKeyword } = cleanMaterialText(materialText, title);

  const cleanTitle = title
    ? title.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    : topicKeyword;

  if (difficulty === "Easy") {
    return {
      title: `${cleanTitle} (Easy / Foundational)`,
      questions: [
        {
          id: 1,
          question: `What is the primary objective described in the document regarding "${topicKeyword}"?`,
          options: [
            "To establish foundational standards and data quality benchmarks",
            "To remove all statistical data collection requirements",
            "To restrict public access to macroeconomic data",
            "To automate manual data entry without verification"
          ],
          answer: 0,
          explanation: `Foundational data quality and standard benchmarks form the primary objective of ${topicKeyword}.`,
          topic: "Foundational Standards",
          difficulty: "Easy",
          bloom: "Remember"
        },
        {
          id: 2,
          question: "Which data sampling approach provides an equal probability of selection for every unit in the population?",
          options: [
            "Simple Random Sampling",
            "Quota Non-probability Sampling",
            "Convenience Sampling",
            "Judgemental Sampling"
          ],
          answer: 0,
          explanation: "Simple Random Sampling ensures every sample unit has an equal and known non-zero probability of selection.",
          topic: "Sampling Fundamentals",
          difficulty: "Easy",
          bloom: "Understand"
        },
        {
          id: 3,
          question: "In national statistical systems, what does GDP stand for?",
          options: [
            "Gross Domestic Product",
            "General Data Platform",
            "Government Development Policy",
            "Global Data Performance"
          ],
          answer: 0,
          explanation: "Gross Domestic Product (GDP) represents the total monetary value of all final goods and services produced.",
          topic: "National Accounts Basics",
          difficulty: "Easy",
          bloom: "Remember"
        },
        {
          id: 4,
          question: "Which of the following is considered a quantitative statistical variable?",
          options: [
            "Monthly household consumer expenditure in Rupees",
            "Officer employment designation status",
            "Department administrative division code",
            "Geographic region name"
          ],
          answer: 0,
          explanation: "Monthly household expenditure is measurable on a numerical scale, making it quantitative.",
          topic: "Data Classification",
          difficulty: "Easy",
          bloom: "Understand"
        },
        {
          id: 5,
          question: "What is the recommended protocol when raw statistical survey data contains missing values?",
          options: [
            "Use systematic imputation or document non-response treatment",
            "Delete all survey questionnaires immediately",
            "Replace all missing values with arbitrary maximum numbers",
            "Ignore missing values without recording non-response rates"
          ],
          answer: 0,
          explanation: "Standard statistical protocol requires systematic imputation or formal non-response adjustment documentation.",
          topic: "Data Cleaning Protocols",
          difficulty: "Easy",
          bloom: "Understand"
        }
      ]
    };
  }

  if (difficulty === "Hard") {
    return {
      title: `${cleanTitle} (Advanced / Analytical)`,
      questions: [
        {
          id: 1,
          question: `In evaluating complex statistical models for "${topicKeyword}", how does multi-collinearity affect ordinary least squares (OLS) estimations?`,
          options: [
            "It inflates standard errors of regression coefficients making individual predictors statistically insignificant",
            "It completely eliminates residual variance and makes R-squared equal to zero",
            "It guarantees BLUE estimates with minimal variance error",
            "It transforms non-linear relationships directly into linear functions"
          ],
          answer: 0,
          explanation: "High multi-collinearity increases parameter estimate variance, resulting in unstable estimates and high standard errors.",
          topic: "Econometric Modeling & Regression",
          difficulty: "Hard",
          bloom: "Evaluate"
        },
        {
          id: 2,
          question: "When constructing Quarterly GDP estimates using the Production Approach (GVA), how are FISIM (Financial Intermediation Services Indirectly Measured) allocated across sectors?",
          options: [
            "Allocated using baseline intermediate consumption proportions and user interest rates across economic activities",
            "Deducted exclusively from nominal net export balances",
            "Added uniformly to agricultural gross value added without deflation",
            "Excluded entirely from National Accounts estimation frameworks"
          ],
          answer: 0,
          explanation: "FISIM is distributed among consuming sectors based on baseline intermediate consumption ratios and reference interest rates.",
          topic: "Quarterly GDP & GVA Estimation",
          difficulty: "Hard",
          bloom: "Analyze"
        },
        {
          id: 3,
          question: "In complex multi-stage stratified cluster sampling, what impact does a high Design Effect (DEFF) have on sample size requirements?",
          options: [
            "It requires increasing the total sample size to achieve the target precision compared to Simple Random Sampling",
            "It reduces the required sample size to one-half of SRS",
            "It removes variance estimation requirements during survey weight calibration",
            "It eliminates sampling error completely across sub-strata"
          ],
          answer: 0,
          explanation: "DEFF measures variance ratio under complex sampling vs SRS; DEFF > 1 means larger sample size is needed for target margin of error.",
          topic: "Complex Sample Design & DEFF",
          difficulty: "Hard",
          bloom: "Evaluate"
        },
        {
          id: 4,
          question: "Which time-series decomposition method is standard for adjusting seasonal fluctuations in monthly Index of Industrial Production (IIP) series?",
          options: [
            "X-13ARIMA-SEATS seasonal adjustment methodology",
            "Simple 3-period unweighted moving average filter",
            "Linear trend extrapolation without stochastic modeling",
            "Poisson regression modeling with fixed dispersion parameters"
          ],
          answer: 0,
          explanation: "X-13ARIMA-SEATS is the international standard algorithm recommended by official statistical agencies for seasonal adjustment.",
          topic: "Time Series & Seasonal Adjustment",
          difficulty: "Hard",
          bloom: "Analyze"
        },
        {
          id: 5,
          question: "Under the System of National Accounts (SNA 2008), how is Research and Development (R&D) expenditure treated in gross capital formation?",
          options: [
            "Capitalized as Intellectual Property Products (IPP) asset creation if it delivers future economic benefit",
            "Expensed entirely as intermediate consumption across all industries",
            "Recorded as financial transfer payments to non-residents",
            "Omitted from macro-economic aggregate measurements"
          ],
          answer: 0,
          explanation: "SNA 2008 reclassified R&D expenditure from intermediate consumption to capital formation under Intellectual Property Products.",
          topic: "SNA 2008 Accounting Standards",
          difficulty: "Hard",
          bloom: "Synthesize"
        }
      ]
    };
  }

  // Default: Medium Difficulty
  return {
    title: `${cleanTitle} (Intermediate)`,
    questions: [
      {
        id: 1,
        question: `According to the analysis of "${topicKeyword}", which factor is critical for ensuring survey data reliability across state directorates?`,
        options: [
          "Standardized field verification protocols and non-sampling error controls",
          "Eliminating secondary data cross-validations",
          "Relying solely on unweighted raw sample totals",
          "Discontinuing pre-survey enumerator training workshops"
        ],
        answer: 0,
        explanation: "Controlling non-sampling error and enforcing standardized field verification guarantees statistical reliability across regions.",
        topic: "Survey Methodology & Quality",
        difficulty: "Medium",
        bloom: "Apply"
      },
      {
        id: 2,
        question: "When applying Stratified Random Sampling, what criterion determines optimal allocation of sample sizes across strata?",
        options: [
          "Neyman allocation based on stratum population size and stratum variance",
          "Equal allocation regardless of stratum variance or population size",
          "Selecting 100% of units from the smallest stratum only",
          "Arbitrary division based on geographic convenience"
        ],
        answer: 0,
        explanation: "Neyman allocation minimizes overall variance for a fixed sample size by assigning larger samples to larger or more variable strata.",
        topic: "Sampling Allocation Techniques",
        difficulty: "Medium",
        bloom: "Apply"
      },
      {
        id: 3,
        question: "What is the primary utility of the Consumer Price Index (CPI) compiled by MoSPI?",
        options: [
          "Measuring retail inflation and deflating consumer expenditure aggregates",
          "Calculating industrial electricity tariff rates for commercial enterprises",
          "Estimating foreign direct investment inflow velocities",
          "Determining government debt ceiling limits"
        ],
        answer: 0,
        explanation: "CPI measures retail price changes experienced by consumer households and serves as a macroeconomic inflation indicator.",
        topic: "Price Indices & Inflation Measurement",
        difficulty: "Medium",
        bloom: "Understand"
      },
      {
        id: 4,
        question: "In Python for Data Analytics, which library is designed for structured DataFrame operations and tabular data manipulation?",
        options: [
          "Pandas",
          "Matplotlib",
          "Scikit-learn",
          "Flask"
        ],
        answer: 0,
        explanation: "Pandas provides high-performance, easy-to-use data structures (DataFrame, Series) for tabular data analysis.",
        topic: "Python Data Analytics",
        difficulty: "Medium",
        bloom: "Apply"
      },
      {
        id: 5,
        question: "How does the Base Year revision impact the Index of Industrial Production (IIP) calculation?",
        options: [
          "It updates item baskets and structural weighting diagrams to reflect current economic composition",
          "It permanently sets all statistical growth rates to 0%",
          "It eliminates the need for monthly survey data collection",
          "It forces mandatory replacement of hardware infrastructure"
        ],
        answer: 0,
        explanation: "Base year revisions update sector weighting weights and item baskets to represent changes in structural economic patterns.",
        topic: "Economic Statistics & Indices",
        difficulty: "Medium",
        bloom: "Understand"
      }
    ]
  };
}

/**
 * Quiz History Storage API using localStorage
 */
const QUIZ_HISTORY_KEY = "statskill_quiz_history";

export function getQuizHistory(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  try {
    const current = getQuizHistory();
    const updated = [attempt, ...current];
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save quiz attempt history:", err);
  }
}

export function clearQuizHistory(): void {
  localStorage.removeItem(QUIZ_HISTORY_KEY);
}
