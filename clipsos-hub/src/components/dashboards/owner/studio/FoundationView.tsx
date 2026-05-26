/**
 * FoundationView — Shows the step 1 onboarding questions.
 * Redesigned to be modular, category-tailored, and visually matching the Figma mockup.
 */
import { useState, useRef, useEffect } from "react";
import {
  useClientBrain,
  useUpdateClientBrain,
  useToggleFoundationReady,
  useStudioTemplates,
  useCreateStudioTemplate,
} from "@/hooks/use-studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  ClipboardPaste,
  Send,
  Loader2,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Upload,
  FileUp,
  Link as LinkIcon,
  Type,
  CheckCircle2,
  Eye,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWorkspaceHeader } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/db-types";

interface FoundationViewProps {
  clientId: string;
}

interface QuestionBlock {
  id: string;
  question: string;
  answer: string;
  section: string;
  placeholder?: string;
  required?: boolean;
}

interface FoundationData {
  category?: string;
  questions?: QuestionBlock[];
  name?: string;
  profession?: string;
  business?: string;
  target_audience?: string;
  problem_solved?: string;
  differentiator?: string;
  three_words?: string[];
  unique_angle?: string;
  achievements?: string[];
  topics?: string[];
  content_formats?: string[];
  cta?: string;
  platforms?: string[];
  success_90_days?: string;
  admired_creators?: string[];
  misconceptions?: string;
  signature_story?: string;
  [key: string]: unknown;
}

