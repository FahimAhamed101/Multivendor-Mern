import { z } from "zod";

export const CareerSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  country: z.string().min(1, "Country is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  salary: z.string().min(1, "Salary is required").trim(),
  jobType: z.enum(["onsite", "remote", "hybrid"], {
    errorMap: () => ({
      message: "must be either onsite | remote | hybrid",
    }),
  }),
  description: z
    .string()
    .min(1, "Description is required")
    .max(10000, "Description cannot exceed 10000 characters")
    .trim(),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
  isActive: z.boolean().default(true),
});
// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

// Personal Info Schema
const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  cvResume: z.string().nullable(),
  tellUsWhyYouWantToJoinOurTeam: z.string().optional(),
});

// Work Experience Schema
const WorkExperienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  companyPhone: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  isCurrentlyWorkHere: z.boolean().default(false),
  startDate: z.string(),
  endDate: z.string().optional().nullable(), //  optional if currently working
  roleDescription: z.string().optional(),
});

// Education Schema
const EducationSchema = z.object({
  schoolOrUniversityName: z
    .string()
    .min(1, "School/University name is required"),
  degree: z.string().min(1, "Degree is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  overallResultGrade: z.string().optional(),
  startYear: z.string().min(1, "Start year is required"),
  endYear: z.string().optional(),
});

// Certification Schema
const CertificationSchema = z.object({
  certificateName: z.string().min(1, "Certificate name is required"),
  file: z.string().min(1, "Certificate file is required"),
});

// Skill Schema
const SkillSchema = z.string();

// Language Schema
const LanguageSchema = z.string();

// Reference Schema
const ReferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
  email: z
    .string()
    .email("Valid email is required")
    .optional()
    .or(z.literal("")),
  contactNumber: z.string().min(1, "Contact number is required"),
  contactEmail: z.string().email("Valid email is required"),
});

// Main Application Schema
export const ApplicationFormSchema = z.object({
  jobId: z.any().optional(),
  user: z.string().optional(),
  personalInfo: PersonalInfoSchema,
  workExperiences: z
    .array(WorkExperienceSchema)
    .min(1, "At least one work experience is required"),
  educations: z
    .array(EducationSchema)
    .min(1, "At least one education entry is required"),
  certifications: z.array(CertificationSchema).optional().default([]),
  skills: z.array(SkillSchema).optional().default([]),
  languages: z.array(LanguageSchema).optional().default([]),
  references: z.array(ReferenceSchema).optional().default([]),
});

export type TCareer = z.infer<typeof CareerSchema>;
export type TApplicationForm = z.infer<typeof ApplicationFormSchema>;
