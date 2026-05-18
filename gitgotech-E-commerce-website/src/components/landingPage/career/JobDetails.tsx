"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import { RiTimeZoneLine } from 'react-icons/ri';
import { useGetCareerDetailsQuery, useGetCareersQuery } from '@/redux/features/career/careerSlice';

export default function JobDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');

  const { data: jobDetailsData, isLoading } = useGetCareerDetailsQuery(jobId || '', {
    skip: !jobId,
  });

  const { data: allJobsData } = useGetCareersQuery({ page: 1, limit: 10 });
  const similarJobs = (allJobsData?.data || []).filter((j: any) => j._id !== jobId).slice(0, 3);

  const job = jobDetailsData?.data;

  const handleApplyNow = () => {
    router.push(`/careers/apply-job?id=${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-400">Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>Job not found</p>
          <button onClick={() => router.push('/careers')} className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-black text-white">

      {/* ── Hero Banner ── */}
      <div className="relative w-full h-52 md:h-[400] overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute  inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/apply.png')`,
          }}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/60 to-black/80" />
        {/* Job title overlay at bottom-left */}
        <div className="absolute bottom-0 container mx-auto left-0 right-0 px-6 md:px-10 py-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-white" />
                {job.country}{job.address ? ` ${job.address}` : ''}
              </span>
              <span className="flex items-center gap-1.5 bg-blue-700/60 px-2 py-0.5 rounded text-xs">
                <RiTimeZoneLine size={14} />
                {job.jobType}
              </span>
            </div>
          </div>
          {/* Apply Now button — navigates to apply page */}
          <button
            onClick={handleApplyNow}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </button>

        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Left: Job Description ── */}
          <div className="flex-1 min-w-0">
            {/* Position Overview */}
            <Section title="Position Overview">
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </Section>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Section title="Key Responsibilities">
                <ul className="space-y-1.5">
                  {job.responsibilities.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <Section title="Qualifications & Requirements">
                <ul className="space-y-1.5">
                  {job.qualifications.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Salary */}
            <Section title="Salary">
              <p className="text-gray-400 text-sm">{job.salary}</p>
            </Section>

            {/* Application Deadline */}
            {job.deadline && (
              <Section title="Application Deadline">
                <p className="text-gray-400 text-sm">
                  {new Date(job.deadline).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </Section>
            )}
          </div>

          {/* ── Right: See Similar Jobs ── */}
          <aside className="w-full md:w-72 shrink-0">
            <h2 className="text-base font-semibold text-white mb-4">See Similar Jobs</h2>
            <div className="space-y-4">
              {similarJobs.length === 0 ? (
                <p className="text-gray-500 text-sm">No similar jobs found.</p>
              ) : (
                similarJobs.map((sj: any) => (
                  <div key={sj._id}
                    className="bg-[#111111] border border-gray-800 rounded-xl p-4 hover:border-purple-500/40 transition-all duration-300">
                    <h3 className="text-sm font-semibold text-white mb-2 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                      {sj.title}
                    </h3>
                    <div className="space-y-1 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-white" />
                        {sj.country}{sj.address ? ` ${sj.address}` : ''}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RiTimeZoneLine size={12} className="text-white" />
                        {sj.jobType}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{sj.description}</p>
                    <button
                      onClick={() => router.push(`/careers/job-details?id=${sj._id}`)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                      View Details
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-7">
    <h2 className="text-base font-semibold text-black dark:text-white mb-3"
      style={{ color: '#fff' }}>{title}</h2>
    {children}
  </div>
);
