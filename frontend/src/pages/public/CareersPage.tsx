import { Briefcase, MapPin, Clock } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const CareersPage = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Graphic Designer',
      department: 'Design',
      location: 'Jakarta Selatan',
      type: 'Full-time',
      description: 'Looking for an experienced graphic designer with a strong portfolio in print media and packaging design.'
    },
    {
      id: 2,
      title: 'Production Operator',
      department: 'Production',
      location: 'Jakarta Selatan',
      type: 'Full-time',
      description: 'Operate and maintain digital and offset printing machines. Ensure high quality output and meet production targets.'
    },
    {
      id: 3,
      title: 'B2B Sales Executive',
      department: 'Sales',
      location: 'Hybrid / Jakarta',
      type: 'Full-time',
      description: 'Drive growth by acquiring new corporate clients and managing existing key accounts in the enterprise sector.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Join Our Team</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Help us shape the future of enterprise printing. We're always looking for passionate individuals to join our growing company.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Innovation Driven</h3>
            <p className="text-gray-600">We use cutting-edge technology and constantly improve our processes.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Great Culture</h3>
            <p className="text-gray-600">A collaborative, inclusive, and supportive environment where your ideas matter.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Growth & Learning</h3>
            <p className="text-gray-600">Continuous training and clear career progression paths for all employees.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Briefcase size={16} weight="regular" /> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={16} weight="regular" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={16} weight="regular" /> {job.type}</span>
                </div>
                <p className="text-gray-600 mt-4 max-w-3xl">{job.description}</p>
              </div>
              <div className="shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors w-full md:w-auto">
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-primary-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Don't see a fit?</h2>
        <p className="text-gray-600 mb-6">We're always looking for talent. Send your resume to careers@mkprinting.com and we'll keep you in mind for future openings.</p>
      </div>
    </div>
  );
};
