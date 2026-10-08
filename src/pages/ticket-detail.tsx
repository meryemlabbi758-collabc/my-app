import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Cloud, Loader } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTicketDetail } from "@/hooks/useDataverse"
import type { TicketDetail } from "@/services/types"

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ticket: fetchedTicket, loading } = useTicketDetail(id || null)

  const defaultTicket: TicketDetail = {
    id: id || "TICKET-001",
    title: "Loading...",
    status: "open",
    priority: "medium",
    assignee: "Team",
    fixVersion: "v1.0",
    buildId: "BUILD-001",
    dueDate: "2024-09-20",
    clientId: "federal",
    environment: "prod",
  }

  const [formData, setFormData] = useState<TicketDetail>(defaultTicket)

  useEffect(() => {
    if (fetchedTicket) {
      setFormData(fetchedTicket)
    }
  }, [fetchedTicket])
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (field: keyof TicketDetail, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    // Here you would save to Dataverse
    console.log("Saving ticket:", formData)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-muted-foreground">Chargement du ticket...</p>
      </div>
    )
  }

  if (!fetchedTicket) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded transition-colors"
        >
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
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tickets")}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{formData.title}</h1>
            <p className="text-muted-foreground">{formData.id}</p>
          </div>
        </div>
        <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
          <Cloud className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assignee Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground">Assignee</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.assignee.charAt(0)}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      value={formData.assignee}
                      onChange={(e) => handleChange("assignee", e.target.value)}
                      placeholder="Enter assignee"
                    />
                  ) : (
                    <p className="font-medium">{formData.assignee}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Delivery Team</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground">Sprint</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                  ⚙️
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <Select value={formData.sprint} onValueChange={(value) => handleChange("sprint", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sprint-2024-01">sprint-2024-01</SelectItem>
                        <SelectItem value="sprint-2024-02">sprint-2024-02</SelectItem>
                        <SelectItem value="sprint-2024-03">sprint-2024-03</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{formData.sprint}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">sprint</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fix Version Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground">Fix version</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-300 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                  🔗
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <Select value={formData.fixVersion} onValueChange={(value) => handleChange("fixVersion", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1.0">v1.0</SelectItem>
                        <SelectItem value="v0.9">v0.9</SelectItem>
                        <SelectItem value="v0.8">v0.8</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{formData.fixVersion}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Fix version</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Build ID Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground">Build ID</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl">
                  🏢
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <Select value={formData.buildId} onValueChange={(value) => handleChange("buildId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="build-2024-001">build-2024-001</SelectItem>
                        <SelectItem value="build-2024-002">build-2024-002</SelectItem>
                        <SelectItem value="build-2024-003">build-2024-003</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{formData.buildId}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Build ID</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                📋
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-muted-foreground block mb-2">Summary</label>
                {isEditing ? (
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    className="w-full border rounded-lg p-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter summary"
                  />
                ) : (
                  <p className="text-muted-foreground">{formData.summary}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Additional Details</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Status</label>
              {isEditing ? (
                <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{formData.status}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Priority</label>
              {isEditing ? (
                <Select value={formData.priority} onValueChange={(value: any) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{formData.priority}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Due Date</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              ) : (
                <p className="text-sm">{formData.dueDate}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Created Date</label>
              <p className="text-sm text-muted-foreground">{formData.createdDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {!isEditing ? (
          <>
            <Button variant="outline" onClick={() => navigate("/tickets")}>
              Back to Tickets
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
              Edit Ticket
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
