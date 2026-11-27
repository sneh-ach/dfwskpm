import type { EmailTemplate, Household, SiteSettings } from '../types'

export type EmailVars = Record<string, string>

export function fillTemplate(text: string, vars: EmailVars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}

export function buildEmailVars(input: {
  settings: SiteSettings
  household?: Household | null
  name?: string
  message?: string
  invoiceTitle?: string
  invoiceAmount?: string
  invoiceDue?: string
}): EmailVars {
  const { settings, household } = input
  return {
    templeName: settings.templeName,
    address: settings.address,
    phone: settings.phone,
    email: settings.emailFrom || settings.email,
    name: input.name || household?.primaryName || 'Sundersath',
    familyName: household?.familyName || 'your',
    message: input.message || '',
    invoiceTitle: input.invoiceTitle || '',
    invoiceAmount: input.invoiceAmount || '',
    invoiceDue: input.invoiceDue || '',
  }
}

export function renderTemplate(
  template: Pick<EmailTemplate, 'subject' | 'body'>,
  vars: EmailVars,
) {
  return {
    subject: fillTemplate(template.subject, vars),
    body: fillTemplate(template.body, vars),
  }
}

/** Opens the device mail app (Gmail on many phones) with prefilled fields. */
export function openMailto(to: string, subject: string, body: string, fromHint?: string) {
  const params = new URLSearchParams()
  params.set('subject', subject)
  params.set('body', body)
  if (fromHint) {
    // Some clients ignore; still useful as a reminder in draft body header
  }
  const url = `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, '%20')}`
  window.open(url, '_blank')
}

export async function copyEmailDraft(to: string, subject: string, body: string) {
  const text = `To: ${to}\nSubject: ${subject}\n\n${body}`
  await navigator.clipboard.writeText(text)
}
