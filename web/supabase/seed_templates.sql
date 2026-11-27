-- Default email templates (idempotent)
insert into public.email_templates (key, name, subject, body)
select v.key, v.name, v.subject, v.body
from (
  values
    (
      'welcome',
      'Welcome after signup',
      'Pranam — welcome to {{templeName}}',
      E'Pranam {{name}},\n\nThank you for registering the {{familyName}} household with {{templeName}}.\n\nOur team will review your details shortly. You can sign in anytime to update family members, view invoices, and send requests.\n\nTemple: {{address}}\nPhone: {{phone}}\nEmail: {{email}}\n\nWith devotion,\n{{templeName}}'
    ),
    (
      'reviewed',
      'Household reviewed',
      'Your household is confirmed — {{templeName}}',
      E'Pranam {{name}},\n\nGood news — the {{familyName}} household has been reviewed and confirmed in our temple directory.\n\nSign in to your household portal for invoices, family details, and upcoming events.\n\n{{templeName}}\n{{phone}} · {{email}}'
    ),
    (
      'invoice',
      'Invoice reminder',
      'Invoice reminder — {{invoiceTitle}}',
      E'Pranam {{name}},\n\nThis is a friendly reminder about an open balance for the {{familyName}} household:\n\n{{invoiceTitle}}\nAmount: {{invoiceAmount}}\nDue: {{invoiceDue}}\n\nPlease sign in to your household portal to review details and arrange payment.\n\nThank you for your seva,\n{{templeName}}'
    ),
    (
      'general',
      'General notice',
      'Message from {{templeName}}',
      E'Pranam {{name}},\n\n{{message}}\n\nWith devotion,\n{{templeName}}\n{{phone}} · {{email}}'
    )
) as v(key, name, subject, body)
where not exists (
  select 1 from public.email_templates t where t.key = v.key
);
