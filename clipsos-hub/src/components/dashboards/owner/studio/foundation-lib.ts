/**
 * foundation-lib — question-bank templates + pure helpers extracted from
 * FoundationView so the component file is UI-only.
 */
import type { Json } from "@/integrations/supabase/db-types";

export interface QuestionBlock {
  id: string;
  question: string;
  answer: string;
  section: string;
  placeholder?: string;
  required?: boolean;
}

export interface FoundationData {
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
export const TEMPLATES: Record<string, { category: string; questions: QuestionBlock[] }> = {
  Doctor: {
    category: "Doctor",
    questions: [
      {
        id: "doc-name",
        question: "Full Name",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter full name...",
        required: true,
      },
      {
        id: "doc-title",
        question: "Profession / Title",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter profession / title...",
        required: true,
      },
      {
        id: "doc-specialty",
        question: "Clinic Name / Medical Specialty",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "Enter clinic name / specialty...",
        required: false,
      },
      {
        id: "doc-audience",
        question: "Target Patient Profile",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe your target patient profile...",
        required: true,
      },
      {
        id: "doc-diff",
        question: "Practice Unique Differentiator",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "What makes your medical practice unique?",
        required: false,
      },
      {
        id: "doc-topics",
        question: "Key Educational Health Topics",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "List topics you want to educate patients on...",
        required: false,
      },
      {
        id: "doc-cta",
        question: "Primary Call to Action (CTA)",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter main call to action...",
        required: true,
      },
    ],
  },
  Clinic: {
    category: "Clinic",
    questions: [
      {
        id: "clinic-name",
        question: "Clinic Name",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter clinic name...",
        required: true,
      },
      {
        id: "clinic-services",
        question: "Services & Specialties",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "List clinic services and specialties...",
        required: true,
      },
      {
        id: "clinic-location",
        question: "Location & Facilities",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "Enter locations / facilities info...",
        required: false,
      },
      {
        id: "clinic-audience",
        question: "Target Patient Demographics",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe target patient demographics...",
        required: true,
      },
      {
        id: "clinic-value",
        question: "Why Patients Choose You",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "What is your main clinic value proposition?",
        required: false,
      },
      {
        id: "clinic-cta",
        question: "Primary Call to Action",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter main call to action...",
        required: true,
      },
    ],
  },
  Business: {
    category: "Business",
    questions: [
      {
        id: "biz-name",
        question: "Business Name",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter business name...",
        required: true,
      },
      {
        id: "biz-industry",
        question: "Business Industry / Niche",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "Describe your industry / niche...",
        required: true,
      },
      {
        id: "biz-audience",
        question: "Target Client Profile",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe your ideal client...",
        required: true,
      },
      {
        id: "biz-problem",
        question: "Core Problem Solved",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "What problem does your business solve?",
        required: false,
      },
      {
        id: "biz-usp",
        question: "Unique Selling Proposition",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "What makes your business different?",
        required: false,
      },
      {
        id: "biz-cta",
        question: "Primary Call to Action",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter main call to action...",
        required: true,
      },
    ],
  },
  "Coach / Consultant": {
    category: "Coach / Consultant",
    questions: [
      {
        id: "coach-name",
        question: "Full Name / Brand",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter name / brand...",
        required: true,
      },
      {
        id: "coach-niche",
        question: "Niche / Area of Expertise",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "Enter coaching niche / consulting expertise...",
        required: true,
      },
      {
        id: "coach-audience",
        question: "Ideal Client Profile",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe your target client...",
        required: true,
      },
      {
        id: "coach-trans",
        question: "Key Client Transformation",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe the transformation you provide...",
        required: false,
      },
      {
        id: "coach-method",
        question: "Signature Methodology",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe your signature methodology...",
        required: false,
      },
      {
        id: "coach-cta",
        question: "Primary Call to Action",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter main call to action...",
        required: true,
      },
    ],
  },
  "Real Estate": {
    category: "Real Estate",
    questions: [
      {
        id: "re-name",
        question: "Agent / Agency Name",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter agent or agency name...",
        required: true,
      },
      {
        id: "re-territory",
        question: "Market Focus / Specialty Area",
        answer: "",
        section: "CLINICAL & BUSINESS",
        placeholder: "Describe your territory or specialty area...",
        required: true,
      },
      {
        id: "re-audience",
        question: "Target Clients (Buyers/Sellers)",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Describe your target clients...",
        required: true,
      },
      {
        id: "re-advantage",
        question: "Unique Real Estate Advantage",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "What makes your real estate service stand out?",
        required: false,
      },
      {
        id: "re-listings",
        question: "Key Focus Areas / Listings",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "List key neighborhoods / listings to focus on...",
        required: false,
      },
      {
        id: "re-cta",
        question: "Primary Call to Action",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter main call to action...",
        required: true,
      },
    ],
  },
  Other: {
    category: "Other",
    questions: [
      {
        id: "name",
        question: "What is your full name?",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter full name...",
        required: true,
      },
      {
        id: "profession",
        question: "What is your profession or title?",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter profession or title...",
        required: true,
      },
      {
        id: "business",
        question: "What does your business do in one sentence?",
        answer: "",
        section: "PERSONAL & PROFESSIONAL",
        placeholder: "Enter business description...",
        required: false,
      },
      {
        id: "target_audience",
        question: "Who is your target audience?",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Enter target audience...",
        required: true,
      },
      {
        id: "problem_solved",
        question: "What problem do you solve for them?",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Enter problem solved...",
        required: false,
      },
      {
        id: "differentiator",
        question: "What makes you different from others in your space?",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Enter differentiator...",
        required: false,
      },
      {
        id: "unique_angle",
        question: "What is your unique angle or point of view?",
        answer: "",
        section: "BRAND & STRATEGY",
        placeholder: "Enter unique angle...",
        required: false,
      },
      {
        id: "cta",
        question: "What is your call to action? (what do you want viewers to do?)",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter CTA...",
        required: true,
      },
      {
        id: "success_90_days",
        question: "What does success look like for your content in 90 days?",
        answer: "",
        section: "CONTENT & MARKETING",
        placeholder: "Enter success definition...",
        required: false,
      },
    ],
  },
};

export const CATEGORIES = [
  { label: "Doctor", emoji: "👨‍⚕️" },
  { label: "Clinic", emoji: "🏥" },
  { label: "Business", emoji: "🏢" },
  { label: "Coach / Consultant", emoji: "🎯" },
  { label: "Real Estate", emoji: "🏡" },
  { label: "Other", emoji: "📝" },
];

export function parseFoundation(raw: Json | null | undefined): FoundationData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as FoundationData;
}

export function formatValue(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Autofilling questions from legacy keys
export function getInitialQuestions(
  rawFoundation: FoundationData,
  category: string,
): QuestionBlock[] {
  if (rawFoundation.questions && Array.isArray(rawFoundation.questions)) {
    return (rawFoundation.questions as QuestionBlock[]).map((q) => ({
      ...q,
      required: q.required ?? false,
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
