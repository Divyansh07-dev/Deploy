import React from 'react';
import { useNavigate } from 'react-router-dom';

// Valid free icons only
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import { SiReact, SiFigma, SiFlutter, SiPython, SiTensorflow, SiGooglecloud, SiTableau, SiOpenai } from 'react-icons/si';
import { TbDeviceDesktopAnalytics, TbBrandOpenai } from 'react-icons/tb';
import { FaShieldAlt } from 'react-icons/fa'; // for Ethical Hacking

function ExploreCourses() {
  const navigate = useNavigate();

  // Category data — easy to maintain/add more later
  const categories = [
    {
      name: 'Web Development',
      icon: <SiReact className="w-12 h-12 text-[#61DAFB]" />,
      bg: 'bg-[#e3f2fd]',
    },
    {
      name: 'UI/UX Designing',
      icon: <SiFigma className="w-12 h-12 text-[#F24E1E]" />,
      bg: 'bg-[#fce4ec]',
    },
    {
      name: 'App Development',
      icon: <SiFlutter className="w-12 h-12 text-[#02569B]" />,
      bg: 'bg-[#e8f5e9]',
    },
    {
      name: 'Ethical Hacking',
      icon: <FaShieldAlt className="w-12 h-12 text-[#d32f2f]" />,
      bg: 'bg-[#ffebee]',
    },
    {
      name: 'AI / Machine Learning',
      icon: <TbBrandOpenai className="w-12 h-12 text-[#10a37f]" />,
      bg: 'bg-[#e0f7fa]',
    },
    {
      name: 'Data Science',
      icon: <SiTensorflow className="w-12 h-12 text-[#FF6F00]" />,
      bg: 'bg-[#fff3e0]',
    },
    {
      name: 'Data Analytics',
      icon: <SiTableau className="w-12 h-12 text-[#e35200]" />,
      bg: 'bg-[#f3e5f5]',
    },
    {
      name: 'AI Tools',
      icon: <SiOpenai className="w-12 h-12 text-[#000000]" />,
      bg: 'bg-[#f5f5f5]',
    },
  ];

  return (
    <div className="w-full min-h-[50vh] lg:h-[50vh] flex flex-col lg:flex-row items-center justify-center gap-6 px-6 lg:px-16 py-12 bg-gradient-to-b from-gray-50 to-white">
      {/* Left - Text + CTA */}
      <div className="w-full lg:w-1/3 flex flex-col items-start justify-center gap-4 lg:pr-12">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Explore Our Courses
        </h2>
        <p className="text-lg text-gray-600 max-w-xl">
          Discover top-rated courses taught by industry experts. From beginner to advanced — start your learning journey today.
        </p>
        <button
          onClick={() => navigate('/allcourses')}
          className="mt-6 flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Explore All Courses
          <FaPlay className="w-5 h-5" />
        </button>
      </div>

      {/* Right - Category Cards Grid */}
      <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${cat.bg}`}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
              {cat.icon}
            </div>
            <span className="text-base font-medium text-gray-800 text-center">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreCourses;