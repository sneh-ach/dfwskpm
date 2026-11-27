import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedContent } from '../data/seed'
import type {
  Announcement,
  ContactMessage,
  ContentState,
  ContentStatus,
  DonationRecord,
  EmailLog,
  EmailTemplate,
  EventItem,
  Household,
  Invoice,
  MemberRequest,
  NewsItem,
  PaymentTransaction,
  ResourceItem,
  ScheduleItem,
  SiteSettings,
  TeamMember,
} from '../types'
import { uid } from '../lib/utils'

const now = () => new Date().toISOString()

interface ContentActions {
  upsertEvent: (event: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void
  setEventStatus: (id: string, status: ContentStatus) => void
  deleteEvent: (id: string) => void
  upsertNews: (item: Omit<NewsItem, 'id' | 'updatedAt'> & { id?: string }) => void
  setNewsStatus: (id: string, status: ContentStatus) => void
  deleteNews: (id: string) => void
  upsertTeam: (member: Omit<TeamMember, 'id'> & { id?: string }) => void
  setTeamStatus: (id: string, status: ContentStatus) => void
  deleteTeam: (id: string) => void
  upsertResource: (item: Omit<ResourceItem, 'id'> & { id?: string }) => void
  setResourceStatus: (id: string, status: ContentStatus) => void
  deleteResource: (id: string) => void
  upsertSchedule: (item: Omit<ScheduleItem, 'id'> & { id?: string }) => void
  setScheduleStatus: (id: string, status: ContentStatus) => void
  deleteSchedule: (id: string) => void
  upsertHousehold: (hh: Omit<Household, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string
  deleteHousehold: (id: string) => void
  addDonation: (householdId: string, donation: Omit<DonationRecord, 'id'>) => void
  upsertInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'> & { id?: string; invoiceNumber?: string }) => string
  deleteInvoice: (id: string) => void
  markInvoicePaid: (
    invoiceId: string,
    method: PaymentTransaction['method'],
    reference?: string,
    note?: string,
  ) => void
  addTransaction: (txn: Omit<PaymentTransaction, 'id' | 'createdAt'>) => void
  upsertAnnouncement: (item: Omit<Announcement, 'id' | 'createdAt'> & { id?: string }) => void
  deleteAnnouncement: (id: string) => void
  updateSettings: (patch: Partial<SiteSettings>) => void
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => void
  markMessageRead: (id: string) => void
  addMemberRequest: (
    req: Omit<MemberRequest, 'id' | 'createdAt' | 'status' | 'resolvedAt'>,
  ) => void
  resolveMemberRequest: (id: string) => void
  markHouseholdReviewed: (id: string) => void
  addSubscriber: (email: string) => boolean
  upsertEmailTemplate: (tpl: Omit<EmailTemplate, 'updatedAt'> & { updatedAt?: string }) => void
  deleteEmailTemplate: (id: string) => void
  logEmail: (entry: Omit<EmailLog, 'id' | 'createdAt'> & { id?: string }) => string
  resetToSeed: () => void
}

export const useContentStore = create<ContentState & ContentActions>()(
  persist(
    (set, get) => ({
      ...seedContent,

      upsertEvent: (event) => {
        const id = event.id ?? uid('evt')
        const existing = get().events.find((e) => e.id === id)
        const next: EventItem = {
          ...event,
          id,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
        }
        set((s) => ({
          events: existing ? s.events.map((e) => (e.id === id ? next : e)) : [next, ...s.events],
        }))
      },
      setEventStatus: (id, status) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, status, updatedAt: now() } : e)),
        })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      upsertNews: (item) => {
        const id = item.id ?? uid('news')
        const next: NewsItem = { ...item, id, updatedAt: now() }
        set((s) => ({
          news: s.news.some((n) => n.id === id)
            ? s.news.map((n) => (n.id === id ? next : n))
            : [next, ...s.news],
        }))
      },
      setNewsStatus: (id, status) =>
        set((s) => ({
          news: s.news.map((n) => (n.id === id ? { ...n, status, updatedAt: now() } : n)),
        })),
      deleteNews: (id) => set((s) => ({ news: s.news.filter((n) => n.id !== id) })),

