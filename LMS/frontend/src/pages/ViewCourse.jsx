import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeft, FaLock, FaPlay, FaStar } from "react-icons/fa";
import img from "../assets/empty.jpg";
import Card from "../components/Card.jsx";
import { setSelectedCourseData } from '../redux/courseSlice';
import { toast } from 'react-toastify';

function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courseData = [] } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);
  const { selectedCourseData } = useSelector((state) => state.course);

  const [creatorData, setCreatorData] = useState(null);
  const [selectedCreatorCourse, setSelectedCreatorCourse] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // ✅ Fetch full course by ID (includes populated lectures)
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/course/getcourse/${courseId}`,
          { withCredentials: true }
        );
        dispatch(setSelectedCourseData(res.data));
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Check if user is enrolled
  useEffect(() => {
    if (!userData?.enrolledCourses || !courseId) return;

    const enrolled = userData.enrolledCourses.some((c) => {
      const enrolledId = typeof c === 'string' ? c : c._id;
      return enrolledId?.toString() === courseId.toString();
    });

    setIsEnrolled(enrolled);
  }, [userData, courseId]);

  // Fetch creator info
  useEffect(() => {
  const creatorId = selectedCourseData?.creator?._id || selectedCourseData?.creator;
  console.log("CREATOR ID:", creatorId);
  
  if (!creatorId) return;

  const getCreator = async () => {
    try {
      console.log("Calling getcreator with:", creatorId);
      const result = await axios.post(
        `${serverUrl}/api/course/getcreator`,
        { userId: creatorId },
        { withCredentials: true }
      );
      setCreatorData(result.data);
    } catch (error) {
      console.error("Error fetching creator:", error.response?.data);
    }
  };

  getCreator();
}, [selectedCourseData]);

  // Other courses by same creator
  useEffect(() => {
    if (!creatorData?._id || courseData.length === 0) return;

    const creatorCourses = courseData.filter(
      (course) => course.creator === creatorData._id && course._id !== courseId
    );
    setSelectedCreatorCourse(creatorCourses);
  }, [creatorData, courseData, courseId]);

  const avgRating = selectedCourseData?.reviews?.length
    ? (selectedCourseData.reviews.reduce((sum, r) => sum + r.rating, 0) / selectedCourseData.reviews.length).toFixed(1)
    : "0.0";
const handleReview = async () => {
  if (!rating || !comment.trim()) {
    toast.warn("Please provide rating and comment");
    return;
  }

  try {
    await axios.post(
      `${serverUrl}/api/review/givereview`,
      { rating, comment, courseId, userId: userData._id }, // ✅ send userId
      { withCredentials: true }
    );
    toast.success("Review Added");
    setRating(0);
    setComment("");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add review");
  }
};
  

  const handleEnroll = async () => {
    if (!userData?._id) {
      toast.warn("Please login to enroll");
      return navigate("/login");
    }

    try {
      const orderData = await axios.post(
        `${serverUrl}/api/payment/create-order`,
        { courseId, userId: userData._id },
        { withCredentials: true }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "Virtual Courses",
        description: "Course Enrollment Payment",
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${serverUrl}/api/payment/verify-payment`,
              { ...response, courseId, userId: userData._id },
              { withCredentials: true }
            );
            setIsEnrolled(true);
            toast.success(verifyRes.data.message);
          } catch (verifyError) {
            toast.error("Payment verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Something went wrong while enrolling.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 relative">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <FaArrowLeft
              className="text-black w-[22px] h-[22px] cursor-pointer mb-4"
              onClick={() => navigate("/")}
            />
            <img
              src={selectedCourseData?.thumbnail || img}
              alt="Course Thumbnail"
              className="rounded-xl w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2 mt-[20px]">
            <h1 className="text-2xl font-bold">{selectedCourseData?.title || "Loading..."}</h1>
            <p className="text-gray-600">{selectedCourseData?.subTitle || ""}</p>

            <div className="flex items-start flex-col justify-between">
              <div className="text-yellow-500 font-medium">
                ⭐ {avgRating} <span className="text-gray-500">(reviews)</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-black">
                  ₹{selectedCourseData?.price || "0"}
                </span>{" "}
                <span className="line-through text-sm text-gray-400">₹599</span>
              </div>
            </div>

            <ul className="text-sm text-gray-700 space-y-1 pt-2">
              <li>✅ 10+ hours of video content</li>
              <li>✅ Lifetime access to course materials</li>
            </ul>

            {!isEnrolled ? (
              <button
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700 mt-3"
                onClick={() => handleEnroll(courseId, userData._id)}
              >
                Enroll Now
              </button>
            ) : (
              <button
                className="bg-green-200 text-green-600 px-6 py-2 rounded hover:bg-gray-100 hover:border mt-3"
                onClick={() => navigate(`/viewlecture/${courseId}`)}
              >
                Watch Now
              </button>
            )}
          </div>
        </div>

        {/* What You'll Learn */}
        <div>
          <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Learn {selectedCourseData?.category || "this topic"} from Beginning</li>
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <p className="text-gray-700">Basic programming knowledge is helpful but not required.</p>
        </div>

        {/* Who This Course Is For */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Who This Course is For</h2>
          <p className="text-gray-700">
            Beginners, aspiring developers, and professionals looking to upgrade skills.
          </p>
        </div>

        {/* Course Lectures */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white w-full md:w-2/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Course Curriculum</h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCourseData?.lectures?.length || 0} Lectures
            </p>

            <div className="flex flex-col gap-3">
              {selectedCourseData?.lectures?.length > 0 ? (
                selectedCourseData.lectures.map((lecture, index) => (
                  <button
                    key={index}
                    disabled={!lecture.isPreviewFree}
                    onClick={() => {
                      if (lecture.isPreviewFree) setSelectedLecture(lecture);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                      lecture.isPreviewFree
                        ? "hover:bg-gray-100 cursor-pointer border-gray-300"
                        : "cursor-not-allowed opacity-60 border-gray-200"
                    } ${
                      selectedLecture?.lectureTitle === lecture.lectureTitle
                        ? "bg-gray-100 border-gray-400"
                        : ""
                    }`}
                  >
                    <span className="text-lg text-gray-700">
                      {lecture.isPreviewFree ? <FaPlay /> : <FaLock />}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {lecture.lectureTitle}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No lectures available.</p>
              )}
            </div>
          </div>

          <div className="bg-white w-full md:w-3/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-black flex items-center justify-center">
              {selectedLecture?.videoUrl ? (
                <video
                  src={selectedLecture.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm">Select a preview lecture to watch</span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {selectedLecture?.lectureTitle || "Lecture Title"}
            </h3>
            <p className="text-gray-600 text-sm">{selectedCourseData?.title}</p>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => setRating(star)}
                  className={star <= rating ? "fill-yellow-500" : "fill-gray-300"}
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full border border-gray-300 rounded-lg p-2"
              rows="3"
            />
            <button
              className="bg-black text-white mt-3 px-4 py-2 rounded hover:bg-gray-800"
              onClick={handleReview}
            >
              Submit Review
            </button>
          </div>

          {/* Instructor Info */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <img
              src={creatorData?.photoUrl || img}
              alt="Instructor"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{creatorData?.name || "Instructor"}</h3>
              <p className="md:text-sm text-gray-600 text-[10px]">{creatorData?.description}</p>
              <p className="md:text-sm text-gray-600 text-[10px]">{creatorData?.email}</p>
            </div>
          </div>

          {/* Other courses */}
          <div>
            <p className="text-xl font-semibold mb-2">Other Published Courses by the Educator -</p>
            <div className="w-full transition-all duration-300 py-[20px] flex items-start justify-center lg:justify-start flex-wrap gap-6 lg:px-[80px]">
              {selectedCreatorCourse?.map((item, index) => (
                <Card
                  key={index}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  id={item._id}
                  price={item.price}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCourse;