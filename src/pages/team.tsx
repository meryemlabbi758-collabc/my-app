import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCurrentUserEmail, useTeamMembers } from "@/hooks/useDataverse"
import { createTeamMember, deleteTeamMember, updateTeamMember } from "@/services/dataverse"
import type { TeamMember } from "@/services/types"

const EDIT_ROLE = "delivery lead"
const AVATAR_COLORS = ["#FF7E51", "#2E9E6B", "#6B5BAE", "#0EA896", "#D14600", "#004AAC", "#E07000", "#12A5E5"]

type Draft = Omit<TeamMember, "id">

function emptyDraft(team: TeamMember["team"]): Draft {
  return {
    name: "",
    email: "",
    phone: "",
    role: "",
    group: "",
    team,
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  }
}

function initials(name: string) {
  const parts = name.split(/[\s-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase()
}

interface PanelProps {
  title: string
  headerColor: string
  members: TeamMember[]
  canEdit: boolean
  onAdd: () => void
  onEdit: (m: TeamMember) => void
  onDelete: (m: TeamMember) => void
}

function TeamPanel({ title, headerColor, members, canEdit, onAdd, onEdit, onDelete }: PanelProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between px-5 py-3.5 text-white" style={{ background: headerColor }}>
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
        {canEdit && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30"
          >
            <Plus className="size-3.5" /> Add
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 border-b bg-muted/40 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="w-10" />
        <span className="flex-1">Name</span>
        <span className="w-48 text-right">Role</span>
        {canEdit && <span className="w-14" />}
      </div>
      <ul>
        {members.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No members</li>}
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0 hover:bg-foreground/5">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
              style={{ background: m.color }}
            >
              {initials(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{m.name}</div>
              <div className="truncate text-xs text-muted-foreground">{m.email}</div>
              {m.phone && <div className="text-xs text-muted-foreground">{m.phone}</div>}
            </div>
            <div className="w-48 shrink-0 text-right">
              <div className="text-xs font-bold">{m.role}</div>
              <div className="truncate text-[11px] font-semibold text-info">{m.group}</div>
            </div>
            {canEdit && (
              <div className="flex w-14 shrink-0 justify-end gap-1 text-muted-foreground">
                <button aria-label={`Edit ${m.name}`} onClick={() => onEdit(m)} className="hover:text-foreground">
                  <Pencil className="size-4" />
                </button>
                <button aria-label={`Delete ${m.name}`} onClick={() => onDelete(m)} className="hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

const EXTRA_GROUPS: { team: TeamMember["team"]; title: string; color: string }[] = [
  { team: "developers", title: "Developers", color: "#0891B2" },
  { team: "build", title: "Build", color: "#8B5CF6" },
  { team: "observers", title: "Observers", color: "#64748B" },
]

const FIELDS = [
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["role", "Role"],
  ["group", "Notification group (e.g. @dxc-delivery-lead)"],
] as const

export default function TeamPage() {
  const { members, loading, error, reload } = useTeamMembers()
  const userEmail = useCurrentUserEmail()
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null)
  const [saving, setSaving] = useState(false)

  const canEdit =
    !!userEmail &&
    members.some((m) => m.email.toLowerCase() === userEmail && m.role.trim().toLowerCase() === EDIT_ROLE)

  const save = async () => {
    if (!editing) return
    const { id, draft } = editing
    if (!draft.name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    try {
      if (id) await updateTeamMember(id, draft)
      else await createTeamMember(draft)
      toast.success("Saved")
      setEditing(null)
      await reload()
    } catch (e) {
      toast.error(`Could not save: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (m: TeamMember) => {
    if (!window.confirm(`Remove ${m.name} from the team?`)) return
    try {
      await deleteTeamMember(m.id)
      toast.success(`${m.name} removed`)
      await reload()
    } catch (e) {
      toast.error(`Could not delete: ${(e as Error).message}`)
    }
  }

  const setField = (k: keyof Draft, v: string) =>
    setEditing((s) => (s ? { ...s, draft: { ...s.draft, [k]: v } } : s))

  const common = {
    canEdit,
    onDelete: remove,
    onEdit: (m: TeamMember) => setEditing({ id: m.id, draft: { ...m } }),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">DXC and customer contacts by role</p>
      </div>

      <div className="rounded-lg border bg-card px-5 py-3 text-sm shadow-sm">
        <span className="font-bold">All can view · Delivery Leads edit.</span>{" "}
        <span className="text-muted-foreground">
          Developers and Build can edit tickets; Observers are read-only. Multiple people can fill each role. Each person's notification group (right) wires them into Teams / Outlook
          alerts.
        </span>
      </div>

      {error && <p className="text-sm text-destructive">Could not load the team: {error.message}</p>}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <TeamPanel
            title="DXC Team"
            headerColor="#FF7E51"
            members={members.filter((m) => m.team === "dxc")}
            onAdd={() => setEditing({ draft: emptyDraft("dxc") })}
            {...common}
          />
          <TeamPanel
            title="Customer Team"
            headerColor="#004AAC"
            members={members.filter((m) => m.team === "customer")}
            onAdd={() => setEditing({ draft: emptyDraft("customer") })}
            {...common}
          />
          {EXTRA_GROUPS.map((g) => (
            <TeamPanel
              key={g.team}
              title={g.title}
              headerColor={g.color}
              members={members.filter((m) => m.team === g.team)}
              onAdd={() => setEditing({ draft: emptyDraft(g.team) })}
              {...common}
            />
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && !saving && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit member" : "Add member"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              {FIELDS.map(([k, label]) => (
                <div key={k} className="grid gap-1.5">
                  <Label htmlFor={`tm-${k}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                  </Label>
                  <Input id={`tm-${k}`} value={editing.draft[k]} onChange={(e) => setField(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
