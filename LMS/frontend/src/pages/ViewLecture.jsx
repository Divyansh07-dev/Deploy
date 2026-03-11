import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../App';

function ViewLecture() {
  const { courseId } = useParams();
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  console.log("selectedLecture:", selectedLecture)

  // ✅ Fetch full course with populated lectures
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/course/getcourse/${courseId}`,
          { withCredentials: true }
        );
        setSelectedCourse(res.data);
        // Auto-select first lecture
        if (res.data?.lectures?.length > 0) {
          setSelectedLecture(res.data.lectures[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const courseCreator = userData?._id === selectedCourse?.creator?.toString() ? userData : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6">
      {/* Left - Video & Course Info */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center justify-start gap-5 text-gray-800">
            <FaArrowLeft
              className="text-black w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/")}
            />
            {selectedCourse?.title || "Course Title"}
          </h1>

          <div className="mt-2 flex gap-4 text-sm text-gray-500 font-medium">
            <span>Category: {selectedCourse?.category || "N/A"}</span>
            <span>Level: {selectedCourse?.level || "Beginner"}</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-300">
          {selectedLecture?.videoUrl ? (
            <video
              src={selectedLecture.videoUrl}
              controls
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-center p-4">
              Select a lecture to start watching
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedLecture?.lectureTitle || "No lecture selected"}
          </h2>
        </div>
      </div>

      {/* Right - All Lectures + Creator Info */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-md p-6 border border-gray-200 h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800">All Lectures</h2>
        <div className="flex flex-col gap-3 mb-6">
          {selectedCourse?.lectures?.length > 0 ? (
            selectedCourse.lectures.map((lecture, index) => (
              <button
                key={index}
                onClick={() => setSelectedLecture(lecture)}
                className={`flex items-center justify-between p-3 rounded-lg border transition text-left ${
                  selectedLecture?._id === lecture._id
                    ? 'bg-gray-200 border-gray-500'
                    : 'hover:bg-gray-50 border-gray-300'
                }`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {lecture.lectureTitle}
                  </h4>
                </div>
                <FaPlay className="text-black text-xl" />
              </button>
            ))
          ) : (
            <p className="text-gray-500">No lectures available.</p>
          )}
        </div>

        {/* Creator Info */}
        {courseCreator && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Instructor</h3>
            <div className="flex items-center gap-4">
              <img
                src={courseCreator.photoUrl || '/default-avatar.png'}
                alt="Instructor"
                className="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <h4 className="text-base font-medium text-gray-800">
                  {courseCreator.name || "You"}
                </h4>
                <p className="text-sm text-gray-600">
                  {courseCreator.description || "Course creator"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewLecture;