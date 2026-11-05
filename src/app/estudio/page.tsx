import { notFound } from "next/navigation";
import { Planner } from "@/components/planner";
export default function Studio() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Planner />;
}