      upsertTeam: (member) => {
        const id = member.id ?? uid('team')
        const next: TeamMember = { ...member, id }
        set((s) => ({
          team: s.team.some((t) => t.id === id)
            ? s.team.map((t) => (t.id === id ? next : t))
            : [...s.team, next],
        }))
      },
      setTeamStatus: (id, status) =>
        set((s) => ({ team: s.team.map((t) => (t.id === id ? { ...t, status } : t)) })),
      deleteTeam: (id) => set((s) => ({ team: s.team.filter((t) => t.id !== id) })),

      upsertResource: (item) => {
        const id = item.id ?? uid('res')
        const next: ResourceItem = { ...item, id }
        set((s) => ({
          resources: s.resources.some((r) => r.id === id)
            ? s.resources.map((r) => (r.id === id ? next : r))
            : [next, ...s.resources],
        }))
      },
      setResourceStatus: (id, status) =>
        set((s) => ({
          resources: s.resources.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),

      upsertSchedule: (item) => {
        const id = item.id ?? uid('sch')
        const next: ScheduleItem = { ...item, id }
        set((s) => ({
          schedule: s.schedule.some((r) => r.id === id)
            ? s.schedule.map((r) => (r.id === id ? next : r))
            : [...s.schedule, next],
        }))
      },
      setScheduleStatus: (id, status) =>
        set((s) => ({
          schedule: s.schedule.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      deleteSchedule: (id) => set((s) => ({ schedule: s.schedule.filter((r) => r.id !== id) })),

      upsertHousehold: (hh) => {
        const id = hh.id ?? uid('hh')
        const existing = get().households.find((h) => h.id === id)
        const next: Household = {
          ...hh,
          id,
          source: hh.source ?? existing?.source ?? 'admin',
          needsReview: hh.needsReview ?? existing?.needsReview ?? false,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
        }
        set((s) => ({
          households: existing
            ? s.households.map((h) => (h.id === id ? next : h))
            : [next, ...s.households],
        }))
        return id
      },
      deleteHousehold: (id) => set((s) => ({ households: s.households.filter((h) => h.id !== id) })),
      addDonation: (householdId, donation) =>
        set((s) => ({
          households: s.households.map((h) =>
            h.id === householdId
              ? {
                  ...h,
                  updatedAt: now(),
                  donations: [{ ...donation, id: uid('don') }, ...h.donations],
                }
              : h,
          ),
        })),

      upsertInvoice: (invoice) => {
        const id = invoice.id ?? uid('inv')
        const existing = get().invoices.find((i) => i.id === id)
        const invoiceNumber =
          invoice.invoiceNumber ||
          existing?.invoiceNumber ||
          `INV-${new Date().getFullYear()}-${String(get().invoices.length + 1).padStart(3, '0')}`
        const next: Invoice = {
          ...invoice,
          id,
          invoiceNumber,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now(),
        }
        set((s) => ({
          invoices: existing
            ? s.invoices.map((i) => (i.id === id ? next : i))
            : [next, ...s.invoices],
        }))
        return id
      },
      deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      markInvoicePaid: (invoiceId, method, reference, note) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId)
        if (!invoice) return
        const paidAt = now()
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === invoiceId ? { ...i, status: 'paid', paidAt, updatedAt: paidAt } : i,
          ),
          transactions: [
            {
              id: uid('txn'),
              householdId: invoice.householdId,
              invoiceId,
              amount: invoice.amount,
              method,
              status: 'completed',
              reference,
              note: note || `Payment for ${invoice.invoiceNumber}`,
              createdAt: paidAt,
            },
            ...s.transactions,
          ],
          households: s.households.map((h) =>
            h.id === invoice.householdId
              ? {
                  ...h,
                  updatedAt: paidAt,
                  donations: [
                    {
                      id: uid('don'),
                      amount: invoice.amount,
                      date: paidAt,
                      method,
                      note: invoice.title,
                    },
                    ...h.donations,
                  ],
                }
              : h,
          ),
        }))
      },

      addTransaction: (txn) =>
        set((s) => ({
          transactions: [{ ...txn, id: uid('txn'), createdAt: now() }, ...s.transactions],
        })),

      upsertAnnouncement: (item) => {
        const id = item.id ?? uid('ann')
        const next: Announcement = {
          ...item,
          id,
          createdAt: get().announcements.find((a) => a.id === id)?.createdAt ?? now(),
        }
        set((s) => ({
          announcements: s.announcements.some((a) => a.id === id)
            ? s.announcements.map((a) => (a.id === id ? next : a))
            : [next, ...s.announcements],
        }))
      },
      deleteAnnouncement: (id) =>
        set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addContactMessage: (msg) =>
        set((s) => ({
          contactMessages: [
            { ...msg, id: uid('msg'), createdAt: now(), read: false },
            ...s.contactMessages,
          ],
        })),
      markMessageRead: (id) =>
        set((s) => ({
          contactMessages: s.contactMessages.map((m) => (m.id === id ? { ...m, read: true } : m)),
        })),

      addMemberRequest: (req) =>
        set((s) => ({
          memberRequests: [
            { ...req, id: uid('req'), status: 'open', createdAt: now() },
            ...(s.memberRequests || []),
          ],
        })),
      resolveMemberRequest: (id) =>
        set((s) => ({
          memberRequests: (s.memberRequests || []).map((r) =>
            r.id === id ? { ...r, status: 'resolved', resolvedAt: now() } : r,
          ),
        })),
      markHouseholdReviewed: (id) => {
        const hh = get().households.find((h) => h.id === id)
        set((s) => ({
          households: s.households.map((h) =>
            h.id === id
              ? {
                  ...h,
                  needsReview: false,
                  updatedAt: now(),
                  notes: h.notes?.includes('awaiting temple review')
                    ? h.notes.replace(' — awaiting temple review', ' — reviewed')
                    : h.notes,
                }
              : h,
          ),
        }))
        if (hh) {
          const settings = get().settings
          const tpl = get().emailTemplates.find((t) => t.key === 'reviewed')
          if (tpl) {
            const subject = tpl.subject
              .replace(/\{\{templeName\}\}/g, settings.templeName)
              .replace(/\{\{name\}\}/g, hh.primaryName)
            const body = tpl.body
              .replace(/\{\{templeName\}\}/g, settings.templeName)
              .replace(/\{\{name\}\}/g, hh.primaryName)
              .replace(/\{\{familyName\}\}/g, hh.familyName)
              .replace(/\{\{phone\}\}/g, settings.phone)
              .replace(/\{\{email\}\}/g, settings.emailFrom || settings.email)
            get().logEmail({
              to: hh.email,
              toName: hh.primaryName,
              householdId: hh.id,
              templateId: tpl.id,
              subject,
              body,
              status: 'draft',
              createdBy: 'system',
            })
          }
        }
      },

      addSubscriber: (email) => {
        const clean = email.trim().toLowerCase()
        if (!clean || get().subscribers.includes(clean)) return false
        set((s) => ({ subscribers: [...s.subscribers, clean] }))
        return true
      },

      upsertEmailTemplate: (tpl) => {
        const id = tpl.id || uid('tpl')
        const next: EmailTemplate = {
          ...tpl,
          id,
          updatedAt: now(),
        }
        set((s) => ({
          emailTemplates: s.emailTemplates.some((t) => t.id === id)
            ? s.emailTemplates.map((t) => (t.id === id ? next : t))
            : [...s.emailTemplates, next],
        }))
      },
      deleteEmailTemplate: (id) =>
        set((s) => ({ emailTemplates: s.emailTemplates.filter((t) => t.id !== id) })),

      logEmail: (entry) => {
        const id = entry.id ?? uid('mail')
        const next: EmailLog = {
          ...entry,
          id,
          createdAt: now(),
        }
        set((s) => ({ emailLogs: [next, ...(s.emailLogs || [])].slice(0, 200) }))
        return id
      },

      resetToSeed: () => set({ ...seedContent }),
    }),
    {
      name: 'dfwskpm-content-v7',
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<ContentState>
        return {
          ...current,
          ...p,
          households: p.households ?? current.households ?? [],
          invoices: p.invoices ?? current.invoices ?? [],
          transactions: p.transactions ?? current.transactions ?? [],
          memberRequests: p.memberRequests ?? current.memberRequests ?? [],
          emailTemplates: p.emailTemplates?.length
            ? p.emailTemplates
            : current.emailTemplates ?? seedContent.emailTemplates,
          emailLogs: p.emailLogs ?? current.emailLogs ?? [],
          announcements: p.announcements ?? current.announcements ?? [],
          settings: {
            ...current.settings,
            ...p.settings,
            emailFrom: p.settings?.emailFrom || current.settings.emailFrom || seedContent.settings.emailFrom,
            emailFromName:
              p.settings?.emailFromName ||
              current.settings.emailFromName ||
              seedContent.settings.emailFromName,
          },
        }
      },
    },
  ),
)
