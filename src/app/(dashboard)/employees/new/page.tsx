import NewEmployeePage from "./page.client";
import { getDepartments } from "@/lib/services/data-service";

export default async function Page() {
  const departments = await getDepartments();
  return <NewEmployeePage departments={departments} />;
}
