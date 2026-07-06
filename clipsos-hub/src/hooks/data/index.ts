/**
 * Barrel export — import all data hooks from a single path.
 *
 * Usage in components:
 *   import { useClients, useVideos, useCrmDeals } from "@/hooks/data";
 */

// Query key factory
export { queryKeys } from "../query-keys";

// Domain hooks
export {
  useClients,
  useClient,
  useClientBySlug,
  useCreateClient,
  useUpdateClient,
  useClientMembers,
  useClientJourney,
  useClientFoundation,
  useClientNotes,
  useCreateClientNote,
  useUpdateJourneyStep,
  useCreateJourneyStep,
  useDeleteJourneyStep,
  useSeedJourneyFromTemplate,
  useClientTeamAssignments,
  useAssignTeamMember,
  useUnassignTeamMember,
} from "../use-clients";

export {
  useProjects,
  useProjectsByClient,
  useProject,
  useCreateProject,
  useUpdateProject,
  useCycles,
  useCyclesByClient,
  useCreateCycle,
} from "../use-projects";

export {
  useVideos,
  useVideosByClient,
  useVideo,
  useCreateVideo,
  useUpdateVideo,
  useVideoVersions,
  useVideoComments,
  useCreateVideoComment,
  useVideoStatusHistory,
} from "../use-videos";

export { useStatuses, useDealStages, useVideoTypes, useProjectTypeTemplates } from "../use-lookups";

export {
  useCrmPeople,
  useCrmPeoplePaginated,
  useCrmPerson,
  useCrmPersonById,
  useCreateCrmPerson,
  useUpdateCrmPerson,
  useCrmCompanies,
  useCrmCompany,
  useCrmDeals,
  useCreateCrmDeal,
  useUpdateCrmDeal,
  useCrmDealOptions,
  useCrmEditors,
  usePersonDeals,
  usePersonCalendlyEvents,
  usePersonFollowUps,
  usePersonEmails,
  usePersonLeads,
  usePersonFormSubs,
  usePersonTasks,
  usePersonLinkedClient,
} from "../use-crm";

export {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useFollowUps,
  useCreateFollowUp,
  useCalendlyEvents,
} from "../use-leads";

export {
  useStripeCharges,
  useStripeSubscriptions,
  useFinanceTransactions,
  useClientFinance,
  useStripeRealtimeSync,
} from "../use-finance";

export {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useTasks,
  useMyTasks,
  useCreateTask,
  useUpdateTask,
  useActivityLog,
} from "../use-notifications";

export { useTeam, useInviteMember, useTenantPlanLimits } from "../use-team";

export {
  useCloserRegion,
  useUpsertCloserRegion,
  useSyncCalendlyEvents,
} from "../use-closer-region";

export {
  useForms,
  useForm,
  useFormBySlug,
  useCreateForm,
  useUpdateForm,
  useDeleteForm,
  useFormFields,
  useSaveFormFields,
  useFormSubmissions,
  useFormSubmission,
  usePublicForm,
  useSubmitPublicForm,
} from "../use-forms";

export {
  useOperatingCosts,
  useCreateOperatingCost,
  useUpdateOperatingCost,
  useDeleteOperatingCost,
} from "../use-operating-costs";

export {
  useCreatePaymentLink,
  useCreateSubscription,
  useCancelSubscription,
  useStripeProducts,
  useRecordPayment,
  useCreatePortalSession,
} from "../use-stripe-actions";

export {
  useEditorAssignments,
  useEditorVideos,
  useEditorUpdateVideoStatus,
  useEditorClientIds,
} from "../use-editor-videos";

export {
  useClientCycles,
  useStudioScripts,
  useCycleScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
  useStudioHooks,
  useCreateHook,
  useContentVault,
  useCreateVaultEntry,
  useClientBrain,
  useUpdateClientBrain,
  useUpdateFoundation,
} from "../use-studio";

export { useCommandCenter } from "../use-command-center";
