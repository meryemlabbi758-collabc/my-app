import { useState } from "react"
import { FileText, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

const DELIVERY_TYPES = ["Code", "Param", "JSON", "AIA delivery", "VPMS", "PDM data owner"] as const

interface PublishedNote {
  text: string
  at: string
}

// UI only: values are kept in memory and are lost when the page is reloaded
export function TicketDeliveryCard({ canEdit }: { canEdit: boolean }) {
  const [workspace, setWorkspace] = useState("")
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [noteOpen, setNoteOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [notes, setNotes] = useState<PublishedNote[]>([])

  const publish = () => {
    const text = draft.trim()
    if (!text) return
    setNotes((prev) => [{ text, at: new Date().toLocaleString() }, ...prev])
    setDraft("")
    setNoteOpen(false)
    toast.success("Note published")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <h3 className="font-semibold">Delivery</h3>

        <Popover open={noteOpen} onOpenChange={setNoteOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={!canEdit}>
              <FileText className="mr-2 size-4" />
              Publication note
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your note…"
              className="min-h-28"
              autoFocus
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={publish} disabled={!draft.trim()}>
                <Send className="mr-2 size-4" />
                Publish
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="ticket-workspace" className="block text-sm font-semibold text-muted-foreground">
            Workspace (WS)
          </label>
          <Input
            id="ticket-workspace"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            placeholder="Enter the WS"
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Delivery content</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {DELIVERY_TYPES.map((name) => (
              <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={!!checked[name]}
                  onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [name]: v === true }))}
                  disabled={!canEdit}
                />
                {name}
              </label>
            ))}
          </div>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Published notes</p>
            <ul className="space-y-2">
              {notes.map((n, i) => (
                <li key={i} className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <p className="whitespace-pre-wrap">{n.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.at}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// UI only: notes are kept in memory and are lost when the page is reloaded
export function AdditionalNotesCard({ canEdit }: { canEdit: boolean }) {
  const [draft, setDraft] = useState("")
  const [notes, setNotes] = useState<PublishedNote[]>([])

  const add = () => {
    const text = draft.trim()
    if (!text) return
    setNotes((prev) => [...prev, { text, at: new Date().toLocaleString() }])
    setDraft("")
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Additional notes</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No additional notes yet.</p>}
        <ul className="space-y-2">
          {notes.map((n, i) => (
            <li key={i} className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <p className="whitespace-pre-wrap">{n.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.at}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note…"
            disabled={!canEdit}
            className="min-h-20"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={add} disabled={!canEdit || !draft.trim()}>
              Add note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
