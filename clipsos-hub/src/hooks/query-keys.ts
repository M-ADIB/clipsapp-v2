/**
 * Centralised query-key factory for TanStack Query.
 *
 * Every hook in the app references keys from here so that cache
 * invalidation is predictable and grep-able.
 *
 * Pattern:  queryKeys.<domain>.list(tenantId, filters?)
 *           queryKeys.<domain>.detail(tenantId, id)
 */

export const queryKeys = {
  // ── Auth & Profile ──────────────────────────────────────────
  auth: {
    session: () => ["auth", "session"] as const,
    profile: (userId: string) => ["auth", "profile", userId] as const,
  },

  // ── Team ────────────────────────────────────────────────────
  team: {
    all: (tenantId: string) => ["team", { tenantId }] as const,
  },

  // ── Mentions (@mention system) ─────────────────────────────
  mentions: {
    /** Global mention users — backed by team data */
    users: (tenantId: string) => ["mentions", "users", tenantId] as const,
  },

  // ── Tenants ─────────────────────────────────────────────────
  tenants: {
    detail: (tenantId: string) => ["tenants", tenantId] as const,
  },

  // ── Clients ─────────────────────────────────────────────────
  clients: {
    all: (tenantId: string) => ["clients", { tenantId }] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["clients", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, clientId: string) =>
      ["clients", "detail", tenantId, clientId] as const,
    members: (tenantId: string, clientId: string) =>
      ["clients", "members", tenantId, clientId] as const,
    foundation: (tenantId: string, clientId: string) =>
      ["clients", "foundation", tenantId, clientId] as const,
    journey: (tenantId: string, clientId: string) =>
      ["clients", "journey", tenantId, clientId] as const,
    onboarding: (tenantId: string, clientId: string) =>
      ["clients", "onboarding", tenantId, clientId] as const,
    bySlug: (tenantId: string, slug: string) => ["clients", "bySlug", tenantId, slug] as const,
    notes: (tenantId: string, clientId: string) =>
      ["clients", "notes", tenantId, clientId] as const,
  },

  // ── Projects ────────────────────────────────────────────────
  projects: {
    all: (tenantId: string) => ["projects", { tenantId }] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["projects", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, projectId: string) =>
      ["projects", "detail", tenantId, projectId] as const,
    byClient: (tenantId: string, clientId: string) =>
      ["projects", "byClient", tenantId, clientId] as const,
  },

  // ── Cycles ──────────────────────────────────────────────────
  cycles: {
    list: (tenantId: string, projectId: string) => ["cycles", "list", tenantId, projectId] as const,
    byClient: (tenantId: string, clientId: string) =>
      ["cycles", "byClient", tenantId, clientId] as const,
  },

  // ── Videos ──────────────────────────────────────────────────
  videos: {
    all: (tenantId: string) => ["videos", { tenantId }] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["videos", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, videoId: string) => ["videos", "detail", tenantId, videoId] as const,
    byClient: (tenantId: string, clientId: string) =>
      ["videos", "byClient", tenantId, clientId] as const,
    byProject: (tenantId: string, projectId: string) =>
      ["videos", "byProject", tenantId, projectId] as const,
    byCycle: (tenantId: string, cycleId: string) =>
      ["videos", "byCycle", tenantId, cycleId] as const,
    versions: (tenantId: string, videoId: string) =>
      ["videos", "versions", tenantId, videoId] as const,
    comments: (tenantId: string, videoId: string) =>
      ["videos", "comments", tenantId, videoId] as const,
    statusHistory: (tenantId: string, videoId: string) =>
      ["videos", "statusHistory", tenantId, videoId] as const,
  },

  // ── Lookups ─────────────────────────────────────────────────
  statuses: {
    list: (tenantId: string) => ["statuses", tenantId] as const,
  },
  dealStages: {
    list: (tenantId: string) => ["dealStages", tenantId] as const,
  },
  videoTypes: {
    list: (tenantId: string) => ["videoTypes", tenantId] as const,
  },
  projectTypeTemplates: {
    list: (tenantId: string) => ["projectTypeTemplates", tenantId] as const,
  },

  // ── CRM ─────────────────────────────────────────────────────
  crm: {
    people: {
      all: (tenantId: string) => ["crm", "people", { tenantId }] as const,
      list: (tenantId: string, filters?: Record<string, unknown>) =>
        ["crm", "people", "list", { tenantId, ...filters }] as const,
      detail: (tenantId: string, personId: string) =>
        ["crm", "people", "detail", tenantId, personId] as const,
      calendly: (tenantId: string, personId: string) =>
        ["crm", "people", "calendly", tenantId, personId] as const,
      followUps: (tenantId: string, personId: string) =>
        ["crm", "people", "followUps", tenantId, personId] as const,
      emails: (tenantId: string, personId: string) =>
        ["crm", "people", "emails", tenantId, personId] as const,
      leads: (tenantId: string, personId: string) =>
        ["crm", "people", "leads", tenantId, personId] as const,
      formSubs: (tenantId: string, personId: string) =>
        ["crm", "people", "formSubs", tenantId, personId] as const,
      tasks: (tenantId: string, personId: string) =>
        ["crm", "people", "tasks", tenantId, personId] as const,
      linkedClient: (tenantId: string, personId: string) =>
        ["crm", "people", "linkedClient", tenantId, personId] as const,
    },
    companies: {
      list: (tenantId: string) => ["crm", "companies", { tenantId }] as const,
      detail: (tenantId: string, companyId: string) =>
        ["crm", "companies", "detail", tenantId, companyId] as const,
    },
    deals: {
      all: (tenantId: string) => ["crm", "deals", { tenantId }] as const,
      list: (tenantId: string, filters?: Record<string, unknown>) =>
        ["crm", "deals", "list", { tenantId, ...filters }] as const,
      detail: (tenantId: string, dealId: string) =>
        ["crm", "deals", "detail", tenantId, dealId] as const,
    },
    editors: {
      list: (tenantId: string) => ["crm", "editors", { tenantId }] as const,
    },
    dealOptions: {
      list: (tenantId: string) => ["crm", "dealOptions", { tenantId }] as const,
    },
  },

  // ── Sales / Leads ───────────────────────────────────────────
  leads: {
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["leads", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, leadId: string) => ["leads", "detail", tenantId, leadId] as const,
  },
  followUps: {
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["followUps", "list", { tenantId, ...filters }] as const,
    byPerson: (tenantId: string, personId: string) =>
      ["followUps", "byPerson", tenantId, personId] as const,
  },
  calendlyEvents: {
    list: (tenantId: string) => ["calendlyEvents", { tenantId }] as const,
    byPerson: (tenantId: string, personId: string) =>
      ["calendlyEvents", "byPerson", tenantId, personId] as const,
  },

  // ── Communication ───────────────────────────────────────────
  chat: {
    rooms: (tenantId: string) => ["chat", "rooms", tenantId] as const,
    threads: (tenantId: string, roomId: string) => ["chat", "threads", tenantId, roomId] as const,
    messages: (tenantId: string, threadId: string) =>
      ["chat", "messages", tenantId, threadId] as const,
    mentionSuggestions: (tenantId: string, roomId: string) =>
      ["chat", "mentionSuggestions", tenantId, roomId] as const,
    unreadCounts: (tenantId: string) => ["chat", "unreadCounts", tenantId] as const,
    reactions: (tenantId: string, messageId: string) =>
      ["chat", "reactions", tenantId, messageId] as const,
    pinnedMessages: (tenantId: string, roomId: string) =>
      ["chat", "pinnedMessages", tenantId, roomId] as const,
    roomMembers: (tenantId: string, roomId: string) =>
      ["chat", "room-members", tenantId, roomId] as const,
  },
  notifications: {
    list: (tenantId: string, userId: string) => ["notifications", tenantId, userId] as const,
    unreadCount: (tenantId: string, userId: string) =>
      ["notifications", "unread", tenantId, userId] as const,
  },

  // ── Finance ─────────────────────────────────────────────────
  finance: {
    charges: (tenantId: string, filters?: Record<string, unknown>) =>
      ["finance", "charges", { tenantId, ...filters }] as const,
    subscriptions: (tenantId: string) => ["finance", "subscriptions", tenantId] as const,
    transactions: (tenantId: string, filters?: Record<string, unknown>) =>
      ["finance", "transactions", { tenantId, ...filters }] as const,
    byClient: (tenantId: string, clientId: string) =>
      ["finance", "byClient", tenantId, clientId] as const,
  },

  // ── Studio / Content ────────────────────────────────────────
  studio: {
    sessions: (tenantId: string, clientId: string) =>
      ["studio", "sessions", tenantId, clientId] as const,
    scripts: (tenantId: string, clientId: string) =>
      ["studio", "scripts", tenantId, clientId] as const,
    scriptsBySession: (tenantId: string, sessionId: string) =>
      ["studio", "scripts", "bySession", tenantId, sessionId] as const,
    ideas: (tenantId: string, clientId: string) => ["studio", "ideas", tenantId, clientId] as const,
    vault: (tenantId: string, clientId: string) => ["studio", "vault", tenantId, clientId] as const,
    hooks: (tenantId: string, clientId: string) => ["studio", "hooks", tenantId, clientId] as const,
    templates: (tenantId: string, clientId: string) =>
      ["studio", "templates", tenantId, clientId] as const,
    brain: (tenantId: string, clientId: string) => ["studio", "brain", tenantId, clientId] as const,
  },

  // ── Tasks ───────────────────────────────────────────────────
  tasks: {
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["tasks", "list", { tenantId, ...filters }] as const,
    byAssignee: (tenantId: string, userId: string) =>
      ["tasks", "byAssignee", tenantId, userId] as const,
  },

  // ── Activity Log ────────────────────────────────────────────
  activityLog: {
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["activityLog", "list", { tenantId, ...filters }] as const,
    byEntity: (tenantId: string, entityType: string, entityId: string) =>
      ["activityLog", "byEntity", tenantId, entityType, entityId] as const,
  },

  // ── Email Hub ───────────────────────────────────────────────
  emailTemplates: {
    list: (tenantId: string) => ["emailTemplates", "list", tenantId] as const,
    detail: (tenantId: string, id: string) => ["emailTemplates", "detail", tenantId, id] as const,
  },

  // ── Email Master Template ──────────────────────────────────
  masterTemplate: {
    detail: (tenantId: string) => ["masterTemplate", "detail", tenantId] as const,
  },

  // ── Forms / Form Builder ────────────────────────────────────
  forms: {
    all: (tenantId: string) => ["forms", { tenantId }] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["forms", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, formId: string) => ["forms", "detail", tenantId, formId] as const,
    fields: (tenantId: string, formId: string) => ["forms", "fields", tenantId, formId] as const,
    submissions: (tenantId: string, formId: string) =>
      ["forms", "submissions", tenantId, formId] as const,
    submissionDetail: (tenantId: string, submissionId: string) =>
      ["forms", "submission", tenantId, submissionId] as const,
    publicBySlug: (slug: string) => ["forms", "public", slug] as const,
  },

  // ── HQ Dashboard ────────────────────────────────────
  hq: {
    analytics: (tenantId: string) => ["hq", "analytics", tenantId] as const,
    editors: (tenantId: string, dateRange?: Record<string, unknown>) =>
      ["hq", "editors", { tenantId, ...dateRange }] as const,
  },

  // ── Team Member Profiles ────────────────────────────
  teamProfile: {
    detail: (tenantId: string, userId: string) => ["teamProfile", tenantId, userId] as const,
    editorStats: (tenantId: string, userId: string, dateRange?: Record<string, unknown>) =>
      ["teamProfile", "editorStats", { tenantId, userId, ...dateRange }] as const,
    closerStats: (tenantId: string, userId: string, dateRange?: Record<string, unknown>) =>
      ["teamProfile", "closerStats", { tenantId, userId, ...dateRange }] as const,
  },

  // ── Upload Sessions ─────────────────────────────────
  uploadSessions: {
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["uploadSessions", "list", { tenantId, ...filters }] as const,
    detail: (tenantId: string, sessionId: string) =>
      ["uploadSessions", "detail", tenantId, sessionId] as const,
  },

  // ── Visitor / Session Web Analytics ─────────────────────────────
  analytics: {
    stats: (tenantId: string, filters?: Record<string, unknown>) =>
      ["analytics", "stats", { tenantId, ...filters }] as const,
  },
} as const;
