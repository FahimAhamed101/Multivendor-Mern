import mongoose, { Schema } from "mongoose";
import { TCareer, TApplicationForm } from "./career.interface";

const careerSchema = new Schema<TCareer>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, "Salary is required"],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: {
        values: ["onsite", "remote", "hybrid"],
        message: "Job type must be either onsite, remote, or hybrid",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [10000, "Description cannot exceed 10000 characters"],
    },
    applicationDeadline: {
      type: String,
      required: [true, "Application deadline is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

careerSchema.index({ isActive: 1, createdAt: -1 });
careerSchema.index({ country: 1 });
careerSchema.index({ jobType: 1 });

const PersonalInfoSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    currentLocation: {
      type: String,
      required: [true, "Current location is required"],
      trim: true,
    },
    cvResume: {
      type: String,
      default: null,
    },
    tellUsWhyYouWantToJoinOurTeam: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const WorkExperienceSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    companyPhone: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    isCurrentlyWorkHere: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String,
      default: null,
    },
    roleDescription: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const EducationSchema = new Schema(
  {
    schoolOrUniversityName: {
      type: String,
      required: [true, "School/University name is required"],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    fieldOfStudy: {
      type: String,
      default: null,
    },
    overallResultGrade: {
      type: String,
      default: null,
    },
    startYear: {
      type: String,
      required: [true, "Start year is required"],
    },
    endYear: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const CertificationSchema = new Schema(
  {
    certificateName: {
      type: String,
      required: [true, "Certificate name is required"],
      trim: true,
    },
    file: {
      type: String,
      required: [true, "Certificate file is required"],
    },
  },
  { _id: false },
);

const ReferenceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    companyName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
    },
  },
  { _id: false },
);

const applicationFormSchema = new Schema<TApplicationForm>(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalInfo: {
      type: PersonalInfoSchema,
      required: true,
    },
    workExperiences: {
      type: [WorkExperienceSchema],
      required: [true, "At least one work experience is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one work experience is required",
      },
    },
    educations: {
      type: [EducationSchema],
      required: [true, "At least one education entry is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one education entry is required",
      },
    },
    certifications: {
      type: [CertificationSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    references: {
      type: [ReferenceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

applicationFormSchema.index({ createdAt: -1 });
applicationFormSchema.index(
  { "personalInfo.phoneNumber": 1, jobId: 1 },
  { unique: true },
);

export const Career = mongoose.model<TCareer>("Career", careerSchema);
export const ApplicationForm = mongoose.model<TApplicationForm>(
  "ApplicationForm",
  applicationFormSchema,
);
