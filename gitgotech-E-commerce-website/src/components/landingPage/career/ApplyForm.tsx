"use client";
import { useApplyCareerMutation } from "@/redux/features/career/careerSlice";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function JobApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [applyCareer, { isLoading: isApplying }] = useApplyCareerMutation();

  const [openSections, setOpenSections] = useState({
    personal: true,
    work: false,
    education: false,
    certifications: false,
    skills: false,
    language: false,
    references: false,
  });

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: "",
    currentLocation: "",
    cvResume: null as File | null,
    tellUsWhyYouWantToJoinOurTeam: "",
  });

  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      jobTitle: "",
      company: "",
      companyPhone: "",
      companyWebsite: "",
      location: "",
      isCurrentlyWorkHere: false,
      startDate: "",
      endDate: "",
      roleDescription: "",
    },
  ]);

  const [educations, setEducations] = useState([
    {
      id: 1,
      schoolOrUniversityName: "",
      degree: "",
      phone: "",
      email: "",
      fieldOfStudy: "",
      overallResultGrade: "",
      startYear: "",
      endYear: "",
    },
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: 1,
      certificateName: "",
      file: null as File | null,
    },
  ]);

  const [skills, setSkills] = useState<string[]>([""]);

  const [languages, setLanguages] = useState<string[]>([""]);

  const [references, setReferences] = useState([
    {
      id: 1,
      name: "",
      companyName: "",
      email: "",
      contactNumber: "",
      contactEmail: "",
    },
  ]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePersonalInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setPersonalInfo((prev) => ({ ...prev, cvResume: file }));
    }
  };

  // Work Experience handlers
  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        id: Date.now(),
        jobTitle: "",
        company: "",
        companyPhone: "",
        companyWebsite: "",
        location: "",
        isCurrentlyWorkHere: false,
        startDate: "",
        endDate: "",
        roleDescription: "",
      },
    ]);
  };

  const removeWorkExperience = (id: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((exp) => exp.id !== id));
    }
  };

  const updateWorkExperience = (
    id: number,
    field: string,
    value: string | boolean,
  ) => {
    setWorkExperiences(
      workExperiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  // Education handlers
  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now(),
        schoolOrUniversityName: "",
        degree: "",
        phone: "",
        email: "",
        fieldOfStudy: "",
        overallResultGrade: "",
        startYear: "",
        endYear: "",
      },
    ]);
  };

  const removeEducation = (id: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((edu) => edu.id !== id));
    }
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setEducations(
      educations.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    );
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: Date.now(),
        certificateName: "",
        file: null as File | null,
      },
    ]);
  };

  const removeCertification = (id: number) => {
    if (certifications.length > 1) {
      setCertifications(certifications.filter((cert) => cert.id !== id));
    }
  };

  const updateCertification = (
    id: number,
    field: string,
    value: string | File | null,
  ) => {
    setCertifications(
      certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert,
      ),
    );
  };

  const handleCertificationFileUpload = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      updateCertification(id, "file", file);
    }
  };

  // Skill handlers
  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    setSkills(updatedSkills);
  };

  // Language handlers
  const addLanguage = () => {
    setLanguages([...languages, ""]);
  };

  const removeLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const updateLanguage = (index: number, value: string) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = value;
    setLanguages(updatedLanguages);
  };

  // Reference handlers
  const addReference = () => {
    setReferences([
      ...references,
      {
        id: Date.now(),
        name: "",
        companyName: "",
        email: "",
        contactNumber: "",
        contactEmail: "",
      },
    ]);
  };

  const removeReference = (id: number) => {
    if (references.length > 1) {
      setReferences(references.filter((ref) => ref.id !== id));
    }
  };

  const updateReference = (id: number, field: string, value: string) => {
    setReferences(
      references.map((ref) =>
        ref.id === id ? { ...ref, [field]: value } : ref,
      ),
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !personalInfo.fullName ||
      !personalInfo.phoneNumber ||
      !personalInfo.cvResume
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!jobId) {
      toast.error("Job ID not found");
      return;
    }

    // Build FormData to match the Postman body structure
    const formData = new FormData();

    // Personal Info - as JSON string
    formData.append("personalInfo", JSON.stringify(personalInfo));

    // Work Experiences - filter out id field and format properly
    const formattedWorkExperiences = workExperiences.map((exp) => {
      const { id, ...rest } = exp;
      return rest;
    });
    formData.append(
      "workExperiences",
      JSON.stringify(formattedWorkExperiences),
    );

    // Educations - filter out id field and format properly
    const formattedEducations = educations.map((edu) => {
      const { id, ...rest } = edu;
      return rest;
    });
    formData.append("educations", JSON.stringify(formattedEducations));

    // Certifications - filter out id field
    const formattedCertifications = certifications.map((cert) => {
      const { id, ...rest } = cert;
      return rest;
    });
    // Add certification files separately
    formattedCertifications.forEach((cert, index) => {
      formData.append(
        `certifications[${index}][certificateName]`,
        cert.certificateName,
      );
      if (cert.file) {
        formData.append(`certifications[${index}][file]`, cert.file);
      }
    });

    // Skills - filter empty strings
    const filteredSkills = skills.filter((s) => s.trim());
    formData.append("skills", JSON.stringify(filteredSkills));

    // Languages - filter empty strings
    const filteredLanguages = languages.filter((l) => l.trim());
    formData.append("languages", JSON.stringify(filteredLanguages));

    // References - filter out id field and format properly
    const formattedReferences = references.map((ref) => {
      const { id, ...rest } = ref;
      return rest;
    });
    formData.append("references", JSON.stringify(formattedReferences));

    // CV/Resume file (from personalInfo)
    if (personalInfo.cvResume) {
      formData.append("cvResume", personalInfo.cvResume);
    }

    try {
      const res = await applyCareer({ id: jobId, formData }).unwrap();
      console.log(res);
      toast.success("Application submitted successfully!");
      router.push("/careers");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit application");
      console.log(err.data);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-r from-black via-[#050218] to-black p-4 md:p-8">
      <div className="container mx-auto flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className="text-black" />
          </div>
        </button>
        <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
          Application Form
        </h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-2">
          <div className="flex justify-center">
            <img className="h-44 w-44" src="/images/logo.png" alt="Logo" />
          </div>
          <h1 className="text-4xl font-bold font-cormorant text-white mb-2">
            Submit Your Application
          </h1>
          <p className="text-gray-400">
            Provide your important details to complete your job application.
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("personal")}
            >
              <h2 className="text-xl font-semibold text-white">
                Personal Info
              </h2>
              {openSections.personal ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.personal && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={personalInfo.fullName}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 bg-[#242428] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Michael Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#242428] border border-gray-600 rounded-l-lg px-3">
                      <img
                        src="https://flagcdn.com/w20/us.png"
                        alt="US Flag"
                        className="w-5 h-5"
                      />
                      <span className="text-gray-300">+1</span>
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber}
                      onChange={handlePersonalInfoChange}
                      className="flex-1 px-4 py-3 bg-[#242428] border border-gray-600 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="555-0123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Location *
                  </label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={personalInfo.currentLocation}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 bg-[#242428] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="San Francisco, CA, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Your CV/Resume *
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400 mb-2">
                      Drag & drop your file or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium cursor-pointer transition-colors"
                    >
                      Browse File
                    </label>
                    {personalInfo.cvResume && (
                      <p className="text-sm text-green-400 mt-2">
                        {personalInfo.cvResume.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tell us why you want to join our team *
                  </label>
                  <textarea
                    name="tellUsWhyYouWantToJoinOurTeam"
                    value={personalInfo.tellUsWhyYouWantToJoinOurTeam}
                    onChange={handlePersonalInfoChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#242428] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="I am passionate about technology and innovation..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Work Experience Section */}
          <div className="border-2 rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("work")}
            >
              <h2 className="text-xl font-semibold text-white">
                Work Experience
              </h2>
              {openSections.work ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.work && (
              <div className="mt-6 space-y-6">
                {workExperiences.map((exp, index) => (
                  <div key={exp.id} className="rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">
                        Work Experience {index + 1}
                      </h3>
                      {workExperiences.length > 1 && (
                        <button
                          onClick={() => removeWorkExperience(exp.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "jobTitle",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Senior Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "company",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Tech Solutions Inc"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Phone
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-gray-600 border border-gray-500 rounded-l-lg px-3">
                            <img
                              src="https://flagcdn.com/w20/us.png"
                              alt="US Flag"
                              className="w-5 h-5"
                            />
                            <span className="text-gray-300">+1</span>
                          </div>
                          <input
                            type="tel"
                            value={exp.companyPhone}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "companyPhone",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-4 py-3 bg-[#242428] border border-gray-500 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="555-0123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Website
                        </label>
                        <div className="flex items-center gap-2">
                          <Globe className="text-gray-400" size={20} />
                          <input
                            type="url"
                            value={exp.companyWebsite}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "companyWebsite",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="https://www.techsolutions.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "location",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="San Francisco, CA"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.isCurrentlyWorkHere}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "isCurrentlyWorkHere",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-gray-300">
                            I am Currently Working here
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            From
                          </label>
                          <input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "startDate",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            To
                          </label>
                          <input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) =>
                              updateWorkExperience(
                                exp.id,
                                "endDate",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={exp.isCurrentlyWorkHere}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Role Description
                        </label>
                        <textarea
                          value={exp.roleDescription}
                          onChange={(e) =>
                            updateWorkExperience(
                              exp.id,
                              "roleDescription",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Led a team of 5 developers..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addWorkExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another
                </button>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="border rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("education")}
            >
              <h2 className="text-xl font-semibold text-white">Education</h2>
              {openSections.education ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.education && (
              <div className="mt-6 space-y-6">
                {educations.map((edu, index) => (
                  <div key={edu.id} className="rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">
                        Education {index + 1}
                      </h3>
                      {educations.length > 1 && (
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          School/University Name *
                        </label>
                        <input
                          type="text"
                          value={edu.schoolOrUniversityName}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "schoolOrUniversityName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Stanford University"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(edu.id, "degree", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Master of Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "fieldOfStudy",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Artificial Intelligence"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={edu.phone}
                            onChange={(e) =>
                              updateEducation(edu.id, "phone", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+1-555-0123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={edu.email}
                            onChange={(e) =>
                              updateEducation(edu.id, "email", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="university@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Overall Result/Grade
                        </label>
                        <input
                          type="text"
                          value={edu.overallResultGrade}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "overallResultGrade",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="3.8 GPA"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Start Year
                          </label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) =>
                              updateEducation(
                                edu.id,
                                "startYear",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="2015"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            End Year
                          </label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) =>
                              updateEducation(edu.id, "endYear", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="2017"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another
                </button>
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="border rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("certifications")}
            >
              <h2 className="text-xl font-semibold text-white">
                Certifications
              </h2>
              {openSections.certifications ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.certifications && (
              <div className="mt-6 space-y-6">
                {certifications.map((cert, index) => (
                  <div key={cert.id} className="rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">
                        Certification {index + 1}
                      </h3>
                      {certifications.length > 1 && (
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Certificate Name *
                        </label>
                        <input
                          type="text"
                          value={cert.certificateName}
                          onChange={(e) =>
                            updateCertification(
                              cert.id,
                              "certificateName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="AWS Certified Solutions Architect - Professional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Upload Certificate File
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                          <Upload
                            size={24}
                            className="mx-auto text-gray-400 mb-2"
                          />
                          <p className="text-sm text-gray-400 mb-2">
                            Click to upload certificate image
                          </p>
                          <input
                            type="file"
                            onChange={(e) =>
                              handleCertificationFileUpload(cert.id, e)
                            }
                            className="hidden"
                            id={`cert-upload-${cert.id}`}
                          />
                          <label
                            htmlFor={`cert-upload-${cert.id}`}
                            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium cursor-pointer transition-colors"
                          >
                            Browse File
                          </label>
                          {cert.file && (
                            <p className="text-sm text-green-400 mt-2">
                              {cert.file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCertification}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another
                </button>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="border rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("skills")}
            >
              <h2 className="text-xl font-semibold text-white">Skills</h2>
              {openSections.skills ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.skills && (
              <div className="mt-6 space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="JavaScript"
                    />
                    {skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another skill
                </button>
              </div>
            )}
          </div>

          {/* Languages Section */}
          <div className="border rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("language")}
            >
              <h2 className="text-xl font-semibold text-white">Languages</h2>
              {openSections.language ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.language && (
              <div className="mt-6 space-y-4">
                {languages.map((language, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => updateLanguage(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="English"
                    />
                    {languages.length > 1 && (
                      <button
                        onClick={() => removeLanguage(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addLanguage}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another language
                </button>
              </div>
            )}
          </div>

          {/* References Section */}
          <div className="border rounded-xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("references")}
            >
              <h2 className="text-xl font-semibold text-white">References</h2>
              {openSections.references ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>

            {openSections.references && (
              <div className="mt-6 space-y-6">
                {references.map((ref, index) => (
                  <div key={ref.id} className="rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">
                        Reference {index + 1}
                      </h3>
                      {references.length > 1 && (
                        <button
                          onClick={() => removeReference(ref.id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) =>
                            updateReference(ref.id, "name", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Sarah Johnson"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={ref.companyName}
                          onChange={(e) =>
                            updateReference(
                              ref.id,
                              "companyName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Tech Solutions Inc"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={ref.email}
                          onChange={(e) =>
                            updateReference(ref.id, "email", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="sarah@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contact Number
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-[#242428] border border-gray-500 rounded-l-lg px-3">
                            <img
                              src="https://flagcdn.com/w20/us.png"
                              alt="US Flag"
                              className="w-5 h-5"
                            />
                            <span className="text-gray-300">+1</span>
                          </div>
                          <input
                            type="tel"
                            value={ref.contactNumber}
                            onChange={(e) =>
                              updateReference(
                                ref.id,
                                "contactNumber",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-4 py-3 bg-[#242428] border border-gray-500 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="555-0198"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={ref.contactEmail}
                          onChange={(e) =>
                            updateReference(
                              ref.id,
                              "contactEmail",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#242428] border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="sarah.johnson@techsolutions.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addReference}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add another reference
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={isApplying}
              className="w-full px-6 py-3 cursor-pointer bg-[#6100FF] rounded-lg text-white font-medium text-lg transition-colors hover:bg-[#5200d9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