// Default Templates for Categories
const TEMPLATES: Record<string, { category: string; questions: QuestionBlock[] }> = {
  Doctor: {
    category: "Doctor",
    questions: [
      { id: "doc-name", question: "Full Name", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter full name...", required: true },
      { id: "doc-title", question: "Profession / Title", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter profession / title...", required: true },
      { id: "doc-specialty", question: "Clinic Name / Medical Specialty", answer: "", section: "CLINICAL & BUSINESS", placeholder: "Enter clinic name / specialty...", required: false },
      { id: "doc-audience", question: "Target Patient Profile", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe your target patient profile...", required: true },
      { id: "doc-diff", question: "Practice Unique Differentiator", answer: "", section: "BRAND & STRATEGY", placeholder: "What makes your medical practice unique?", required: false },
      { id: "doc-topics", question: "Key Educational Health Topics", answer: "", section: "CONTENT & MARKETING", placeholder: "List topics you want to educate patients on...", required: false },
      { id: "doc-cta", question: "Primary Call to Action (CTA)", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter main call to action...", required: true }
    ]
  },
  Clinic: {
    category: "Clinic",
    questions: [
      { id: "clinic-name", question: "Clinic Name", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter clinic name...", required: true },
      { id: "clinic-services", question: "Services & Specialties", answer: "", section: "CLINICAL & BUSINESS", placeholder: "List clinic services and specialties...", required: true },
      { id: "clinic-location", question: "Location & Facilities", answer: "", section: "CLINICAL & BUSINESS", placeholder: "Enter locations / facilities info...", required: false },
      { id: "clinic-audience", question: "Target Patient Demographics", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe target patient demographics...", required: true },
      { id: "clinic-value", question: "Why Patients Choose You", answer: "", section: "BRAND & STRATEGY", placeholder: "What is your main clinic value proposition?", required: false },
      { id: "clinic-cta", question: "Primary Call to Action", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter main call to action...", required: true }
    ]
  },
  Business: {
    category: "Business",
    questions: [
      { id: "biz-name", question: "Business Name", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter business name...", required: true },
      { id: "biz-industry", question: "Business Industry / Niche", answer: "", section: "CLINICAL & BUSINESS", placeholder: "Describe your industry / niche...", required: true },
      { id: "biz-audience", question: "Target Client Profile", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe your ideal client...", required: true },
      { id: "biz-problem", question: "Core Problem Solved", answer: "", section: "BRAND & STRATEGY", placeholder: "What problem does your business solve?", required: false },
      { id: "biz-usp", question: "Unique Selling Proposition", answer: "", section: "BRAND & STRATEGY", placeholder: "What makes your business different?", required: false },
      { id: "biz-cta", question: "Primary Call to Action", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter main call to action...", required: true }
    ]
  },
  "Coach / Consultant": {
    category: "Coach / Consultant",
    questions: [
      { id: "coach-name", question: "Full Name / Brand", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter name / brand...", required: true },
      { id: "coach-niche", question: "Niche / Area of Expertise", answer: "", section: "CLINICAL & BUSINESS", placeholder: "Enter coaching niche / consulting expertise...", required: true },
      { id: "coach-audience", question: "Ideal Client Profile", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe your target client...", required: true },
      { id: "coach-trans", question: "Key Client Transformation", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe the transformation you provide...", required: false },
      { id: "coach-method", question: "Signature Methodology", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe your signature methodology...", required: false },
      { id: "coach-cta", question: "Primary Call to Action", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter main call to action...", required: true }
    ]
  },
  "Real Estate": {
    category: "Real Estate",
    questions: [
      { id: "re-name", question: "Agent / Agency Name", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter agent or agency name...", required: true },
      { id: "re-territory", question: "Market Focus / Specialty Area", answer: "", section: "CLINICAL & BUSINESS", placeholder: "Describe your territory or specialty area...", required: true },
      { id: "re-audience", question: "Target Clients (Buyers/Sellers)", answer: "", section: "BRAND & STRATEGY", placeholder: "Describe your target clients...", required: true },
      { id: "re-advantage", question: "Unique Real Estate Advantage", answer: "", section: "BRAND & STRATEGY", placeholder: "What makes your real estate service stand out?", required: false },
      { id: "re-listings", question: "Key Focus Areas / Listings", answer: "", section: "CONTENT & MARKETING", placeholder: "List key neighborhoods / listings to focus on...", required: false },
      { id: "re-cta", question: "Primary Call to Action", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter main call to action...", required: true }
    ]
  },
  Other: {
    category: "Other",
    questions: [
      { id: "name", question: "What is your full name?", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter full name...", required: true },
      { id: "profession", question: "What is your profession or title?", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter profession or title...", required: true },
      { id: "business", question: "What does your business do in one sentence?", answer: "", section: "PERSONAL & PROFESSIONAL", placeholder: "Enter business description...", required: false },
      { id: "target_audience", question: "Who is your target audience?", answer: "", section: "BRAND & STRATEGY", placeholder: "Enter target audience...", required: true },
      { id: "problem_solved", question: "What problem do you solve for them?", answer: "", section: "BRAND & STRATEGY", placeholder: "Enter problem solved...", required: false },
      { id: "differentiator", question: "What makes you different from others in your space?", answer: "", section: "BRAND & STRATEGY", placeholder: "Enter differentiator...", required: false },
      { id: "unique_angle", question: "What is your unique angle or point of view?", answer: "", section: "BRAND & STRATEGY", placeholder: "Enter unique angle...", required: false },
      { id: "cta", question: "What is your call to action? (what do you want viewers to do?)", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter CTA...", required: true },
      { id: "success_90_days", question: "What does success look like for your content in 90 days?", answer: "", section: "CONTENT & MARKETING", placeholder: "Enter success definition...", required: false }
    ]
  }
};

const CATEGORIES = [
  { label: "Doctor", emoji: "👨‍⚕️" },
  { label: "Clinic", emoji: "🏥" },
  { label: "Business", emoji: "🏢" },
  { label: "Coach / Consultant", emoji: "🎯" },
  { label: "Real Estate", emoji: "🏡" },
  { label: "Other", emoji: "📝" },
];

function parseFoundation(raw: Json | null | undefined): FoundationData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as FoundationData;
}

function formatValue(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Autofilling questions from legacy keys
function getInitialQuestions(rawFoundation: FoundationData, category: string): QuestionBlock[] {
  if (rawFoundation.questions && Array.isArray(rawFoundation.questions)) {
    return (rawFoundation.questions as QuestionBlock[]).map(q => ({
      ...q,
      required: q.required ?? false
    }));
  }

  const template = TEMPLATES[category] || TEMPLATES.Other;

  return template.questions.map((q) => {
    let legacyAnswer = "";
    if (
      q.id === "doc-name" ||
      q.id === "clinic-name" ||
      q.id === "biz-name" ||
      q.id === "coach-name" ||
      q.id === "re-name" ||
      q.id === "name"
    ) {
      legacyAnswer = formatValue(rawFoundation.name);
    } else if (q.id === "doc-title" || q.id === "profession") {
      legacyAnswer = formatValue(rawFoundation.profession);
    } else if (
      q.id === "biz-industry" ||
      q.id === "coach-niche" ||
      q.id === "re-territory" ||
      q.id === "clinic-services"
    ) {
      legacyAnswer = formatValue(rawFoundation.business || rawFoundation.profession);
    } else if (q.id.includes("audience") || q.id === "target_audience") {
      legacyAnswer = formatValue(rawFoundation.target_audience);
    } else if (q.id === "biz-problem" || q.id === "problem_solved") {
      legacyAnswer = formatValue(rawFoundation.problem_solved);
    } else if (
      q.id === "doc-diff" ||
      q.id === "clinic-value" ||
      q.id === "biz-usp" ||
      q.id === "coach-trans" ||
      q.id === "re-advantage" ||
      q.id === "differentiator"
    ) {
      legacyAnswer = formatValue(rawFoundation.differentiator);
    } else if (q.id === "cta") {
      legacyAnswer = formatValue(rawFoundation.cta);
    } else if (q.id === "success_90_days") {
      legacyAnswer = formatValue(rawFoundation.success_90_days);
    }

    return {
      ...q,
      required: q.required ?? false,
      answer: legacyAnswer || q.answer,
    };
  });
}

export function FoundationView({ clientId }: FoundationViewProps) {
  const { data: brain, isLoading } = useClientBrain(clientId);
  const updateBrain = useUpdateClientBrain();
  const toggleReady = useToggleFoundationReady();
  const { setActiveTab } = useWorkspaceHeader();
  const { role } = useAuth();
  const isTeam = role !== "client";

  // Template hooks & state
  const { data: customTemplates } = useStudioTemplates();
  const createTemplate = useCreateStudioTemplate();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Section edit states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editSectionText, setEditSectionText] = useState("");
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionNameInput, setNewSectionNameInput] = useState("");

  const [questions, setQuestions] = useState<QuestionBlock[]>([]);
  const [category, setCategory] = useState<string>("Doctor");

  // Edit label inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabelText, setEditLabelText] = useState<string>("");

  // Category switch confirmation dialog
  const [confirmCategory, setConfirmCategory] = useState<string | null>(null);

  // Send to Client dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Paste Summary dialog state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryTab, setSummaryTab] = useState<"transcript" | "text" | "file" | "url">("transcript");
  const [transcriptInput, setTranscriptInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawFoundation = brain ? parseFoundation(brain.foundation) : {};
  const foundationReady = (brain as Record<string, unknown> | undefined)?.foundation_ready === true;

  // Sync state with database
  useEffect(() => {
    if (brain) {
      const raw = parseFoundation(brain.foundation);
      const cat = raw.category || "Doctor";
      setCategory(cat);
      setQuestions(getInitialQuestions(raw, cat));
    } else {
      setCategory("Doctor");
      setQuestions(TEMPLATES.Doctor.questions);
    }
  }, [brain]);

  // Compute answers progress
  const filledCount = questions.reduce<number>((acc, q) => {
    return acc + (q.answer.trim().length > 0 ? 1 : 0);
  }, 0);

  const requiredQuestions = questions.filter((q) => q.required);
  const missingRequired = requiredQuestions.filter((q) => !q.answer.trim());

  // ─── Input Handlers ────────────────────────────────────────────────────────

  const handleAnswerChange = (qId: string, answer: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, answer } : q)));
  };

  const handleSaveAnswer = async (qId: string) => {
    const updatedQuestions = [...questions];
    const currentQ = updatedQuestions.find((q) => q.id === qId);
    if (!currentQ) return;

    // Legacy Key Mirror Map
    const legacyKeyMap: Record<string, string> = {
      "doc-name": "name", "clinic-name": "name", "biz-name": "name", "coach-name": "name", "re-name": "name", "name": "name",
      "doc-title": "profession", "profession": "profession",
      "biz-industry": "business", "coach-niche": "business", "re-territory": "business", "clinic-services": "business",
      "doc-audience": "target_audience", "clinic-audience": "target_audience", "biz-audience": "target_audience", "coach-audience": "target_audience", "re-audience": "target_audience", "target_audience": "target_audience",
      "biz-problem": "problem_solved", "problem_solved": "problem_solved",
      "doc-diff": "differentiator", "clinic-value": "differentiator", "biz-usp": "differentiator", "coach-trans": "differentiator", "re-advantage": "differentiator", "differentiator": "differentiator",
      "doc-cta": "cta", "clinic-cta": "cta", "biz-cta": "cta", "coach-cta": "cta", "re-cta": "cta", "cta": "cta",
      "success_90_days": "success_90_days",
    };

    const nextFoundation: FoundationData = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    const legacyKey = legacyKeyMap[qId];
    if (legacyKey) {
      nextFoundation[legacyKey] = currentQ.answer;
    }

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      // Toast message silenced on blur saves
    } catch {
      toast.error("Failed to save answer.");
    }
  };

  // ─── Inline Editable Label Handlers ────────────────────────────────────────

  const handleStartEditLabel = (qId: string, currentLabel: string) => {
    setEditingId(qId);
    setEditLabelText(currentLabel);
  };

  const handleSaveQuestionLabel = async (qId: string) => {
    if (!editLabelText.trim()) {
      setEditingId(null);
      return;
    }

    const updatedQuestions = questions.map((q) =>
      q.id === qId ? { ...q, question: editLabelText.trim() } : q
    );
    setQuestions(updatedQuestions);
    setEditingId(null);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success("Question label updated!");
    } catch {
      toast.error("Failed to update question label.");
    }
  };

  // ─── Modular Question Block Actions ────────────────────────────────────────

  const handleToggleRequired = async (qId: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === qId ? { ...q, required: !q.required } : q
    );
    setQuestions(updatedQuestions);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success("Question requirement updated!");
    } catch {
      toast.error("Failed to update question requirement.");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== qId);
    setQuestions(updatedQuestions);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success("Question removed!");
    } catch {
      toast.error("Failed to remove question.");
    }
  };

  const handleAddQuestion = async (section: string) => {
    const newQ: QuestionBlock = {
      id: `custom-${Date.now()}`,
      question: "New Custom Question",
      answer: "",
      section: section,
      placeholder: "Type your answer here...",
      required: false,
    };

    const updatedQuestions = [...questions, newQ];
    setQuestions(updatedQuestions);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success("New question block added!");
      handleStartEditLabel(newQ.id, newQ.question);
    } catch {
      toast.error("Failed to add question.");
    }
  };

  // ─── Category Selector Handlers ───────────────────────────────────────────

  const handleCategoryClick = (cat: string) => {
    if (cat === category) return;

    // Warn if answers are already filled
    const hasAnswers = questions.some((q) => q.answer.trim().length > 0);
    if (hasAnswers) {
      setConfirmCategory(cat);
    } else {
      performCategorySwitch(cat);
    }
  };

  const performCategorySwitch = async (cat: string) => {
    const customTpl = customTemplates?.find((t) => t.name === cat);
    let templateQuestions = [];
    if (customTpl) {
      templateQuestions = (customTpl.questions as QuestionBlock[]).map((q) => ({
        ...q,
        answer: "",
      }));
    } else {
      templateQuestions = getInitialQuestions({}, cat);
    }

    setCategory(cat);
    setQuestions(templateQuestions);
    setConfirmCategory(null);

    const nextFoundation = {
      ...rawFoundation,
      category: cat,
      questions: templateQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success(`Switched category template to ${cat}!`);
    } catch {
      toast.error("Failed to switch category.");
    }
  };

  // Section Editing Handlers
  const handleSaveSectionRename = async (oldName: string) => {
    if (!editSectionText.trim() || editSectionText.trim() === oldName) {
      setEditingSection(null);
      return;
    }
    const newName = editSectionText.trim().toUpperCase();
    const updatedQuestions = questions.map((q) =>
      q.section === oldName ? { ...q, section: newName } : q
    );
    setQuestions(updatedQuestions);
    setEditingSection(null);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success(`Section renamed to "${newName}"`);
    } catch {
      toast.error("Failed to rename section.");
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;
    const updatedQuestions = questions.filter((q) => q.section !== sectionToDelete);
    setQuestions(updatedQuestions);

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success(`Section "${sectionToDelete}" and its questions deleted.`);
      setSectionToDelete(null);
    } catch {
      toast.error("Failed to delete section.");
    }
  };

  const handleAddSection = async () => {
    if (!newSectionNameInput.trim()) return;
    const secName = newSectionNameInput.trim().toUpperCase();

    const exists = questions.some((q) => q.section.toUpperCase() === secName);
    if (exists) {
      toast.error("Section already exists.");
      return;
    }

    const newQ: QuestionBlock = {
      id: `custom-${Date.now()}`,
      question: "Edit this question label...",
      answer: "",
      section: secName,
      placeholder: "Type answer here...",
      required: false,
    };

    const updatedQuestions = [...questions, newQ];
    setQuestions(updatedQuestions);
    setAddSectionOpen(false);
    setNewSectionNameInput("");

    const nextFoundation = {
      ...rawFoundation,
      category,
      questions: updatedQuestions,
    };

    try {
      await updateBrain.mutateAsync({
        clientId,
        foundation: nextFoundation as unknown as Json,
      });
      toast.success(`Section "${secName}" added!`);
      handleStartEditLabel(newQ.id, newQ.question);
    } catch {
      toast.error("Failed to create section.");
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    try {
      await createTemplate.mutateAsync({
        name: templateName.trim(),
        emoji: "📝",
        questions: questions.map((q) => ({ ...q, answer: "" })),
      });
      toast.success("Onboarding template saved successfully!");
      setTemplateDialogOpen(false);
      setTemplateName("");
    } catch {
      toast.error("Failed to save template.");
    }
  };

  // ─── Unified Paste Summary Context Handlers ─────────────────────────────────

  const handleAddTranscript = async () => {
    if (!transcriptInput.trim() || !brain) return;

    const existingTranscripts = Array.isArray(brain.call_transcripts)
      ? (brain.call_transcripts as Array<{ text: string; added_at: string }>)
      : [];

    await updateBrain.mutateAsync({
      clientId,
      call_transcripts: [
        ...existingTranscripts,
        { text: transcriptInput.trim(), added_at: new Date().toISOString() },
      ] as unknown as Json,
    });
    setTranscriptInput("");
    setSummaryDialogOpen(false);
    toast.success("Call transcript submitted!");
  };

  const saveDump = async (text: string, type: "text" | "file" | "url") => {
    if (!text.trim() || !brain) return;

    const existingDumps = Array.isArray(brain.context_dumps)
      ? (brain.context_dumps as Array<{ text: string; type: string; added_at: string }>)
      : [];

    await updateBrain.mutateAsync({
      clientId,
      context_dumps: [
        ...existingDumps,
        { text: text.trim(), type, added_at: new Date().toISOString() },
      ] as unknown as Json,
    });
    toast.success("Document context saved!");
  };

  const handleDumpText = async () => {
    await saveDump(contextInput, "text");
    setContextInput("");
    setSummaryDialogOpen(false);
  };

  const handleDumpUrl = async () => {
    await saveDump(urlInput, "url");
    setUrlInput("");
    setSummaryDialogOpen(false);
  };

  const handleDumpFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        await saveDump(`[File: ${file.name}]\n\n${text}`, "file");
        setSummaryDialogOpen(false);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToggleReady = () => {
    if (!foundationReady && missingRequired.length > 0) {
      toast.warning(`Note: ${missingRequired.length} required fields are still missing.`);
    }
    toggleReady.mutate({ clientId, ready: !foundationReady });
  };

  const handleSendToClient = async () => {
    if (!foundationReady) {
      try {
        await toggleReady.mutateAsync({ clientId, ready: true });
        toast.success("Content Studio activated for client!");
      } catch {
        toast.error("Failed to activate Content Studio.");
      }
    }
    setSendDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 flex-1">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  // Group questions by section
  const sections = Array.from(new Set(questions.map((q) => q.section)));

  return (
    <div className="flex-1 space-y-6">
      {/* ─── Top Bar Buttons Layout ─── */}
      {isTeam ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-foreground-disabled tabular-nums bg-surface-raised px-2.5 py-1 rounded-md">
              {filledCount} / {questions.length} answered
            </span>

            {foundationReady && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">
                <CheckCircle2 className="h-3 w-3" />
                Active on Client Dashboard
              </span>
            )}
          </div>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Client Brain Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("Client Brain")}
              className="gap-1.5 text-xs text-foreground-muted border-border bg-surface-card hover:bg-surface-raised hover:text-foreground"
            >
              <Brain className="h-3.5 w-3.5" />
              Client Brain
            </Button>

            {/* Paste Summary Button */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-foreground-muted border-border bg-surface-card hover:bg-surface-raised hover:text-foreground"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface-card border-border sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-foreground-strong flex items-center gap-2">
                    <ClipboardPaste className="h-4 w-4 text-primary" />
                    Paste Summary / Context Dump
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Provide transcript summaries, notes, URL links, or documents. The AI will extract relevant answers.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={summaryTab} onValueChange={(v) => setSummaryTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-4 bg-surface-input border border-border rounded-lg p-0.5">
                    <TabsTrigger value="transcript" className="text-[11px] gap-1 px-1">
                      <MessageSquare className="h-3 w-3" />
                      Call Transcript
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-[11px] gap-1 px-1">
                      <Type className="h-3 w-3" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="file" className="text-[11px] gap-1 px-1">
                      <FileUp className="h-3 w-3" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="url" className="text-[11px] gap-1 px-1">
                      <LinkIcon className="h-3 w-3" />
                      Paste URL
                    </TabsTrigger>
                  </TabsList>

                  {/* Call Transcript */}
                  <TabsContent value="transcript" className="space-y-3 mt-3">
                    <textarea
                      placeholder="Paste call transcript or summary here…"
                      rows={6}
                      value={transcriptInput}
                      onChange={(e) => setTranscriptInput(e.target.value)}
                      className="w-full bg-surface-input border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-foreground-disabled/50 focus:outline-none focus:border-primary resize-none"
                    />
                    <Button
                      onClick={handleAddTranscript}
                      disabled={!transcriptInput.trim() || updateBrain.isPending}
                      className="w-full text-xs gap-1.5"
                    >
                      {updateBrain.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Process & Save Transcript
                    </Button>
                  </TabsContent>

                  {/* Paste Text */}
                  <TabsContent value="text" className="space-y-3 mt-3">
                    <textarea
                      placeholder="Paste context here…"
                      rows={6}
                      value={contextInput}
                      onChange={(e) => setContextInput(e.target.value)}
                      className="w-full bg-surface-input border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-foreground-disabled/50 focus:outline-none focus:border-primary resize-none"
                    />
                    <Button
                      onClick={handleDumpText}
                      disabled={!contextInput.trim() || updateBrain.isPending}
                      className="w-full text-xs gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Save Text Context
                    </Button>
                  </TabsContent>

                  {/* Upload File */}
                  <TabsContent value="file" className="space-y-3 mt-3">
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg bg-surface-input hover:border-primary/40 transition-colors">
                      <FileUp className="h-8 w-8 text-foreground-muted mb-2" />
                      <p className="text-xs text-foreground-muted mb-3">
                        Upload a file (.pdf, .docx, .txt, .csv)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,.csv,.md"
                        className="hidden"
                        onChange={handleDumpFile}
                      />
                    </div>
                  </TabsContent>

                  {/* Paste URL */}
                  <TabsContent value="url" className="space-y-3 mt-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="https://example.com/context-doc"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="bg-surface-input border-border text-xs"
                      />
                    </div>
                    <Button
                      onClick={handleDumpUrl}
                      disabled={!urlInput.trim() || updateBrain.isPending}
                      className="w-full text-xs gap-1.5"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      Save URL Reference
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {foundationReady ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSendDialogOpen(true)}
                  className="gap-1.5 text-xs text-foreground-muted border-border bg-surface-card hover:bg-surface-raised hover:text-foreground cursor-pointer"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Invite Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await toggleReady.mutateAsync({ clientId, ready: false });
                      toast.success("Client access revoked.");
                    } catch {
                      toast.error("Failed to revoke access.");
                    }
                  }}
                  disabled={toggleReady.isPending}
                  className="gap-1.5 text-xs text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 cursor-pointer active:scale-95 transition-transform"
                >
                  {toggleReady.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Unsend / Revoke Access
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSendToClient}
                disabled={toggleReady.isPending}
                className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer active:scale-95 transition-transform"
              >
                {toggleReady.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send to Client
              </Button>
            )}

            {/* Send to Client Dialog */}
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
              <DialogContent className="bg-surface-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground-strong flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    Send Onboarding to Client
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Share this direct login URL with your client. They can use it to log in and complete the onboarding checklist.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/login?client=${clientId}`}
                      className="bg-surface-input border-border text-xs flex-1 font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/login?client=${clientId}`);
                        toast.success("Invite link copied!");
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-medium"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>

                  <Separator className="bg-border/60" />

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground-strong">Send via Email</h4>
                    <p className="text-[11px] text-foreground-disabled leading-normal">
                      Send a branded email containing access details directly to the client's email.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs border-border"
                      onClick={() => {
                        toast.success("Onboarding invite sent via email!");
                        setSendDialogOpen(false);
                      }}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Send Email Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        /* Client Top Header Layout */
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-primary tracking-wider uppercase">
              Step 1 Onboarding
            </span>
            <h3 className="text-sm font-semibold text-foreground-strong">
              Brand Foundation Questions
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-foreground-disabled tabular-nums bg-surface-raised px-2.5 py-1 rounded-md">
              {filledCount} / {questions.length} answered
            </span>
            {missingRequired.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All Required Fields Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {missingRequired.length} required fields missing
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── STEP 1 Industry Category Pills ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-foreground-disabled tracking-wider uppercase">
            Step 1 Highlight
          </div>
          {isTeam && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTemplateDialogOpen(true)}
              className="h-7 gap-1 text-[10px] text-primary hover:bg-primary/5 cursor-pointer font-semibold"
            >
              <Sparkles className="h-3 w-3" />
              Save current as Template
            </Button>
          )}
        </div>
        {isTeam ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
            {[
              ...CATEGORIES,
              ...(customTemplates?.map((t) => ({ label: t.name, emoji: t.emoji })) ?? []),
            ].map((cat) => {
              const isActive = category === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleCategoryClick(cat.label)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all shrink-0 hover:bg-surface-raised cursor-pointer",
                    isActive
                      ? "border-primary bg-primary/5 text-foreground-strong ring-1 ring-primary/30"
                      : "border-border bg-surface-card text-foreground-muted"
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface-card w-fit text-xs font-medium text-foreground-strong">
            <span>Category:</span>
            <span className="text-primary">{category}</span>
          </div>
        )}
      </div>

      {/* ─── Question Cards Grouped by Section ─── */}
      <div className="space-y-8">
        {sections.map((section) => {
          const sectionQuestions = questions.filter((q) => q.section === section);
          const isEditingSec = editingSection === section;

          return (
            <div key={section} className="space-y-4">
              {/* Section Subheader with Rename/Delete controls */}
              {isTeam && isEditingSec ? (
                <div className="flex items-center gap-1.5 py-1 border-b border-border/40">
                  <Input
                    value={editSectionText}
                    onChange={(e) => setEditSectionText(e.target.value)}
                    onBlur={() => handleSaveSectionRename(section)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSectionRename(section);
                      if (e.key === "Escape") setEditingSection(null);
                    }}
                    className="h-6 text-xs bg-surface-input border-border py-0.5 px-2 focus-visible:ring-1 focus-visible:ring-primary w-fit max-w-[250px]"
                    autoFocus
                  />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSaveSectionRename(section);
                    }}
                    className="p-0.5 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setEditingSection(null);
                    }}
                    className="p-0.5 text-foreground-disabled hover:text-foreground-muted cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="group/section flex items-center justify-between border-b border-border/40 pb-1 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-foreground-disabled tracking-widest uppercase">
                      {section}
                    </span>
                    {isTeam && (
                      <button
                        onClick={() => {
                          setEditingSection(section);
                          setEditSectionText(section);
                        }}
                        className="opacity-0 group-hover/section:opacity-100 p-0.5 rounded text-foreground-disabled hover:text-foreground-muted transition-opacity cursor-pointer"
                        title="Rename Section"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>

                  {isTeam && (
                    <button
                      onClick={() => setSectionToDelete(section)}
                      className="opacity-0 group-hover/section:opacity-100 p-0.5 rounded text-foreground-disabled hover:text-destructive transition-opacity cursor-pointer"
                      title="Delete Section and all its questions"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Cards List */}
              <div className="space-y-3.5">
                {sectionQuestions.map((q) => {
                  const overallIndex = questions.indexOf(q) + 1;
                  const indexStr = overallIndex.toString().padStart(2, "0");
                  const isFilled = q.answer.trim().length > 0;

                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-border bg-surface-card p-4 flex flex-col gap-3 relative group"
                    >
                      {/* Card Title & Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Index Box */}
                          <div className="h-6 w-7 shrink-0 flex items-center justify-center rounded bg-surface-input border border-border text-[10px] font-mono text-foreground-disabled">
                            {indexStr}
                          </div>

                          {/* Editable Question Label */}
                          {isTeam && editingId === q.id ? (
                            <div className="flex items-center gap-1 flex-1 max-w-sm">
                              <Input
                                value={editLabelText}
                                onChange={(e) => setEditLabelText(e.target.value)}
                                onBlur={() => handleSaveQuestionLabel(q.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveQuestionLabel(q.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="h-6 text-xs bg-surface-input border-border focus-visible:ring-1 focus-visible:ring-primary py-0 px-2"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-emerald-400 hover:text-emerald-300"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSaveQuestionLabel(q.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-foreground-disabled hover:text-foreground-muted"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setEditingId(null);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 group/title truncate">
                              <span className="text-xs font-semibold text-foreground-strong">
                                {q.question}
                                {q.required && <span className="text-red-400 ml-1 font-bold">*</span>}
                              </span>
                              {isTeam && (
                                <button
                                  type="button"
                                  className="opacity-0 group-hover/title:opacity-100 p-0.5 rounded text-foreground-disabled hover:text-foreground-muted transition-opacity cursor-pointer"
                                  onClick={() => handleStartEditLabel(q.id, q.question)}
                                >
                                  <Edit2 className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Status Badge */}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] font-semibold px-2 py-0.2 border rounded-full select-none shrink-0",
                              isFilled
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : q.required
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-surface-raised text-foreground-disabled border-border"
                            )}
                          >
                            {isFilled ? "FILLED" : q.required ? "REQUIRED" : "OPTIONAL"}
                          </Badge>

                          {/* Required/Optional toggle for team */}
                          {isTeam && (
                            <button
                              type="button"
                              onClick={() => handleToggleRequired(q.id)}
                              className={cn(
                                "text-[9px] font-semibold px-2 py-0.5 border rounded-full select-none cursor-pointer transition-all shrink-0",
                                q.required
                                  ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                  : "bg-surface-raised text-foreground-disabled border-border hover:bg-surface-card hover:text-foreground-muted"
                              )}
                            >
                              {q.required ? "Required" : "Optional"}
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        {isTeam && (
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-1 text-foreground-disabled hover:text-destructive transition-all rounded cursor-pointer"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Delete Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Expanding Input Textarea */}
                      <div className="rounded-lg bg-surface-input/50 border border-border p-2.5">
                        <AutosizeTextarea
                          value={q.answer}
                          onChange={(val) => handleAnswerChange(q.id, val)}
                          onBlur={() => handleSaveAnswer(q.id)}
                          placeholder={q.placeholder || "Type answer here..."}
                          className="w-full bg-transparent border-none p-0 text-xs text-foreground placeholder:text-foreground-disabled/30 focus:ring-0 focus:outline-none leading-relaxed resize-none overflow-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Question to Section button */}
              {isTeam && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddQuestion(section)}
                  className="gap-1 text-[11px] text-foreground-disabled hover:text-foreground-muted w-full border border-dashed border-border/30 hover:border-border/60 py-3.5 mt-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add Question
                </Button>
              )}
            </div>
          );
        })}

        {/* Add Section Button */}
        {isTeam && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddSectionOpen(true)}
            className="w-full gap-1.5 py-4 border-dashed border-border/40 text-xs font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-raised cursor-pointer mt-6"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Section
          </Button>
        )}
      </div>

      {/* ─── Confirm Category Switch Dialog ─── */}
      <Dialog
        open={confirmCategory !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmCategory(null);
        }}
      >
        <DialogContent className="bg-surface-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground-strong">Reset Questions Template?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to change the industry category to "{confirmCategory}"?
              This will overwrite the current question blocks and reset them to the new template. All currently filled answers will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmCategory(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmCategory && performCategorySwitch(confirmCategory)}
              className="text-xs"
            >
              Reset & Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Save Custom Template Dialog ─── */}
      {isTeam && (
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Save Onboarding Template
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-xs text-foreground-muted leading-relaxed">
                Save the current list of question blocks (with blank answers) as a reusable category template.
              </p>
              <div className="space-y-2">
                <Label htmlFor="template-name" className="text-foreground-muted">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g. Software Engineer, Real Estate Agent"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-surface-input border-border"
                />
              </div>
              <DialogFooter className="gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateDialogOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || createTemplate.isPending}
                  className="text-xs"
                >
                  {createTemplate.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Template
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Add Section Dialog ─── */}
      {isTeam && (
        <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-section-name" className="text-foreground-muted">Section Name</Label>
                <Input
                  id="new-section-name"
                  placeholder="e.g. ADDITIONAL QUESTIONS"
                  value={newSectionNameInput}
                  onChange={(e) => setNewSectionNameInput(e.target.value)}
                  className="bg-surface-input border-border uppercase"
                />
              </div>
              <DialogFooter className="gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddSectionOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSection}
                  disabled={!newSectionNameInput.trim()}
                  className="text-xs"
                >
                  Create Section
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Delete Section Confirm Dialog ─── */}
      {isTeam && (
        <Dialog open={sectionToDelete !== null} onOpenChange={(open) => !open && setSectionToDelete(null)}>
          <DialogContent className="bg-surface-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground-strong">Delete Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-xs text-foreground-muted leading-relaxed">
                Are you sure you want to delete the section <strong className="text-foreground-strong">"{sectionToDelete}"</strong> and all of its question blocks? This action cannot be undone.
              </p>
              <DialogFooter className="gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSectionToDelete(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSection}
                  className="text-xs"
                >
                  Delete Section
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── AutosizeTextarea Helper Component ───
interface AutosizeTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function AutosizeTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
}: AutosizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      rows={1}
    />
  );
}
