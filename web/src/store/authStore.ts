import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedUsers } from '../data/seed'
import type { Household, HouseholdMember, Role, User } from '../types'
import { uid } from '../lib/utils'
import { useContentStore } from './contentStore'
import { isAdmin, isStaff } from '../lib/permissions'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { ensureSessionUser, fetchProfile, profileToUser } from '../lib/supabaseAuth'
import { hydrateHousehold } from '../lib/supabaseHouseholds'

type AuthResult = { ok: boolean; error?: string }

interface AuthState {
  users: User[]
  currentUser: Omit<User, 'password'> | null
  authReady: boolean
  initAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResult>
  signupHousehold: (data: {
    familyName: string
    primaryName: string
    email: string
    password: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    zip: string
    avatar?: string
    photo?: string
    members: Omit<HouseholdMember, 'id'>[]
  }) => Promise<AuthResult>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isStaff: () => boolean
  updateProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>) => void
  updateMyHousehold: (
    patch: Partial<
      Pick<
        Household,
        | 'familyName'
        | 'primaryName'
        | 'phone'
        | 'photo'
        | 'addressLine1'
        | 'addressLine2'
        | 'city'
        | 'state'
        | 'zip'
        | 'members'
      >
    >,
  ) => AuthResult
  upsertStaffUser: (data: {
    id?: string
    name: string
    email: string
    password?: string
    phone?: string
    role: 'admin' | 'editor'
  }) => AuthResult
  setUserRole: (userId: string, role: Role) => AuthResult
  deleteUser: (userId: string) => AuthResult
}

function publicUser(user: User): Omit<User, 'password'> {
  const { password: _pw, ...rest } = user
  return rest
}

