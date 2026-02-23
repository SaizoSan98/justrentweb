
import { LongTermCarForm } from "@/components/admin/LongTermCarForm"

export default function NewLongTermCarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Add Long Term Vehicle</h1>
        <p className="text-zinc-500">Create a new vehicle listing for long term rental.</p>
      </div>

      <LongTermCarForm />
    </div>
  )
}
