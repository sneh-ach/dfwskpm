import type { ContentState, User } from '../types'

/** Bootstrap temple admin — change password after first login / when Supabase is connected. */
export const BOOTSTRAP_ADMIN_EMAIL = 'dfwskpsh@gmail.com'
export const BOOTSTRAP_ADMIN_PASSWORD = 'TempleAdmin2026'

export const seedUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Temple Admin',
    email: BOOTSTRAP_ADMIN_EMAIL,
    password: BOOTSTRAP_ADMIN_PASSWORD,
    role: 'admin',
    phone: '+1 (817) 504-8784',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
]

const nextMonth = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(22)
  d.setHours(17, 0, 0, 0)
  return d
}

const eventStart = nextMonth()
const eventEnd = new Date(eventStart)
eventEnd.setHours(21, 0, 0, 0)

export const seedContent: ContentState = {
  settings: {
    templeName: 'DFW Shree Krishna Pranami Mandir',
    tagline: 'Living in God’s Amazing Grace',
    address: '748 Harrison Ln, Hurst, TX 76053',
    phone: '+1 (817) 504-8784',
    email: 'dfwskpsh@gmail.com',
    facebook: 'https://www.facebook.com/TexasPranami/',
    instagram: '',
    youtube: '',
    whatsapp: '',
    donatePaypal:
      'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3GFFUJ44BA46W&source=url',
    donateGoal: 95000,
    donateRaised: 50000,
    heroImage: '/img/shatsang.jpg',
    aboutText: [
      'Shri Krishna Pranami Sampraday of Texas, USA is promoting cultural, heritage and family values for all Pranami families from Nepal, India, Canada and throughout North America.',
      'This website keeps you informed of our current events, our history, and our religious practices. Welcome — we hope you enjoy our community site. Pranam.',
    ],
    openNowLabel: 'Open for satsang',
    openNowDetail: 'Saturday evenings · see schedule below',
    showOpenNow: true,
    contactBlurb: 'Questions about membership, events, or seva? Reach out anytime — we are happy to help.',
    emailFrom: 'dfwskpsh@gmail.com',
    emailFromName: 'DFW Shree Krishna Pranami Mandir',
  },
  events: [
    {
      id: 'evt_satsang',
      title: 'Monthly Satsang',
      description:
        'DFW Shri Krishna Pranami Hindu Samaj of Texas invites all sundersathji to our monthly satsang program in the satsang hall at Hurst, TX.',
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      location: '748 Harrison Ln, Hurst, TX 76053',
      host: 'Temple Committee',
      image: '/img/shatsang.jpg',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_holi',
      title: 'Holi Celebration',
      description:
        'Join us for colors, kirtan, and community feast as we celebrate Holi with devotion and joy.',
      start: new Date(new Date().getFullYear() + 1, 2, 14, 10, 0).toISOString(),
      end: new Date(new Date().getFullYear() + 1, 2, 14, 15, 0).toISOString(),
      location: '748 Harrison Ln, Hurst, TX 76053',
      host: 'Temple Committee',
      image: '/img/img_1119.png',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  news: [
    {
      id: 'news_1',
      title: 'Welcome to our community website',
      excerpt: 'Stay updated on satsang, festivals, scripture, and household membership from one place.',
      body: 'Pranam. This site shares temple events, news, Tartam Sagar scripture, and a private household portal for families. We look forward to serving the DFW Pranami community together.',
      author: 'Temple Committee',
      category: 'Announcement',
      image: '/img/1.png',
      status: 'published',
      publishedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    },
  ],
  team: [
    {
      id: 'team_nurnath',
      name: 'Nurnath Acharya',
      role: 'Spiritual Guide',
      image: '/img/nurnath.jpg',
      order: 1,
      group: 'committee',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_santa',
      name: 'Santa Bahadur Shrestha',
      role: 'President',
      image: '/img/Santa.jpg',
      order: 2,
      group: 'committee',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_suren',
      name: 'Suren Shrestha',
      role: 'Vice President',
      image: '/img/Suren.jpg',
      order: 3,
      group: 'committee',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_sujan',
      name: 'Sujan Khatiwada',
      role: 'Secretary',
      image: '/img/Sujan.jpg',
      order: 4,
      group: 'committee',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_milan',
      name: 'Milan Shrestha',
      role: 'Treasurer',
      image: '/img/milan.jpg',
      order: 5,
      group: 'board',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_janak',
      name: 'Janak Shrestha',
      role: 'Board Member',
      image: '/img/Janak.jpg',
      order: 6,
      group: 'board',
      bio: '',
      status: 'published',
    },
    {
      id: 'team_sharada',
      name: 'Sharada Shrestha',
      role: 'Baijuraj Mahila',
      image: '/img/Sharada.jpg',
      order: 7,
      group: 'mahila',
      bio: '',
      status: 'published',
    },
  ],
  resources: [
    {
      id: 'res_meher',
      title: 'Meher Sagar',
      description: 'Meher Sagar PDF hosted for families.',
      type: 'pdf',
      url: '/pdf/meherSagar.pdf',
      category: 'Scripture',
      status: 'published',
    },
  ],
  schedule: [
    {
      id: 'sch1',
      day: 'Saturday',
      title: 'Weekly Satsang',
      time: '6:00 PM – 9:00 PM',
      note: 'Kirtan, pravachan & prasad',
      status: 'published',
    },
    {
      id: 'sch2',
      day: 'Sunday',
      title: 'Morning Prayer',
      time: '9:00 AM – 10:30 AM',
      note: 'Open to all families',
      status: 'published',
    },
    {
      id: 'sch3',
      day: 'Daily',
      title: 'Mandir Open Hours',
      time: 'By announcement',
      note: 'Special festivals posted on calendar',
      status: 'published',
    },
  ],
  households: [],
  invoices: [],
  transactions: [],
  announcements: [],
  contactMessages: [],
  memberRequests: [],
  subscribers: [],
  emailTemplates: [
    {
      id: 'tpl_welcome',
      key: 'welcome',
      name: 'Welcome after signup',
      subject: 'Pranam — welcome to {{templeName}}',
      body: `Pranam {{name}},

Thank you for registering the {{familyName}} household with {{templeName}}.

Our team will review your details shortly. You can sign in anytime to update family members, view invoices, and send requests.

Temple: {{address}}
Phone: {{phone}}
Email: {{email}}

With devotion,
{{templeName}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl_reviewed',
      key: 'reviewed',
      name: 'Household reviewed',
      subject: 'Your household is confirmed — {{templeName}}',
      body: `Pranam {{name}},

Good news — the {{familyName}} household has been reviewed and confirmed in our temple directory.

Sign in to your household portal for invoices, family details, and upcoming events.

{{templeName}}
{{phone}} · {{email}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl_invoice',
      key: 'invoice',
      name: 'Invoice reminder',
      subject: 'Invoice reminder — {{invoiceTitle}}',
      body: `Pranam {{name}},

This is a friendly reminder about an open balance for the {{familyName}} household:

{{invoiceTitle}}
Amount: {{invoiceAmount}}
Due: {{invoiceDue}}

Please sign in to your household portal to review details and arrange payment.

Thank you for your seva,
{{templeName}}`,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl_general',
      key: 'general',
      name: 'General notice',
      subject: 'Message from {{templeName}}',
      body: `Pranam {{name}},

{{message}}

With devotion,
{{templeName}}
{{phone}} · {{email}}`,
      updatedAt: new Date().toISOString(),
    },
  ],
  emailLogs: [],
}
