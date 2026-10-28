import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClients, useCurrentVersions, useIsDeliveryLead, useVersionEntries, useVersionEnvironments } from "@/hooks/useDataverse"
import { createVersionEntry, deleteVersionEntry, updateVersionEntry } from "@/services/dataverse"
import type { VersionEntry } from "@/services/types"

const COMMENTS = "Comments"

const COLUMN_KIND = "column"

// Known environments keep the order and the header groups of the Excel planning;
// any other environment of a client comes after them.
const KNOWN_GROUPS = [
  { title: "DXC / IRP", envs: ["Param/Sisense"] },
  { title: "DXC", envs: ["DEV V.", "DEV HF", "LCT-1", "PERF", "HFPRD"] },
  { title: "IRP AUTO", envs: ["UAT-1", "PPRD", "Production"] },
]
const KNOWN_ENVS = KNOWN_GROUPS.flatMap((g) => g.envs)
const groupOf = (env: string) => KNOWN_GROUPS.find((g) => g.envs.includes(env))?.title ?? ""

// Cell styles follow the colours of the Excel planning
const KINDS: Record<string, { label: string; className: string }> = {
  version: { label: "Version (delivery)", className: "bg-[#FFC000] text-black font-bold" },
  phase: { label: "Sprint / Param / QA / TNR / UAT", className: "bg-[#DDEBF7] text-black" },
  infra: { label: "Infra", className: "bg-[#C55A11] text-white font-bold" },
  refresh: { label: "Refresh", className: "bg-[#C9A7E8] text-black font-bold" },
  drp: { label: "DRP", className: "bg-[#548235] text-white font-bold" },
  deadline: { label: "Deadline", className: "bg-[#0E2A5C] text-white font-bold" },
  note: { label: "Note", className: "italic" },
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const pad = (n: number) => String(n).padStart(2, "0")
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

interface CellRef {
  date: string
  env: string
}

interface Draft {
  id?: string
  label: string
  kind: string
}

export default function CalendarPage() {
  const { clients } = useClients()
  const canEdit = useIsDeliveryLead()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [client, setClient] = useState("")
  const [cell, setCell] = useState<CellRef | null>(null)
  const [draft, setDraft] = useState<Draft>({ label: "", kind: "version" })
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [newEnv, setNewEnv] = useState<string | null>(null)

  useEffect(() => {
    if (!client && clients.length > 0) {
      setClient((clients.find((c) => /irp/i.test(c.name)) ?? clients[0]).name)
    }
  }, [clients, client])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const from = iso(year, month, 1)
  const to = iso(year, month, daysInMonth)
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate())

  const { entries, loading, error, reload } = useVersionEntries(client || null, from, to)
  const currentVersions = useCurrentVersions(client || null, "version", today, refreshKey)
  const currentInfra = useCurrentVersions(client || null, "infra", today, refreshKey)

  const clientEnvs = useVersionEnvironments(client || null, refreshKey)
  const envs = useMemo(
    () => [
      ...KNOWN_ENVS.filter((e) => clientEnvs.includes(e)),
      ...clientEnvs.filter((e) => !KNOWN_ENVS.includes(e) && e !== COMMENTS).sort(),
    ],
    [clientEnvs]
  )
  const groups = useMemo(() => {
    const out: { title: string; span: number }[] = []
    for (const env of envs) {
      const title = groupOf(env)
      const last = out[out.length - 1]
      if (last && last.title === title) last.span += 1
      else out.push({ title, span: 1 })
    }
    return out
  }, [envs])

  const byCell = useMemo(() => {
    const map = new Map<string, VersionEntry[]>()
    for (const e of entries) {
      if (e.kind === COLUMN_KIND) continue
      const key = `${e.date}|${e.environment}`
      map.set(key, [...(map.get(key) ?? []), e])
    }
    return map
  }, [entries])

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const openCell = (date: string, env: string) => {
    setCell({ date, env })
    setDraft({ label: "", kind: env === COMMENTS ? "note" : "version" })
  }

  const afterChange = async () => {
    await reload()
    setRefreshKey((k) => k + 1)
  }

  const save = async () => {
    if (!cell || !draft.label.trim()) return
    setSaving(true)
    try {
      const value = { client, date: cell.date, environment: cell.env, label: draft.label.trim(), kind: draft.kind }
      if (draft.id) await updateVersionEntry(draft.id, value)
      else await createVersionEntry(value)
      setDraft({ label: "", kind: cell.env === COMMENTS ? "note" : draft.kind })
      await afterChange()
    } catch (e) {
      toast.error(`Could not save: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (entry: VersionEntry) => {
    if (!window.confirm(`Remove "${entry.label}"?`)) return
    try {
      await deleteVersionEntry(entry.id)
      if (draft.id === entry.id) setDraft({ label: "", kind: "version" })
      await afterChange()
    } catch (e) {
      toast.error(`Could not delete: ${(e as Error).message}`)
    }
  }

  const addEnvironment = async () => {
    const name = (newEnv ?? "").trim()
    if (!name || !client) return
    if (envs.includes(name)) {
      toast.error(`${name} already exists`)
      return
    }
    try {
      await createVersionEntry({ client, date: "2000-01-01", environment: name, label: name, kind: COLUMN_KIND })
      setNewEnv(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      toast.error(`Could not add: ${(e as Error).message}`)
    }
  }

  const cellEntries = cell ? byCell.get(`${cell.date}|${cell.env}`) ?? [] : []
  const headCell = "border px-2 py-1.5 text-center text-xs font-bold"
  const headRows = [
    { title: "Version GT", data: currentVersions },
    { title: "Version Infra & Indus", data: currentInfra },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Version calendar</h1>
          <p className="text-sm text-muted-foreground">
            GT versions installed per environment{canEdit ? " · click a cell to add or edit" : " · read-only"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={client} onValueChange={setClient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-40 text-center text-sm font-semibold capitalize">
              {MONTHS[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {canEdit && client && (
            <Button variant="outline" onClick={() => setNewEnv("")}>
              + Environment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setYear(now.getFullYear())
              setMonth(now.getMonth())
            }}
          >
            Today
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">Could not load the calendar: {error.message}</p>}

      <Card className="overflow-hidden py-0">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[1100px] border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0E1020] text-white">
                <th rowSpan={2} className={`${headCell} w-44 text-left`}>
                  Planning
                </th>
                {groups.map((g, i) => (
                  <th key={`${g.title}-${i}`} colSpan={g.span} className={headCell}>
                    {g.title}
                  </th>
                ))}
                <th rowSpan={2} className={`${headCell} w-64`}>
                  Other operations / Comments
                </th>
              </tr>
              <tr className="bg-[#0E1020] text-white">
                {envs.map((env) => (
                  <th key={env} className={headCell}>
                    {env}
                  </th>
                ))}
              </tr>
              {headRows.map((row) => (
                <tr key={row.title} className="bg-muted text-foreground">
                  <td className="border px-2 py-1 font-bold">{row.title}</td>
                  {envs.map((env) => (
                    <td key={env} className="border px-2 py-1 text-center font-bold">
                      {row.data[env]?.label ?? "-"}
                    </td>
                  ))}
                  <td className="border" />
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={envs.length + 2} className="py-10 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : (
                Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const date = iso(year, month, day)
                  const dow = new Date(year, month, day).getDay()
                  const weekend = dow === 0 || dow === 6
                  const isToday = date === today
                  return (
                    <tr key={date} className={weekend ? "bg-muted-foreground/25" : ""}>
                      <td
                        className={`border px-2 py-1.5 whitespace-nowrap ${
                          isToday ? "bg-red-600 font-bold italic text-white" : ""
                        }`}
                      >
                        {DAYS[dow]} {MONTHS[month]} {day}, {year}
                      </td>
                      {[...envs, COMMENTS].map((env) => {
                        const list = byCell.get(`${date}|${env}`) ?? []
                        return (
                          <td
                            key={env}
                            onClick={canEdit ? () => openCell(date, env) : undefined}
                            className={`border p-0 align-top ${canEdit ? "cursor-pointer hover:bg-primary/10" : ""}`}
                          >
                            {list.map((e) => (
                              <div
                                key={e.id}
                                className={`px-2 py-1 text-center ${env === COMMENTS ? "text-left" : ""} ${
                                  (KINDS[e.kind] ?? KINDS.note).className
                                }`}
                              >
                                {e.label}
                              </div>
                            ))}
                            {list.length === 0 && <div className="h-6" />}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={newEnv !== null} onOpenChange={(o) => !o && setNewEnv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New environment column · {client}</DialogTitle>
          </DialogHeader>
          <Input
            value={newEnv ?? ""}
            onChange={(e) => setNewEnv(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEnvironment()}
            placeholder="e.g. UAT-1, PPRD, Production"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewEnv(null)}>
              Cancel
            </Button>
            <Button onClick={addEnvironment} disabled={!(newEnv ?? "").trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cell} onOpenChange={(o) => !o && !saving && setCell(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cell?.env === COMMENTS ? "Comments" : cell?.env} · {cell?.date}
            </DialogTitle>
          </DialogHeader>

          {cellEntries.length > 0 && (
            <ul className="space-y-1.5">
              {cellEntries.map((e) => (
                <li key={e.id} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <span className="flex-1 truncate">{e.label}</span>
                  <span className="text-xs text-muted-foreground">{KINDS[e.kind]?.label ?? e.kind}</span>
                  <button
                    aria-label={`Edit ${e.label}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setDraft({ id: e.id, label: e.label, kind: e.kind })}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${e.label}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(e)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {draft.id ? "Edit entry" : "Add an entry"}
            </p>
            <Input
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder={cell?.env === COMMENTS ? "Comment" : "e.g. 22.1.33.2001, Sprint 22.1.34.1, Infra 26.2"}
              autoFocus
            />
            {cell?.env !== COMMENTS && (
              <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KINDS).map(([key, k]) => (
                    <SelectItem key={key} value={key}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            {draft.id && (
              <Button variant="outline" onClick={() => setDraft({ label: "", kind: "version" })} disabled={saving}>
                Cancel edit
              </Button>
            )}
            <Button onClick={save} disabled={saving || !draft.label.trim()}>
              {saving ? "Saving…" : draft.id ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
