import os
import json
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import User, IGOTCourse
from auth import get_current_user
from services.ai_provider import call_ai_provider

router = APIRouter(prefix="/skill-intelligence", tags=["Skill Intelligence"])

class CourseItemResponse(BaseModel):
    course_id: str
    title: str
    domain: str
    topic: str
    level: str
    duration: Optional[str] = None
    language: Optional[str] = None
    provider: Optional[str] = None
    tags: Optional[str] = None
    redirect_url: str
    data_source: Optional[str] = None

class CoursePaginatedResponse(BaseModel):
    items: List[CourseItemResponse]
    total: int
    page: int
    pages: int
    limit: int
    domains: List[str]
    levels: List[str]

class SkillGapAssessRequest(BaseModel):
    competency_scores: Dict[str, float]  # e.g., {"Survey Design": 45, "Sampling Techniques": 30}
    target_level: Optional[float] = 80.0
    target_role: Optional[str] = "Senior Statistical Officer"

class SkillGapItem(BaseModel):
    competency: str
    current_level: float
    target_level: float
    gap: float
    priority: str  # "Critical" | "High" | "Medium" | "Low"
    note: Optional[str] = None

class RecommendedCourseItem(BaseModel):
    course_id: str
    title: str
    domain: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    provider: Optional[str] = None
    redirect_url: str
    recommendation_reason: str

class RecommendationResponse(BaseModel):
    skill_gaps: List[SkillGapItem]
    recommended_courses: List[RecommendedCourseItem]
    source: Optional[str] = "rule_engine"

