import React from "react";
import { FaEdit } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import img1 from "../../assets/empty.jpg";

function Courses() {
  const navigate = useNavigate();
  const { creatorCourseData } = useSelector((state) => state.course);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full min-h-screen p-4 sm:p-6 bg-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-xl font-semibold">Courses</h1>
          </div>
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => navigate("/createcourses")}
          >
            Create Course
          </button>
        </div>

        {/* TABLE VIEW */}
        <div className="hidden md:block bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Course</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {creatorCourseData?.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No courses found</td></tr>
              ) : (
                creatorCourseData?.map((course) => (
                  <tr key={course._id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 flex items-center gap-4">
                      <img src={course.thumbnail || img1} alt="" className="w-14 h-14 object-cover rounded-md" />
                      <span>{course.title}</span>
                    </td>
                    <td className="py-3 px-4">₹{course.price || "NA"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${course.published ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <FaEdit className="text-gray-600 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/addcourses/${course._id}`)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden space-y-4">
          {creatorCourseData?.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
              <div className="flex gap-4 items-center">
                <img src={course.thumbnail || img1} alt="" className="w-16 h-16 rounded-md object-cover" />
                <div className="flex-1">
                  <h2 className="font-medium text-sm">{course.title}</h2>
                  <p className="text-gray-600 text-xs mt-1">₹{course.price || "NA"}</p>
                </div>
                <FaEdit className="text-gray-600 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/addcourses/${course._id}`)} />
              </div>
              <span className={`w-fit px-3 py-1 text-xs rounded-full ${course.published ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                {course.published ? "Published" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Courses;