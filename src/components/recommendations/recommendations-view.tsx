"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UtilizationBadge } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Badge,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/form-elements";
import type { EmployeeMatch } from "@/types";

export function RecommendationsView({
  projects,
  initialProjectId,
  initialMatches,
}: {
  projects: { id: string; name: string }[];
  initialProjectId: string;
  initialMatches: EmployeeMatch[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [excludeOverloaded, setExcludeOverloaded] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const projectId = searchParams.get("project") ?? initialProjectId;
  const matches = initialMatches;

  function handleProjectChange(id: string) {
    router.push(
      `/recommendations?project=${id}${excludeOverloaded ? "&excludeOverloaded=1" : ""}`
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employee Recommendations</h1>
        <p className="text-neutral-500">
          Match employees to projects based on skills, availability, and workload
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-64 space-y-1">
          <Label>Project</Label>
          <Select
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={excludeOverloaded}
            onChange={(e) => {
              setExcludeOverloaded(e.target.checked);
              router.push(
                `/recommendations?project=${projectId}${e.target.checked ? "&excludeOverloaded=1" : ""}`
              );
            }}
          />
          Exclude overloaded employees
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranked Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match, idx) => (
                <React.Fragment key={match.employeeId}>
                  <TableRow>
                    <TableCell>#{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {match.employeeName}
                    </TableCell>
                    <TableCell>{match.departmentName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          match.score >= 70
                            ? "green"
                            : match.score >= 50
                              ? "yellow"
                              : "outline"
                        }
                      >
                        {match.score}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UtilizationBadge
                        utilizationPct={match.utilizationPct}
                        status={match.status}
                        showPercent={false}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpanded(
                              expanded === match.employeeId
                                ? null
                                : match.employeeId
                            )
                          }
                        >
                          Details
                        </Button>
                        <Link href={`/projects/${projectId}`}>
                          <Button size="sm">Assign</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded === match.employeeId && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="grid grid-cols-3 gap-4 rounded-lg bg-neutral-50 p-4 text-sm">
                          <div>
                            <p className="font-medium">Skill Fit</p>
                            <p className="text-2xl">{match.breakdown.skillFit}%</p>
                          </div>
                          <div>
                            <p className="font-medium">Availability</p>
                            <p className="text-2xl">
                              {match.breakdown.availability}%
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Workload</p>
                            <p className="text-2xl">{match.breakdown.workload}%</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {matches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-500">
                    No matching employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
