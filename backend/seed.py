import sys
import os

from database import engine, SessionLocal, Base
from models import User, Competency, CompetencyScore, RoleRequirement
from auth import get_password_hash

COMPETENCIES_SEED = [
    # Statistical (10)
    {
        "name": "Survey Design",
        "group": "statistical",
        "description": "Formulating questionnaires, sampling frames, and field execution protocols for large-scale household and enterprise surveys."
    },
    {
        "name": "Sampling",
        "group": "statistical",
        "description": "Designing simple random, stratified, cluster, and multi-stage sampling methodologies for official statistics."
    },
    {
        "name": "National Accounts",
        "group": "statistical",
        "description": "Compiling Gross Value Added (GVA), Gross Domestic Product (GDP), and input-output tables following SNA 2008 standards."
    },
    {
        "name": "Price Statistics",
        "group": "statistical",
        "description": "Constructing Wholesale Price Index (WPI), Consumer Price Index (CPI), and basket weighting schemes."
    },
    {
        "name": "Labour Statistics",
        "group": "statistical",
        "description": "Analyzing Periodic Labour Force Survey (PLFS) indicators, workforce participation rates, and unemployment metrics."
    },
    {
        "name": "Agricultural Statistics",
        "group": "statistical",
        "description": "Estimating crop yields, land usage data, and agricultural census aggregations."
    },
    {
        "name": "Industrial Statistics",
        "group": "statistical",
        "description": "Processing Annual Survey of Industries (ASI) data and computing Index of Industrial Production (IIP)."
    },
    {
        "name": "SDG Indicators",
        "group": "statistical",
        "description": "Monitoring Sustainable Development Goals (SDG) National Indicator Framework metadata and progress reporting."
    },
    {
        "name": "Metadata Standards",
        "group": "statistical",
        "description": "Structuring microdata documentation according to SDMX and DDI statistical metadata standards."
    },
    {
        "name": "Data Quality Frameworks",
        "group": "statistical",
        "description": "Implementing National Quality Assurance Framework (NQAF) for validating official data integrity."
    },

    # Technical (12)
    {
        "name": "Python",
        "group": "technical",
        "description": "Writing automated data cleaning scripts, Pandas DataFrame manipulations, and statistical models in Python."
    },
    {
        "name": "R",
        "group": "technical",
        "description": "Conducting parametric/non-parametric tests, survey package estimations, and reproducible R Markdown reports."
    },
    {
        "name": "SQL",
        "group": "technical",
        "description": "Querying relational databases, complex joins, aggregation pipelines, and window functions for survey microdata."
    },
    {
        "name": "Stata",
        "group": "technical",
        "description": "Running econometric regressions, panel data analysis, and survey weighting adjustments using Stata syntax."
    },
    {
        "name": "SPSS",
        "group": "technical",
        "description": "Performing cross-tabulations, factor analysis, and descriptive statistical summaries using IBM SPSS."
    },
    {
        "name": "SAS",
        "group": "technical",
        "description": "Executing enterprise data analytics macros and statistical data handling in SAS environments."
    },
    {
        "name": "GIS",
        "group": "technical",
        "description": "Spatial data analysis, geo-tagging survey enumeration blocks, and thematic map rendering using QGIS/ArcGIS."
    },
    {
        "name": "Data Visualization",
        "group": "technical",
        "description": "Building interactive dashboards, charts, and public infographics using PowerBI, Tableau, and D3/Plotly."
    },
    {
        "name": "AI/ML",
        "group": "technical",
        "description": "Applying machine learning algorithms (Random Forests, Gradient Boosting) for automated imputation and anomaly detection."
    },
    {
        "name": "Cloud Computing",
        "group": "technical",
        "description": "Deploying data pipelines and statistical analytical workloads on cloud infrastructures (MeghRaj / AWS)."
    },
    {
        "name": "APIs",
        "group": "technical",
        "description": "Developing and consuming RESTful web APIs for automated microdata dissemination and system interoperability."
    },
    {
        "name": "Open Data",
        "group": "technical",
        "description": "Publishing anonymized machine-readable statistical datasets on Open Government Data (OGD) Portal."
    },

    # Digital Governance (5)
    {
        "name": "Cybersecurity",
        "group": "digital",
        "description": "Adhering to CERT-In security protocols, password hygiene, phishing defense, and secure data handling."
    },
    {
        "name": "Data Privacy",
        "group": "digital",
        "description": "Applying Digital Personal Data Protection (DPDP) Act guidelines, anonymization, and confidentiality rules."
    },
    {
        "name": "Digital Signatures",
        "group": "digital",
        "description": "Using e-Sign, PKI certificates, and e-Office authentication for official document validation."
    },
    {
        "name": "Government Cloud",
        "group": "digital",
        "description": "Utilizing NIC / GI Cloud (MeghRaj) hosting services and security guidelines for official software applications."
    },
    {
        "name": "Digital Public Infrastructure",
        "group": "digital",
        "description": "Leveraging India Stack, Aadhaar e-KYC, DigiLocker, and UPI integrations within digital governance workflows."
    },

    # Behavioural (6)
    {
        "name": "Leadership",
        "group": "behavioural",
        "description": "Guiding survey field teams, managing statistical units, and fostering collaborative research environments."
    },
    {
        "name": "Communication",
        "group": "behavioural",
        "description": "Presenting complex statistical insights clearly to policymakers, stakeholders, and general public audiences."
    },
    {
        "name": "Project Management",
        "group": "behavioural",
        "description": "Planning survey timelines, allocating field resources, and tracking milestone completion within budget limits."
    },
    {
        "name": "Ethics",
        "group": "behavioural",
        "description": "Upholding Fundamental Principles of Official Statistics, integrity, impartiality, and professional code of conduct."
    },
    {
        "name": "Decision Making",
        "group": "behavioural",
        "description": "Synthesizing empirical evidence and risk evaluations to formulate actionable policy recommendations."
    },
    {
        "name": "Change Management",
        "group": "behavioural",
        "description": "Driving digital transformation, adapting to new statistical technologies, and guiding staff through transition."
    },
]

