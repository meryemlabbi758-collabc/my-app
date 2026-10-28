import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Briefcase,
  Building2,
  Clock,
  FileCode,
  FolderOpen,
  Globe,
  Layers,
  MapPin,
  Monitor,
  Network,
  PhoneIncoming,
  Tag,
  Trash2,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTeamMembers } from "@/hooks/useDataverse"

interface AdminItem {
  title: string
  description: string
  icon: LucideIcon
  color: string
  pill?: string
  to?: string
}

const ITEMS: AdminItem[] = [
  { title: "Users & roles", description: "Assign Viewer, Delivery Lead, Portfolio DL & Admin", icon: Users, color: "#004AAC", to: "/team" },
  { title: "Solutions / Practice", description: "Manage Solution & Practice options and their Solution Versions", icon: Layers, color: "#FF7E51", pill: "11 entries" },
  { title: "Operating Models", description: "Manage available operating model options", icon: Monitor, color: "#2E9E6B", pill: "2 entries" },
  { title: "Regions", description: "Manage available region options", icon: Globe, color: "#004AAC", pill: "6 entries" },
  { title: "Countries", description: "Manage available country options", icon: MapPin, color: "#8B5CF6", pill: "17 entries" },
  { title: "Headquarters Locations", description: "Manage available headquarters location options", icon: Building2, color: "#EC4899", pill: "8 entries" },
  { title: "Roles", description: "Manage available contact role options", icon: Briefcase, color: "#0891B2", pill: "23 entries" },
  { title: "Initial Contact", description: "Manage escalation initial contact options", icon: PhoneIncoming, color: "#FF7E51", pill: "4 entries" },
  { title: "Incident Types", description: "Manage escalation incident type options", icon: Monitor, color: "#D14600", pill: "3 entries" },
  { title: "Escalation Time Windows", description: "Manage available escalation time window options", icon: Globe, color: "#0EA5E9", pill: "2 entries" },
  { title: "Business Hours", description: "Manage available business hour options", icon: Clock, color: "#0D9488", pill: "2 entries" },
  { title: "Categories", description: "Manage steering note category options", icon: Tag, color: "#8B5CF6", pill: "2 entries" },
  { title: "Repository Names", description: "Manage document repository / link names used on the Governance page", icon: FolderOpen, color: "#0EA5E9", pill: "4 entries" },
  { title: "Lines of Business", description: "Manage line of business options used in Solution Versions", icon: Network, color: "#F59E0B", pill: "7 entries" },
  { title: "Bulk Data Import", description: "Upload the Data Entry Template workbook to create records in bulk", icon: UploadCloud, color: "#2563EB", pill: "Excel import" },
  { title: "Welcome Page", description: "Upload the .html page shown from the info icon in the top nav", icon: FileCode, color: "#7C3AED", pill: "HTML page" },
  { title: "Delete Account", description: "Permanently delete an account and all related data", icon: Trash2, color: "#D14600", pill: "Danger zone" },
]

function AdminCard({ item, pill }: { item: AdminItem; pill?: string }) {
  const Icon = item.icon
  const manage = item.to ? (
    <Link to={item.to} className="text-xs font-bold text-info hover:underline">
      Manage ›
    </Link>
  ) : (
    <button
      onClick={() => toast.info(`${item.title} is not configured yet`)}
      className="text-xs font-bold text-info hover:underline"
    >
      Manage ›
    </button>
  )

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg text-white" style={{ background: item.color }}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold leading-tight">{item.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        {pill ? (
          <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: item.color }}>
            {pill}
          </span>
        ) : (
          <span />
        )}
        {manage}
      </div>
    </Card>
  )
}

export default function AdminPage() {
  const { members } = useTeamMembers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {ITEMS.map((item) => (
          <AdminCard
            key={item.title}
            item={item}
            pill={item.to === "/team" ? `${members.length} users` : item.pill}
          />
        ))}
      </div>
    </div>
  )
}
