/** admin = full control · editor = website content only · member = household portal */
export type Role = 'admin' | 'editor' | 'member'

export type ContentStatus = 'published' | 'draft' | 'hidden' | 'archived'

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'overdue' | 'cancelled'
export type InvoiceType = 'donation' | 'membership' | 'event' | 'expense' | 'other'
export type PaymentMethod = 'paypal' | 'card' | 'cash' | 'check' | 'other'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  phone?: string
  /** Color profile photo (data URL or path). */
  avatar?: string
  householdId?: string
  createdAt: string
}

export interface HouseholdMember {
  id: string
  name: string
  relation: string
  age?: number
  isPrimary?: boolean
  /** Optional color photo for this person. */
  photo?: string
}

export interface DonationRecord {
  id: string
  amount: number
  date: string
  method: string
  note?: string
}

export interface Household {
  id: string
  familyName: string
  primaryName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zip: string
  /** Primary contact / household photo shown in lookup & directory. */
  photo?: string
  members: HouseholdMember[]
  donations: DonationRecord[]
  notes?: string
  status: 'active' | 'inactive'
  /** How the household entered the directory. */
  source?: 'signup' | 'admin'
  /** New online signups stay in review until staff confirms. */
  needsReview?: boolean
  createdAt: string
  updatedAt: string
}

export type EmailTemplateKey = 'welcome' | 'reviewed' | 'invoice' | 'general' | 'custom'

/** Staff-editable message templates (Gmail / mailto ready). */
export interface EmailTemplate {
  id: string
  key: EmailTemplateKey
  name: string
  subject: string
  body: string
  updatedAt: string
}

export type EmailLogStatus = 'draft' | 'opened_mail' | 'copied' | 'logged'

/** Outbound email log — opens temple Gmail via mailto until SMTP/API is connected. */
export interface EmailLog {
  id: string
  to: string
  toName?: string
  householdId?: string
  templateId?: string
  subject: string
  body: string
  status: EmailLogStatus
  createdAt: string
  createdBy?: string
}

export type MemberRequestType = 'general' | 'billing' | 'seva' | 'update' | 'event'
export type MemberRequestStatus = 'open' | 'resolved'

/** Messages from the household portal → temple inbox. */
export interface MemberRequest {
  id: string
  householdId: string
  userId: string
  name: string
  email: string
  type: MemberRequestType
  subject: string
  message: string
  status: MemberRequestStatus
  createdAt: string
  resolvedAt?: string
}

export interface Invoice {
  id: string
  householdId: string
  invoiceNumber: string
  title: string
  description: string
  type: InvoiceType
  amount: number
  status: InvoiceStatus
  dueDate: string
  issuedAt: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentTransaction {
  id: string
  householdId: string
  invoiceId?: string
  amount: number
  method: PaymentMethod
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference?: string
  note?: string
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  tone: 'info' | 'warning' | 'event' | 'urgent'
  status: ContentStatus
  startsAt: string
  endsAt?: string
  showPopup: boolean
  showBanner: boolean
  /** Optional deep link for “More info” (internal path or https URL). */
  linkUrl?: string
  linkLabel?: string
  createdAt: string
}

export interface EventItem {
  id: string
  title: string
  description: string
  start: string
  end: string
  location: string
  host: string
  image: string
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  body: string
  author: string
  category: string
  image: string
  status: ContentStatus
  publishedAt: string
  updatedAt: string
}

export type TeamGroup = 'committee' | 'board' | 'mahila' | 'other'

export interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  order: number
  group: TeamGroup
  bio?: string
  status: ContentStatus
}

export interface ResourceItem {
  id: string
  title: string
  description: string
  type: 'pdf' | 'audio' | 'link'
  url: string
  category: string
  status: ContentStatus
}

export interface ScheduleItem {
  id: string
  day: string
  title: string
  time: string
  note?: string
  status: ContentStatus
}

export interface SiteSettings {
  templeName: string
  tagline: string
  address: string
  phone: string
  email: string
  facebook: string
  instagram: string
  youtube: string
  whatsapp: string
  donatePaypal: string
  donateGoal: number
  donateRaised: number
  heroImage: string
  aboutText: string[]
  openNowLabel: string
  openNowDetail: string
  showOpenNow: boolean
  contactBlurb: string
  /** Temple inbox used for mailto / future Gmail API (e.g. dfwskpsh@gmail.com). */
  emailFrom?: string
  emailFromName?: string
}

export interface ContentState {
  events: EventItem[]
  news: NewsItem[]
  team: TeamMember[]
  resources: ResourceItem[]
  schedule: ScheduleItem[]
  households: Household[]
  invoices: Invoice[]
  transactions: PaymentTransaction[]
  announcements: Announcement[]
  settings: SiteSettings
  contactMessages: ContactMessage[]
  memberRequests: MemberRequest[]
  subscribers: string[]
  emailTemplates: EmailTemplate[]
  emailLogs: EmailLog[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}
