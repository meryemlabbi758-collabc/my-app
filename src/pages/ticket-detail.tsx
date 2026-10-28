import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader } from "lucide-react"
import { AdditionalNotesCard, TicketDeliveryCard } from "@/components/ticket-delivery-card"
import { useCanEditTickets, useTicketDetail } from "@/hooks/useDataverse"
import { updateTicket } from "@/services/dataverse"
import type { TicketDetail } from "@/services/types"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children || "—"}</div>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ticket, loading } = useTicketDetail(id || null)
  const canEditTickets = useCanEditTickets()

  const [formData, setFormData] = useState<TicketDetail | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (ticket) setFormData(ticket)
  }, [ticket])

  const handleChange = (field: keyof TicketDetail, value: string) =>
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))

  const handleCancel = () => {
    setFormData(ticket)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!formData) return
    setSaving(true)
    try {
      await updateTicket(formData.id, formData)
      toast.success("Ticket updated")
      setIsEditing(false)
    } catch (e) {
      toast.error(`Could not save: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Chargement du ticket...</p>
      </div>
    )
  }

  if (!ticket || !formData) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Ticket non trouvé</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tickets")}
            className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors"
            aria-label="Back to tickets"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{formData.title}</h1>
            <p className="text-muted-foreground">{formData.id}</p>
          </div>
        </div>

        {canEditTickets && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Ticket</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Ticket</h3>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-3">
          <Field label="Assignee">
            {isEditing ? (
              <Input value={formData.assignee} onChange={(e) => handleChange("assignee", e.target.value)} />
            ) : (
              formData.assignee
            )}
          </Field>
          <Field label="Sprint">{formData.sprint}</Field>
          <Field label="Fix version">{formData.fixVersion}</Field>
          <Field label="Build ID">{formData.buildId}</Field>
          <Field label="Status">
            {isEditing ? (
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              formData.status
            )}
          </Field>
          <Field label="Priority">
            {isEditing ? (
              <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              formData.priority
            )}
          </Field>
          <Field label="Due Date">
            {isEditing ? (
              <Input type="date" value={formData.dueDate} onChange={(e) => handleChange("dueDate", e.target.value)} />
            ) : (
              formData.dueDate
            )}
          </Field>
          <div className="md:col-span-3">
            <Field label="Summary">{formData.summary}</Field>
          </div>
        </CardContent>
      </Card>

      <TicketDeliveryCard canEdit={canEditTickets} />

      <AdditionalNotesCard canEdit={canEditTickets} />

      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate("/tickets")}>
            Back to Tickets
          </Button>
        )}
      </div>
    </div>
  )
}
