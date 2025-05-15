import type { Metadata } from "next"
import BathroomScheduler from "@/components/bathroom-scheduler"

export const metadata: Metadata = {
  title: "Bathroom Scheduler",
  description: "Schedule bathroom time slots for your shared apartment",
}

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Bathroom Scheduler</h1>
      <BathroomScheduler />
    </div>
  )
}