function queueWelcomeEmail(email: string, primaryName: string, familyName: string, householdId: string) {
  const settings = useContentStore.getState().settings
  const welcome = useContentStore.getState().emailTemplates.find((t) => t.key === 'welcome')
  if (!welcome) return
  useContentStore.getState().logEmail({
    to: email,
    toName: primaryName,
    householdId,
    templateId: welcome.id,
    subject: welcome.subject
      .replace(/\{\{templeName\}\}/g, settings.templeName)
      .replace(/\{\{name\}\}/g, primaryName),
    body: welcome.body
      .replace(/\{\{templeName\}\}/g, settings.templeName)
      .replace(/\{\{name\}\}/g, primaryName)
      .replace(/\{\{familyName\}\}/g, familyName)
      .replace(/\{\{address\}\}/g, settings.address)
      .replace(/\{\{phone\}\}/g, settings.phone)
      .replace(/\{\{email\}\}/g, settings.emailFrom || settings.email),
    status: 'draft',
    createdBy: 'system',
  })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUser: null,
      authReady: !supabaseConfigured,

      initAuth: async () => {
        if (!supabase) {
          set({ authReady: true })
          return
        }
        const user = await ensureSessionUser()
        set({ currentUser: user, authReady: true })
        if (user?.householdId) void hydrateHousehold(user.householdId)
        supabase.auth.onAuthStateChange(async (event) => {
          if (event === 'SIGNED_OUT') {
            set({ currentUser: null })
            return
          }
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            const next = await ensureSessionUser()
            set({ currentUser: next })
            if (next?.householdId) void hydrateHousehold(next.householdId)
          }
        })
      },

      login: async (email, password) => {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) return { ok: false, error: error.message }
          const profile = data.user ? await fetchProfile(data.user.id) : null
          const user = profile
            ? profileToUser(profile)
            : data.user
              ? {
                  id: data.user.id,
                  name: data.user.user_metadata?.name || email.split('@')[0],
                  email,
                  role: (data.user.user_metadata?.role as Role) || 'member',
                  createdAt: data.user.created_at,
                }
              : null
          if (!user) return { ok: false, error: 'Could not load profile.' }
          set({ currentUser: user })
          if ('householdId' in user && user.householdId) {
            void hydrateHousehold(user.householdId)
          }
          return { ok: true }
        }

        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
        )
        if (!user) return { ok: false, error: 'Invalid email or password.' }
        set({ currentUser: publicUser(user) })
        return { ok: true }
      },

      signupHousehold: async ({
        familyName,
        primaryName,
        email,
        password,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        avatar,
        photo,
        members,
      }) => {
        if (password.length < 6) {
          return { ok: false, error: 'Password must be at least 6 characters.' }
        }
        if (!members.length) {
          return { ok: false, error: 'Add at least one household member.' }
        }

        const householdPhoto = photo || avatar

        if (supabase) {
          // Re-use session when an account exists but household was never linked
          let userId = (await supabase.auth.getSession()).data.session?.user?.id
          const sessionEmail = (await supabase.auth.getSession()).data.session?.user?.email

          if (!userId) {
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name: primaryName, role: 'member' },
              },
            })
            if (authError) {
              // Account may already exist from a partial signup — try signing in
              const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })
              if (signInError || !signedIn.user) {
                return { ok: false, error: authError.message }
              }
              userId = signedIn.user.id
            } else {
              userId = authData.user?.id
              if (!authData.session) {
                return {
                  ok: false,
                  error:
                    'Check your email to confirm the account, then sign in and finish household registration.',
                }
              }
            }
          } else if (sessionEmail && sessionEmail.toLowerCase() !== email.toLowerCase()) {
            return { ok: false, error: 'You are signed in as a different email. Sign out first.' }
          }

          if (!userId) {
            return { ok: false, error: 'Could not create account. Try signing in, then register again.' }
          }

          const { data: householdId, error: rpcError } = await supabase.rpc('register_household', {
            p_family_name: familyName,
            p_primary_name: primaryName,
            p_email: email,
            p_phone: phone,
            p_address_line1: addressLine1,
            p_address_line2: addressLine2 || '',
            p_city: city,
            p_state: state,
            p_zip: zip,
            p_photo_url: householdPhoto || '',
            p_avatar_url: avatar || householdPhoto || '',
            p_members: members.map((m, i) => ({
              name: m.name,
              relation: m.relation,
              age: m.age ?? null,
              isPrimary: Boolean(m.isPrimary) || i === 0,
              photo: m.photo || (i === 0 ? householdPhoto : null) || null,
            })),
          })

          if (rpcError || !householdId) {
            return { ok: false, error: rpcError?.message || 'Could not create household.' }
          }

          const hid = String(householdId)
          await hydrateHousehold(hid)
          queueWelcomeEmail(email, primaryName, familyName, hid)

          // Always send new households to sign-in
          await supabase.auth.signOut()
          set({ currentUser: null })
          return { ok: true }
        }

        if (get().users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'An account with this email already exists.' }
        }

        const householdId = useContentStore.getState().upsertHousehold({
          familyName,
          primaryName,
          email,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          zip,
          photo: householdPhoto,
          members: members.map((m, i) => ({
            ...m,
            id: uid('hm'),
            photo: m.photo || (i === 0 ? householdPhoto : undefined),
          })),
          donations: [],
          status: 'active',
          source: 'signup',
          needsReview: true,
          notes: 'Registered via household signup — awaiting temple review',
        })

        queueWelcomeEmail(email, primaryName, familyName, householdId)

        const user: User = {
          id: uid('user'),
          name: primaryName,
          email,
          password,
          phone,
          avatar: avatar || householdPhoto,
          role: 'member',
          householdId,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ users: [...s.users, user], currentUser: null }))
        return { ok: true }
      },

      logout: async () => {
        if (supabase) await supabase.auth.signOut()
        set({ currentUser: null })
      },

      isAdmin: () => isAdmin(get().currentUser?.role),
      isStaff: () => isStaff(get().currentUser?.role),

      updateProfile: (data) => {
        const current = get().currentUser
        if (!current) return
        set((s) => ({
          users: s.users.map((u) => (u.id === current.id ? { ...u, ...data } : u)),
          currentUser: { ...current, ...data },
        }))
        if (supabase) {
          void supabase
            .from('profiles')
            .update({
              name: data.name ?? current.name,
              phone: data.phone ?? current.phone ?? null,
              avatar_url: data.avatar ?? current.avatar ?? null,
            })
            .eq('id', current.id)
        }
        if (current.householdId && (data.phone || data.name || data.avatar)) {
          const hh = useContentStore.getState().households.find((h) => h.id === current.householdId)
          if (hh) {
            useContentStore.getState().upsertHousehold({
              ...hh,
              phone: data.phone ?? hh.phone,
              primaryName: data.name ?? hh.primaryName,
              photo: data.avatar ?? hh.photo,
              members: hh.members.map((m) =>
                m.isPrimary ? { ...m, name: data.name ?? m.name, photo: data.avatar ?? m.photo } : m,
              ),
            })
          }
        }
      },

      updateMyHousehold: (patch) => {
        const current = get().currentUser
        if (!current?.householdId) {
          return { ok: false, error: 'No household linked to this account.' }
        }
        const hh = useContentStore.getState().households.find((h) => h.id === current.householdId)
        if (!hh) return { ok: false, error: 'Household not found.' }
        useContentStore.getState().upsertHousehold({ ...hh, ...patch })
        if (supabase) {
          void supabase
            .from('households')
            .update({
              family_name: patch.familyName ?? hh.familyName,
              primary_name: patch.primaryName ?? hh.primaryName,
              phone: patch.phone ?? hh.phone,
              photo_url: patch.photo ?? hh.photo ?? null,
              address_line1: patch.addressLine1 ?? hh.addressLine1,
              address_line2: patch.addressLine2 ?? hh.addressLine2 ?? null,
              city: patch.city ?? hh.city,
              state: patch.state ?? hh.state,
              zip: patch.zip ?? hh.zip,
              updated_at: new Date().toISOString(),
            })
            .eq('id', current.householdId)
        }
        if (patch.phone || patch.primaryName) {
          set((s) => ({
            users: s.users.map((u) =>
              u.id === current.id
                ? {
                    ...u,
                    phone: patch.phone ?? u.phone,
                    name: patch.primaryName ?? u.name,
                  }
                : u,
            ),
            currentUser: {
              ...current,
              phone: patch.phone ?? current.phone,
              name: patch.primaryName ?? current.name,
            },
          }))
        }
        return { ok: true }
      },

      upsertStaffUser: ({ id, name, email, password, phone, role }) => {
        const actor = get().currentUser
        if (!isAdmin(actor?.role)) {
          return { ok: false, error: 'Only temple admins can manage staff access.' }
        }
        const existing = id ? get().users.find((u) => u.id === id) : undefined
        const emailTaken = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== existing?.id,
        )
        if (emailTaken) return { ok: false, error: 'That email is already in use.' }
        if (!existing && (!password || password.length < 6)) {
          return { ok: false, error: 'Password must be at least 6 characters.' }
        }

        const next: User = {
          id: existing?.id ?? uid('user'),
          name,
          email,
          password: password && password.length >= 6 ? password : existing?.password || '',
          phone,
          avatar: existing?.avatar,
          role,
          householdId: undefined,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        }
        if (!next.password) return { ok: false, error: 'Password required.' }

        set((s) => ({
          users: existing
            ? s.users.map((u) => (u.id === existing.id ? next : u))
            : [...s.users, next],
          currentUser: s.currentUser?.id === next.id ? publicUser(next) : s.currentUser,
        }))
        return { ok: true }
      },

      setUserRole: (userId, role) => {
        const actor = get().currentUser
        if (!isAdmin(actor?.role)) {
          return { ok: false, error: 'Only temple admins can change roles.' }
        }
        if (actor?.id === userId && role !== 'admin') {
          return { ok: false, error: 'You cannot remove your own admin access.' }
        }
        const staffRole = role === 'admin' || role === 'editor'
        if (supabase) {
          const patch: { role: Role; household_id?: null } = { role }
          if (staffRole) patch.household_id = null
          void supabase.from('profiles').update(patch).eq('id', userId)
        }
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  role,
                  householdId: staffRole ? undefined : u.householdId,
                }
              : u,
          ),
          currentUser:
            s.currentUser?.id === userId
              ? {
                  ...s.currentUser,
                  role,
                  householdId: staffRole ? undefined : s.currentUser.householdId,
                }
              : s.currentUser,
        }))
        return { ok: true }
      },

      deleteUser: (userId) => {
        const actor = get().currentUser
        if (!isAdmin(actor?.role)) {
          return { ok: false, error: 'Only temple admins can remove users.' }
        }
        if (actor?.id === userId) {
          return { ok: false, error: 'You cannot delete your own account.' }
        }
        set((s) => ({ users: s.users.filter((u) => u.id !== userId) }))
        return { ok: true }
      },
    }),
    {
      name: 'dfwskpm-auth-v6',
      partialize: (s) => ({
        // When Supabase is on, session lives in Supabase — don't persist local user
        users: s.users,
        currentUser: supabaseConfigured ? null : s.currentUser,
      }),
    },
  ),
)
