import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, Base
from models import Competency, TrainingProgramme
from services.embeddings import generate_embedding

DEFAULT_TRAINING_CATALOG = [
    {
        "title": "Python for Statistical Analysis & Pandas Pipelines",
        "description": "Writing automated data cleaning scripts, Pandas DataFrame manipulations, and statistical models in Python for MoSPI survey microdata.",
        "provider": "iGOT Karmayogi",
        "duration_hours": 8,
        "is_emerging": True,
        "competencies": ["Python", "Data Quality Frameworks"]
    },
    {
        "title": "Advanced Survey Sampling & Weight Calibration",
        "description": "Designing simple random, stratified, cluster, and multi-stage sampling methodologies for official national surveys.",
        "provider": "NSSTA",
        "duration_hours": 12,
        "is_emerging": False,
        "competencies": ["Sampling", "Survey Design"]
    },
    {
        "title": "National Accounts Aggregations & SNA 2008 Standards",
        "description": "Compiling Gross Value Added (GVA), Gross Domestic Product (GDP), and input-output tables following SNA 2008 standards.",
        "provider": "NSSTA",
        "duration_hours": 10,
        "is_emerging": False,
        "competencies": ["National Accounts", "Price Statistics"]
    },
    {
        "title": "SQL for Relational Microdata Management",
        "description": "Querying relational databases, complex joins, aggregation pipelines, and window functions for survey microdata processing.",
        "provider": "iGOT Karmayogi",
        "duration_hours": 6,
        "is_emerging": False,
        "competencies": ["SQL", "Data Quality Frameworks"]
    },
    {
        "title": "Interactive Data Visualization & PowerBI Dashboards",
        "description": "Building interactive dashboards, charts, and public infographics using PowerBI, Tableau, and Plotly for statistical reporting.",
        "provider": "NSSTA",
        "duration_hours": 8,
        "is_emerging": True,
        "competencies": ["Data Visualization", "Communication"]
    },
    {
        "title": "AI/ML Imputation & Anomaly Detection in Official Data",
        "description": "Applying machine learning algorithms (Random Forests, Gradient Boosting) for automated imputation and anomaly detection.",
        "provider": "IIT Madras / iGOT",
        "duration_hours": 16,
        "is_emerging": True,
        "competencies": ["AI/ML", "Python"]
    },
    {
        "title": "GIS Spatial Analysis & Enumeration Block Tagging",
        "description": "Spatial data analysis, geo-tagging survey enumeration blocks, and thematic map rendering using QGIS and ArcGIS.",
        "provider": "IIRS Dehradun / NSSTA",
        "duration_hours": 14,
        "is_emerging": True,
        "competencies": ["GIS", "Survey Design"]
    },
    {
        "title": "Cybersecurity & DPDP Act Data Privacy Protocols",
        "description": "Adhering to CERT-In security protocols, Digital Personal Data Protection (DPDP) Act rules, anonymization, and secure microdata handling.",
        "provider": "CDAC / NSSTA",
        "duration_hours": 6,
        "is_emerging": True,
        "competencies": ["Cybersecurity", "Data Privacy"]
    },
    {
        "title": "Econometric Time Series Analysis & R Markdown",
        "description": "Conducting parametric/non-parametric tests, survey package estimations, and reproducible R Markdown reports.",
        "provider": "IASRI New Delhi",
        "duration_hours": 10,
        "is_emerging": False,
        "competencies": ["R", "Labour Statistics"]
    },
    {
        "title": "Official Statistics Ethics, Governance & Leadership",
        "description": "Upholding Fundamental Principles of Official Statistics, leadership in field teams, and evidence-based decision making.",
        "provider": "IIPA / NSSTA",
        "duration_hours": 5,
        "is_emerging": False,
        "competencies": ["Ethics", "Leadership", "Decision Making"]
    }
]

EMERGING_COMPETENCY_NAMES = [
    "AI/ML", "Cloud Computing", "GIS", "APIs", "Cybersecurity", "Data Privacy", "Data Visualization", "Python"
]

def backfill_embeddings():
    """
    Backfills vector embeddings for all Competencies and TrainingProgrammes.
    Flags emerging technologies for recommendation scoring.
    """
    db = SessionLocal()
    try:
        print("Starting embedding generation & catalog seeding...")

        # 1. Fetch all competencies
        competencies = db.query(Competency).all()
        comp_name_map = {c.name: c.id for c in competencies}

        for comp in competencies:
            text_to_embed = f"{comp.name} {comp.group_name} {comp.description}"
            comp.embedding = generate_embedding(text_to_embed)
            if comp.name in EMERGING_COMPETENCY_NAMES:
                comp.is_emerging = True
        
        db.commit()
        print(f"[OK] Embedded {len(competencies)} competencies.")

        # 2. Seed / Update TrainingProgrammes
        for item in DEFAULT_TRAINING_CATALOG:
            mapped_comp_ids = [comp_name_map[name] for name in item["competencies"] if name in comp_name_map]
            
            existing = db.query(TrainingProgramme).filter(TrainingProgramme.title == item["title"]).first()
            if not existing:
                prog = TrainingProgramme(
                    title=item["title"],
                    description=item["description"],
                    provider=item["provider"],
                    duration_hours=item["duration_hours"],
                    competency_ids=mapped_comp_ids,
                    is_emerging=item["is_emerging"]
                )
                db.add(prog)
                db.flush()
                existing = prog
            else:
                existing.description = item["description"]
                existing.provider = item["provider"]
                existing.duration_hours = item["duration_hours"]
                existing.competency_ids = mapped_comp_ids
                existing.is_emerging = item["is_emerging"]

            # Embed training programme
            embed_text = f"{existing.title} {existing.description or ''}"
            existing.embedding = generate_embedding(embed_text)

        db.commit()

        total_progs = db.query(TrainingProgramme).count()
        print(f"[OK] Embedded and updated {total_progs} Training Programmes.")
        print("Embedding backfill complete successfully.")

    except Exception as e:
        db.rollback()
        print("Error during embedding backfill:", e)
    finally:
        db.close()

if __name__ == "__main__":
    backfill_embeddings()
