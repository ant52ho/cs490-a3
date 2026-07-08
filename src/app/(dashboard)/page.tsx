import Link from "next/link";
import { TeamCapacityChart } from "@/components/dashboard/team-capacity-chart";
import { MetricCard, UtilizationBar } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/form-elements";
import {
  getAdvancedAlerts,
  getDashboardMetrics,
  getEmployeeUtilizations,
  getProjectVariances,
  getSkillGaps,
} from "@/lib/services/data-service";
import { formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const [metrics, utilizations, gaps, variances, alerts] = await Promise.all([
    getDashboardMetrics(),
    getEmployeeUtilizations(),
    getSkillGaps(),
    getProjectVariances(),
    getAdvancedAlerts(),
  ]);

  const chartData = utilizations.slice(0, 8).map((u) => ({
    name: u.employeeName.split(" ")[0],
    available: Math.round(u.availableHours),
    allocated: Math.round(u.plannedHours),
  }));

  const atRiskProjects = variances
    .filter((v) => v.flagged)
    .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-500">
          Monitor team capacity, utilization, and skill gaps
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Employees" value={metrics.totalEmployees} />
        <MetricCard title="Active Projects" value={metrics.activeProjects} />
        <MetricCard
          title="Available Capacity"
          value={`${Math.round(metrics.availableCapacity)}h`}
          subtitle="This week"
        />
        <MetricCard
          title="Avg Utilization"
          value={formatPercent(metrics.averageUtilization)}
        />
        <MetricCard
          title="Overloaded"
          value={metrics.overloadedCount}
          subtitle="Above 100% capacity"
        />
        <MetricCard
          title="Underutilized"
          value={metrics.underutilizedCount}
          subtitle="Below 40% capacity"
        />
        <MetricCard title="Skill Gaps" value={metrics.skillGapCount} />
        <MetricCard
          title="Resource Shortages"
          value={metrics.upcomingShortages.length}
          subtitle="Next 12 weeks"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamCapacityChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {utilizations.map((u) => (
              <UtilizationBar
                key={u.employeeId}
                label={u.employeeName}
                utilizationPct={u.utilizationPct}
                status={u.status}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Demand</TableHead>
                  <TableHead>Supply</TableHead>
                  <TableHead>Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gaps.slice(0, 8).map((gap) => (
                  <TableRow key={gap.skillId}>
                    <TableCell className="font-medium">{gap.skillName}</TableCell>
                    <TableCell>{gap.demandCount}</TableCell>
                    <TableCell>{gap.supplyCount}</TableCell>
                    <TableCell>
                      {gap.gap > 0 ? (
                        <Badge variant="red">{gap.gap} short</Badge>
                      ) : (
                        <Badge variant="green">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most In-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium">{skill.name}</span>
                  <Badge variant="outline">{skill.count} projects</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {atRiskProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects at Risk (Variance)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Planned</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskProjects.map((p) => (
                  <TableRow key={p.projectId}>
                    <TableCell>
                      <Link
                        href={`/projects/${p.projectId}`}
                        className="font-medium hover:underline"
                      >
                        {p.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>{Math.round(p.plannedHours)}h</TableCell>
                    <TableCell>{Math.round(p.actualHours)}h</TableCell>
                    <TableCell>
                      <Badge variant={p.variancePct > 0 ? "red" : "yellow"}>
                        {p.variancePct > 0 ? "+" : ""}
                        {Math.round(p.variancePct)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(alerts.generated.length > 0 || alerts.stored.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.stored.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-neutral-600">{alert.message}</p>
              </div>
            ))}
            {alerts.generated.slice(0, 6).map((alert, i) => (
              <div
                key={`gen-${i}`}
                className="rounded-lg border border-neutral-200 p-3"
              >
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-neutral-500">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
