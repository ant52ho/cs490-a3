import { proficiencyRank } from "@/lib/utils";
import type { SkillGap } from "@/types";

type Requirement = {
  skillId: string;
  skillName: string;
  minProficiency: string;
  projectId: string;
};

type EmployeeSkill = {
  skillId: string;
  proficiency: string;
  employeeId: string;
};

export function analyzeSkillGaps(
  requirements: Requirement[],
  employeeSkills: EmployeeSkill[]
): SkillGap[] {
  const bySkill = new Map<
    string,
    { name: string; demand: number; minProficiency: string }
  >();

  for (const req of requirements) {
    const existing = bySkill.get(req.skillId);
    if (existing) {
      existing.demand += 1;
      if (
        proficiencyRank(req.minProficiency) >
        proficiencyRank(existing.minProficiency)
      ) {
        existing.minProficiency = req.minProficiency;
      }
    } else {
      bySkill.set(req.skillId, {
        name: req.skillName,
        demand: 1,
        minProficiency: req.minProficiency,
      });
    }
  }

  const gaps: SkillGap[] = [];

  for (const [skillId, info] of bySkill) {
    const qualified = employeeSkills.filter(
      (es) =>
        es.skillId === skillId &&
        proficiencyRank(es.proficiency) >= proficiencyRank(info.minProficiency)
    );

    const uniqueEmployees = new Set(qualified.map((q) => q.employeeId));
    const supplyCount = uniqueEmployees.size;
    const gap = Math.max(0, info.demand - supplyCount);

    gaps.push({
      skillId,
      skillName: info.name,
      demandCount: info.demand,
      supplyCount,
      gap,
      missing: supplyCount === 0,
    });
  }

  return gaps.sort((a, b) => b.gap - a.gap || b.demandCount - a.demandCount);
}

export function getTopInDemandSkills(
  requirements: Requirement[],
  limit = 5
): { name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const req of requirements) {
    const existing = counts.get(req.skillId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(req.skillId, { name: req.skillName, count: 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTrainingRecommendations(
  gaps: SkillGap[],
  employeeSkills: EmployeeSkill[],
  skillNames: Map<string, string>
): { skillName: string; message: string }[] {
  const recommendations: { skillName: string; message: string }[] = [];

  for (const gap of gaps.filter((g) => g.gap > 0)) {
    const nearQualified = employeeSkills.filter(
      (es) =>
        es.skillId === gap.skillId &&
        proficiencyRank(es.proficiency) >= 2
    );
    if (nearQualified.length > 0) {
      recommendations.push({
        skillName: gap.skillName,
        message: `${nearQualified.length} employee(s) could be upskilled to address demand for ${gap.skillName}`,
      });
    } else if (gap.missing) {
      recommendations.push({
        skillName: gap.skillName,
        message: `No qualified employees for ${gap.skillName} — consider hiring or training`,
      });
    }
  }

  return recommendations;
}