def seed_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        comp_map = {}
        for item in COMPETENCIES_SEED:
            existing = db.query(Competency).filter(Competency.name == item["name"]).first()
            if not existing:
                c = Competency(
                    name=item["name"],
                    group_name=item["group"],
                    description=item["description"]
                )
                db.add(c)
                db.flush()
                comp_map[item["name"]] = c.id
            else:
                comp_map[item["name"]] = existing.id

        db.commit()
        print(f"Successfully seeded {len(COMPETENCIES_SEED)} competencies.")

        ROLE_REQUIREMENTS_SEED = {
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
            "Statistical Officer": {
                "Survey Design": 4.0,
                "Sampling": 4.0,
                "Labour Statistics": 3.5,
                "Data Quality Frameworks": 4.0,
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
            }
        }

        # Clear existing role requirements to re-seed clean subsets
        db.query(RoleRequirement).delete()
        db.commit()

        for role_name, req_dict in ROLE_REQUIREMENTS_SEED.items():
            for c_name, req_lvl in req_dict.items():
                c_id = comp_map.get(c_name)
                if c_id:
                    db.add(RoleRequirement(
                        job_role=role_name,
                        competency_id=c_id,
                        required_level=req_lvl
                    ))
        db.commit()
        print("Successfully seeded role-specific competency requirements.")

        # Seed iGOT Course Catalog from CSV
        from models import IGOTCourse
        import csv

        csv_path = os.path.join(os.path.dirname(__file__), "data", "igot_sample_course_catalog.csv")
        if os.path.exists(csv_path):
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    cid = row.get("course_id", "").strip()
                    if not cid:
                        continue
                    existing = db.query(IGOTCourse).filter(IGOTCourse.id == cid).first()
                    if not existing:
                        course = IGOTCourse(
                            id=cid,
                            title=row.get("title", "").strip(),
                            domain=row.get("domain", "").strip(),
                            topic=row.get("topic", "").strip(),
                            level=row.get("level", "").strip(),
                            duration=row.get("duration", "").strip(),
                            language=row.get("language", "").strip(),
                            provider=row.get("provider", "").strip(),
                            tags=row.get("tags", "").strip(),
                            redirect_url=row.get("redirect_url", "").strip(),
                            data_source=row.get("data_source", "").strip(),
                        )
                        db.add(course)
                        count += 1
                db.commit()
                print(f"Successfully seeded {count} iGOT courses from CSV.")

        from seed_super_admin import seed_super_admin
        seed_super_admin()

    except Exception as e:
        db.rollback()
        print("Error seeding database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
