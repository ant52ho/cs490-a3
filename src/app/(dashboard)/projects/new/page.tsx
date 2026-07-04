import NewProjectPage from "./page.client";
import { getSkills } from "@/lib/services/data-service";

export default async function Page() {
  const skills = await getSkills();
  return <NewProjectPage skills={skills} />;
}
