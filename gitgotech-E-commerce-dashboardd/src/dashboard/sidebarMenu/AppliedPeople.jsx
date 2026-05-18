import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackHeader from '../../BackButton';
import baseUrl from '../../redux/api/baseUrl';
import { useGetApplicationPersonByJobQuery } from '../../redux/features/careerSlice/careerSlice';

const AppliedPeople = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  const { data: applicationData, isLoading, isError, refetch } = useGetApplicationPersonByJobQuery(jobId, { skip: !jobId });

  // Extract applications from API response
  const applications = applicationData?.data || [];
  const meta = applicationData?.meta || {};
  const apiTotalPages = meta?.totalPages || 1;

  // Filter by search
  const filteredApplicants = useMemo(() => {
    if (!searchText.trim()) return applications;
    const term = searchText.toLowerCase();
    return applications.filter((app) => {
      const name = app.userDetails?.name?.toLowerCase() || app.personalInfo?.fullName?.toLowerCase() || '';
      const email = app.userDetails?.email?.toLowerCase() || '';
      const location = app.personalInfo?.currentLocation?.toLowerCase() || '';
      return name.includes(term) || email.includes(term) || location.includes(term);
    });
  }, [applications, searchText]);

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openDetailModal = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setSelectedApplicant(null);
    setShowDetailModal(false);
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/40?text=U';
    if (image.startsWith('http')) return image;
    return `${baseUrl}/${image}`;
  };

  if (isLoading) {
    return <div className="text-white text-center py-10">Loading applications...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-10">Failed to load applications.</div>;
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <BackHeader title="Job Applications" />
        <input
          type="text"
          placeholder="Search by name, email, location..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          className="w-64 bg-purple-900/50 border border-purple-800 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f0c11] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Applications</p>
          <p className="text-2xl font-bold text-white">{applications.length}</p>
        </div>
        <div className="bg-[#0f0c11] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Filtered Results</p>
          <p className="text-2xl font-bold text-purple-400">{filteredApplicants.length}</p>
        </div>
        <div className="bg-[#0f0c11] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Job ID</p>
          <p className="text-sm font-mono text-gray-300">{jobId?.slice(-8) || 'N/A'}</p>
        </div>
      </div>

      {/* Applicants Table Card */}
      <div className="relative p-6 bg-[#0f0c11] rounded-xl overflow-hidden border border-gray-800">
        {/* Glow Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
              <th className="p-4 w-12">#</th>
              <th className="p-4">User</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Location</th>
              <th className="p-4">Applied Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplicants.length > 0 ? (
              paginatedApplicants.map((app, index) => {
                const userName = app.userDetails?.name || app.personalInfo?.fullName || 'N/A';
                const userEmail = app.userDetails?.email || 'N/A';
                const location = app.personalInfo?.currentLocation || 'N/A';
                return (
                  <tr key={app._id} className="border-b border-gray-800 hover:bg-[#15121a]">
                    <td className="p-4 text-gray-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={getImageUrl(app.userDetails?.image)}
                          alt={userName}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=U'; }}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-medium">{userName}</td>
                    <td className="p-4 text-gray-400">{userEmail}</td>
                    <td className="p-4 text-gray-400 text-sm">{location}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetailModal(app)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Application
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No applicants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="px-4 py-2 text-gray-400">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Application Modal */}
      {showDetailModal && selectedApplicant && (
        <ApplicationDetailModal applicant={selectedApplicant} onClose={closeModal} />
      )}
    </div>
  );
};

// Sub-component for the detail modal
const ApplicationDetailModal = ({ applicant, onClose }) => {
  const personalInfo = applicant.personalInfo || {};
  const workExperiences = applicant.workExperiences || [];
  const educations = applicant.educations || [];
  const certifications = applicant.certifications || [];
  const skills = applicant.skills || [];
  const languages = applicant.languages || [];
  const references = applicant.references || [];
  const jobDetails = typeof applicant.jobDetails === 'object' ? applicant.jobDetails : {};
  const userDetails = applicant.userDetails || {};

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/40?text=U';
    if (image.startsWith('http')) return image;
    return `${baseUrl}/${image}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0c11] rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Application Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg">
          <img
            src={getImageUrl(userDetails.image)}
            alt={userDetails.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=U'; }}
          />
          <div>
            <h3 className="text-lg font-semibold">{userDetails.name || personalInfo.fullName}</h3>
            <p className="text-gray-400 text-sm">{userDetails.email}</p>
            {jobDetails.title && <p className="text-gray-400 text-sm">Applied for: {jobDetails.title}</p>}
          </div>
        </div>

        {/* Personal Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-400">Personal Info</h3>
          <div className="space-y-2 text-sm bg-white/5 rounded-lg p-4">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Full Name:</span>
              <span className="font-medium">{personalInfo.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Phone Number:</span>
              <span className="font-medium">{personalInfo.phoneNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Current Location:</span>
              <span className="font-medium">{personalInfo.currentLocation || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">CV/Resume:</span>
              {personalInfo.cvResume ? (
                <a
                  href={getImageUrl(personalInfo.cvResume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium inline-block"
                >
                  View CV
                </a>
              ) : (
                <span className="text-gray-500">Not provided</span>
              )}
            </div>
            {personalInfo.tellUsWhyYouWantToJoinOurTeam && (
              <div className="pt-2">
                <span className="text-gray-400 block mb-1">Why join us:</span>
                <p className="font-medium text-gray-300">{personalInfo.tellUsWhyYouWantToJoinOurTeam}</p>
              </div>
            )}
          </div>
        </div>

        {/* Work Experience */}
        {workExperiences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Work Experience</h3>
            {workExperiences.map((work, idx) => (
              <div key={idx} className="space-y-2 text-sm bg-white/5 rounded-lg p-4 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Job Title:</span>
                  <span className="font-medium">{work.jobTitle || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Company:</span>
                  <span className="font-medium">{work.company || 'N/A'}</span>
                </div>
                {work.companyPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company Phone:</span>
                    <span className="font-medium">{work.companyPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="font-medium">{work.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium">
                    {work.startDate || 'N/A'} – {work.endDate || 'Present'}
                  </span>
                </div>
                {work.roleDescription && (
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1">Role Description:</span>
                    <p className="font-medium text-gray-300">{work.roleDescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Education</h3>
            {educations.map((edu, idx) => (
              <div key={idx} className="space-y-2 text-sm bg-white/5 rounded-lg p-4 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">School/University:</span>
                  <span className="font-medium">{edu.schoolOrUniversityName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Degree:</span>
                  <span className="font-medium">{edu.degree || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Field of Study:</span>
                  <span className="font-medium">{edu.fieldOfStudy || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grade:</span>
                  <span className="font-medium">{edu.overallResultGrade || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium">{edu.startYear || 'N/A'} – {edu.endYear || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Certifications</h3>
            <div className="space-y-2 text-sm">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between bg-white/5 rounded-lg p-4">
                  <span className="text-gray-400">{cert.certificateName || 'Certificate'}:</span>
                  {cert.file ? (
                    <a
                      href={getImageUrl(cert.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500 text-xs">No file</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm capitalize">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">References</h3>
            {references.map((ref, idx) => (
              <div key={idx} className="space-y-2 text-sm bg-white/5 rounded-lg p-4 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium">{ref.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Company:</span>
                  <span className="font-medium">{ref.companyName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium">{ref.contactEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-medium">{ref.contactNumber || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedPeople;
