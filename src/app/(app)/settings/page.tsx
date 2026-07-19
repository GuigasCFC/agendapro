import { getActiveMembership } from "@/lib/auth/dal"
import {
  getBusinessHours,
  getOrganizationSettings,
  getTeamOverview,
} from "@/features/settings/services"
import { OrganizationDetailsCard } from "@/features/settings/components/organization-details-card"
import { BusinessHoursCard } from "@/features/settings/components/business-hours-card"
import { AgendaSettingsCard } from "@/features/settings/components/agenda-settings-card"
import { AppearanceCard } from "@/features/settings/components/appearance-card"
import { PreferencesCard } from "@/features/settings/components/preferences-card"
import { TeamCard } from "@/features/settings/components/team-card"
import { SecurityCard } from "@/features/settings/components/security-card"

export default async function SettingsPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [organization, businessHours, members] = await Promise.all([
    getOrganizationSettings(organizationId),
    getBusinessHours(organizationId),
    getTeamOverview(organizationId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as preferências e informações da sua empresa.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OrganizationDetailsCard
          tradeName={organization.tradeName}
          contactEmail={organization.contactEmail}
          phone={organization.phone}
          whatsapp={organization.whatsapp}
          website={organization.website}
          addressLine={organization.addressLine}
          city={organization.city}
          state={organization.state}
          zipCode={organization.zipCode}
        />

        <BusinessHoursCard initialData={businessHours} />

        <AgendaSettingsCard
          appointmentSlotMinutes={organization.appointmentSlotMinutes}
        />

        <AppearanceCard />

        <PreferencesCard
          locale={organization.locale}
          currency={organization.currency}
          timezone={organization.timezone}
          dateFormat={organization.dateFormat}
          timeFormat={organization.timeFormat}
        />

        <TeamCard members={members} />

        <SecurityCard />
      </div>
    </div>
  )
}