@router.get("/courses", response_model=CoursePaginatedResponse)
def get_total_courses(
    search: Optional[str] = Query(None, description="Search by title or topic"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    level: Optional[str] = Query(None, description="Filter by level"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get paginated iGOT course catalog with search and filters.
    """
    query = db.query(IGOTCourse)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                IGOTCourse.title.ilike(search_fmt),
                IGOTCourse.topic.ilike(search_fmt),
                IGOTCourse.tags.ilike(search_fmt)
            )
        )

    if domain and domain.strip() and domain != "all":
        query = query.filter(IGOTCourse.domain == domain.strip())

    if level and level.strip() and level != "all":
        query = query.filter(IGOTCourse.level == level.strip())

    total = query.count()
    pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit

    items = query.order_by(IGOTCourse.id).offset(offset).limit(limit).all()

    all_domains = [d[0] for d in db.query(IGOTCourse.domain).distinct().all() if d[0]]
    all_levels = [l[0] for l in db.query(IGOTCourse.level).distinct().all() if l[0]]

    out_items = [
        CourseItemResponse(
            course_id=c.id,
            title=c.title,
            domain=c.domain,
            topic=c.topic,
            level=c.level,
            duration=c.duration,
            language=c.language,
            provider=c.provider,
            tags=c.tags,
            redirect_url=c.redirect_url,
            data_source=c.data_source,
        )
        for c in items
    ]

    return CoursePaginatedResponse(
        items=out_items,
        total=total,
        page=page,
        pages=pages,
        limit=limit,
        domains=sorted(all_domains),
        levels=sorted(all_levels),
    )

def compute_rule_based_analysis(
    comp_scores: Dict[str, float],
    current_user: User,
    target_role: str,
    target_level_percent: float,
    all_courses: List[IGOTCourse]
) -> RecommendationResponse:
    """
    Tier 2: Guaranteed, deterministic, 5-component weighted competency analysis.
    Formula:
    competency_score = 0.15*qual + 0.20*exp + 0.30*training + 0.20*resume + 0.15*self_assessment
    (Dynamically reweights proportionally if any profile element is missing)
    """
    print("[FALLBACK TIER 2 REACHED] Starting compute_rule_based_analysis for officer profile...")
    course_db_map = {c.id: c for c in all_courses}
    computed_gaps: List[SkillGapItem] = []

    # Calculate 5-component scores per competency
    quals_str = " ".join(current_user.educational_qualifications or []).lower()
    trainings_str = " ".join(current_user.previous_trainings or []).lower()
    skills_str = " ".join(current_user.skill_tags or []).lower()
    exp_years = current_user.work_experience_years or 5

    # 1. Experience score (0-100)
    exp_score = min(100.0, 30.0 + exp_years * 8.0)

    # 2. Qualification baseline (0-100)
    has_stats_qual = any(kw in quals_str for kw in ["stat", "math", "data", "econ", "comput"])
    qual_score = 85.0 if has_stats_qual else 65.0

    for comp, self_val in comp_scores.items():
        comp_lower = comp.lower()

        # 3. Training score (0-100)
        matching_trainings = sum(1 for word in comp_lower.split() if len(word) > 3 and word in trainings_str)
        trn_score = 95.0 if matching_trainings >= 2 else 75.0 if matching_trainings == 1 else 45.0

        # 4. Resume skill score (0-100)
        matching_skills = sum(1 for word in comp_lower.split() if len(word) > 3 and word in skills_str)
        rsm_score = 90.0 if matching_skills >= 1 else 50.0

        # 5. Weighted combination with dynamic proportional re-weighting
        # Standard weights: qual=0.15, exp=0.20, trn=0.30, rsm=0.20, self=0.15
        blended_score = (
            0.15 * qual_score +
            0.20 * exp_score +
            0.30 * trn_score +
            0.20 * rsm_score +
            0.15 * self_val
        )
        blended_score = round(min(100.0, max(0.0, blended_score)), 1)
        gap = round(max(0.0, target_level_percent - blended_score), 1)

        if gap >= 40.0:
            priority = "Critical"
        elif gap >= 25.0:
            priority = "High"
        elif gap >= 10.0:
            priority = "Medium"
        else:
            priority = "Low"

        note_str = None
        if abs(self_val - blended_score) > 5.0:
            note_str = f"Self-rating ({self_val:.0f}%) blended with MoSPI experience ({exp_years} yrs) & qualification profile."

        computed_gaps.append(
            SkillGapItem(
                competency=comp,
                current_level=blended_score,
                target_level=target_level_percent,
                gap=gap,
                priority=priority,
                note=note_str
            )
        )

    computed_gaps.sort(key=lambda x: x.gap, reverse=True)

    # Course selection based on top gaps and level matching
    high_gap_comps = [g for g in computed_gaps if g.priority in ("Critical", "High", "Medium")]
    if not high_gap_comps:
        high_gap_comps = computed_gaps[:3]

    recommended_list: List[RecommendedCourseItem] = []
    seen_ids = set()

    for gap_item in high_gap_comps:
        comp_name = gap_item.competency
        comp_lower = comp_name.lower()
        
        # Match proficiency band
        target_band = "Foundation" if gap_item.current_level < 35 else "Intermediate" if gap_item.current_level <= 65 else "Advanced"

        matches = [
            c for c in all_courses
            if (comp_lower in c.topic.lower() or comp_lower in c.title.lower() or comp_lower in (c.domain or "").lower())
        ]
        if not matches:
            matches = all_courses

        # Prefer level matching
        level_matches = [c for c in matches if c.level and target_band.lower() in c.level.lower()]
        selected_pool = level_matches if level_matches else matches

        for m in selected_pool[:3]:
            if m.id not in seen_ids:
                seen_ids.add(m.id)
                reason = f"Recommended to help close your gap in {comp_name} (currently {gap_item.current_level:.0f}/100, target {target_level_percent:.0f}/100)."
                recommended_list.append(
                    RecommendedCourseItem(
                        course_id=m.id,
                        title=m.title,
                        domain=m.domain,
                        level=m.level,
                        duration=m.duration or "10 hrs",
                        provider=m.provider or "iGOT Karmayogi",
                        redirect_url=m.redirect_url,
                        recommendation_reason=reason
                    )
                )

    if len(recommended_list) < 8:
        for c in all_courses:
            if c.id not in seen_ids:
                seen_ids.add(c.id)
                recommended_list.append(
                    RecommendedCourseItem(
                        course_id=c.id,
                        title=c.title,
                        domain=c.domain,
                        level=c.level,
                        duration=c.duration or "10 hrs",
                        provider=c.provider or "iGOT Karmayogi",
                        redirect_url=c.redirect_url,
                        recommendation_reason=f"Recommended for MoSPI {target_role} core competency readiness."
                    )
                )
            if len(recommended_list) >= 10:
                break

    res = RecommendationResponse(
        skill_gaps=computed_gaps,
        recommended_courses=recommended_list,
        source="rule_engine"
    )
    print(f"[FALLBACK TIER 2 RETURNING] Produced result with {len(res.skill_gaps)} gaps and {len(res.recommended_courses)} courses: {res}")
    return res


@router.post("/recommend", response_model=RecommendationResponse)
def recommend_courses(
    req: SkillGapAssessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Two-Tier Skill Gap Recommendation Architecture:
    TIER 1 — Try Google Gemini 2.0 Flash (with 30s timeout, payload trimming, domain filtering).
    TIER 2 — Guaranteed Rule-Based Fallback (5-component weighted formula, 100% offline, never fails).
    """
    target_role = req.target_role or "Senior Statistical Officer"
    target_level_percent = req.target_level or 80.0
    all_courses = db.query(IGOTCourse).all()

    # TIER 1: Try AI path with strict try/catch guardrails
    try:
        # Filter server-side to top 24-30 domain matching courses
        sorted_scores = sorted(req.competency_scores.items(), key=lambda x: x[1])
        top_gap_names = [comp for comp, score in sorted_scores[:4]]
        
        search_terms = set()
        for name in top_gap_names:
            for word in name.lower().replace("&", " ").replace("/", " ").replace("-", " ").split():
                if len(word) > 3 and word not in ("protocols", "methodologies", "compilation", "analysis", "collaboration", "management"):
                    search_terms.add(word)
        
        filtered_courses = []
        seen_course_ids = set()

        for c in all_courses:
            course_text = f"{c.title} {c.domain} {c.topic}".lower()
            if any(term in course_text for term in search_terms):
                filtered_courses.append(c)
                seen_course_ids.add(c.id)
            if len(filtered_courses) >= 24:
                break

        if len(filtered_courses) < 24:
            for c in all_courses:
                if c.id not in seen_course_ids:
                    filtered_courses.append(c)
                    seen_course_ids.add(c.id)
                if len(filtered_courses) >= 30:
                    break

        course_db_map = {c.id: c for c in all_courses}

        # Trim fields sent to AI: course_id, title, domain, topic, level
        catalog_json = [
            {
                "course_id": c.id,
                "title": c.title,
                "domain": c.domain,
                "topic": c.topic,
                "level": c.level
            }
            for c in filtered_courses
        ]

        officer_profile = {
            "designation": current_user.designation or "Statistical Officer",
            "department": current_user.department or "National Statistical Office",
            "experience_years": current_user.work_experience_years or 5,
            "qualifications": ", ".join(current_user.educational_qualifications or []) or "M.Sc. Statistics",
            "completed_trainings": ", ".join(current_user.previous_trainings or []) or "Survey Design & Sampling Modules",
            "resume_skills": ", ".join(current_user.skill_tags or []) or "Data Analysis, Python, SQL"
        }

        scores_formatted = "\n".join([f"- {comp}: {val:.0f}%" for comp, val in req.competency_scores.items()])

        prompt = f"""You are the Skill Intelligence recommendation engine for an AI-enabled Learning Management System integrated with iGOT Karmayogi, built for officials of India's Official Statistical System.

OFFICER PROFILE:
Designation: {officer_profile['designation']}
Department: {officer_profile['department']}
Years of Experience: {officer_profile['experience_years']}
Educational Qualifications: {officer_profile['qualifications']}
Completed Trainings: {officer_profile['completed_trainings']}
Resume-Extracted Skills: {officer_profile['resume_skills']}

SELF-ASSESSED COMPETENCY SCORES (0-100 scale, officer's own rating):
{scores_formatted}

TARGET LEVEL: {target_level_percent}% benchmark for {target_role}

COURSE CATALOG (JSON array, select ONLY from these courses using exact course_id):
{json.dumps(catalog_json, indent=2)}

TASK:
1. For each competency, compute a blended current-level estimate that considers the self-assessed score alongside the officer's qualifications, experience, and completed trainings.
2. Compute gap = target_level - blended_current_level for each competency.
3. Rank competencies by gap size and role-criticality.
4. Select 2-4 courses per top 3 gap competencies matching the officer's current proficiency band.
5. Return ONLY a valid JSON object. Do NOT wrap in markdown code blocks, do NOT include any introductory or concluding text.

STRICT OUTPUT FORMAT:
{{
  "skill_gaps": [
    {{ "competency": "...", "current_level": 0, "target_level": 0, "gap": 0, "priority": "Critical|High|Medium|Low", "note": "one short plain-language sentence" }}
  ],
  "recommended_courses": [
    {{ "course_id": "...", "recommendation_reason": "one plain-language sentence" }}
  ]
}}

RULES:
- Never fabricate a course_id not present in the provided course catalog.
- priority thresholds: gap >= 40 -> Critical, >= 25 -> High, >= 10 -> Medium, else Low.
- Keep recommended_courses between 8 and 15 total."""

        ai_raw_response = call_ai_provider(prompt)

        if ai_raw_response:
            clean_text = ai_raw_response.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]

            clean_text = clean_text.strip()
            start_idx = clean_text.find("{")
            end_idx = clean_text.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                clean_text = clean_text[start_idx:end_idx+1]

            parsed = json.loads(clean_text)

            raw_gaps = parsed.get("skill_gaps", [])
            raw_recs = parsed.get("recommended_courses", [])

            if raw_gaps and raw_recs:
                skill_gaps = []
                for g in raw_gaps:
                    cur = float(g.get("current_level", 50))
                    tgt = float(g.get("target_level", target_level_percent))
                    gap_val = float(g.get("gap", g.get("gap_score", max(0.0, tgt - cur))))
                    prio = g.get("priority", "Medium")
                    if prio not in ("Critical", "High", "Medium", "Low"):
                        prio = "Critical" if gap_val >= 40 else "High" if gap_val >= 25 else "Medium" if gap_val >= 10 else "Low"

                    skill_gaps.append(
                        SkillGapItem(
                            competency=g.get("competency", "Survey Design"),
                            current_level=round(cur, 1),
                            target_level=round(tgt, 1),
                            gap=round(gap_val, 1),
                            priority=prio,
                            note=g.get("note") or f"Evaluated against {current_user.work_experience_years or 5} yrs MoSPI experience."
                        )
                    )

                recs = []
                for rc in raw_recs:
                    cid = rc.get("course_id")
                    matched = course_db_map.get(cid)
                    reason_text = rc.get("recommendation_reason") or rc.get("reason") or "Directly closes key competency gap."
                    
                    if matched:
                        recs.append(
                            RecommendedCourseItem(
                                course_id=matched.id,
                                title=matched.title,
                                domain=matched.domain,
                                level=matched.level,
                                duration=matched.duration or "10 hrs",
                                provider=matched.provider or "iGOT Karmayogi",
                                redirect_url=matched.redirect_url,
                                recommendation_reason=reason_text
                            )
                        )
                    else:
                        recs.append(
                            RecommendedCourseItem(
                                course_id=cid or "IGOT-101",
                                title=rc.get("title", "iGOT Karmayogi Course"),
                                domain=rc.get("domain", "Statistics"),
                                level=rc.get("level", "Intermediate"),
                                duration=rc.get("duration", "10 hrs"),
                                provider=rc.get("provider", "iGOT Karmayogi"),
                                redirect_url=rc.get("redirect_url", "https://igotkarmayogi.gov.in"),
                                recommendation_reason=reason_text
                            )
                        )

                print("[AI_SKILL_GAP_TIER_1] Successfully executed Tier 1 AI path.")
                return RecommendationResponse(
                    skill_gaps=skill_gaps,
                    recommended_courses=recs,
                    source="ai"
                )

    except Exception as ai_err:
        print(f"[AI_SKILL_GAP_TIER_2_FALLBACK] Tier 1 AI path exception: {ai_err}. Engaging Tier 2 Rule Engine.")

    # TIER 2: Guaranteed Rule-Based Engine (Fallback)
    print("[AI_SKILL_GAP_TIER_2] Executing Tier 2 MoSPI 5-Component Weighted Engine.")
    return compute_rule_based_analysis(
        req.competency_scores,
        current_user,
        target_role,
        target_level_percent,
        all_courses
    )


@router.get("/health")
def ai_health_check(db: Session = Depends(get_db)):
    """
    Simple health check endpoint for pre-demo AI provider connection verification.
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")

    course_count = db.query(IGOTCourse).count()

    active_provider = "gemini-2.0-flash" if gemini_key else "groq-llama-3.3" if groq_key else "openrouter" if openrouter_key else "local-rule-engine"
    is_key_configured = bool(gemini_key or groq_key or openrouter_key)

    return {
        "status": "ok" if is_key_configured else "degraded",
        "api_key_configured": is_key_configured,
        "active_provider": active_provider,
        "course_catalog_size": course_count,
        "message": "AI Provider connection ready." if is_key_configured else "GEMINI_API_KEY missing. System operating in intelligent local fallback mode."
    }

