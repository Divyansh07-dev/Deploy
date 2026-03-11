import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setCourseData } from "../redux/courseSlice.js";

const useGetCourseData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("useGetCourseData → hook mounted, starting fetch...");

    const fetchPublishedCourses = async () => {
      try {
        const url = `${serverUrl}/api/course/getpublishedcoures`; // keep your current url
        console.log("Sending GET request to:", url);

        const res = await axios.get(url, { withCredentials: true });

        console.log("Response status:", res.status);
        console.log("Response data type:", typeof res.data);
        console.log("Response data length:", res.data?.length ?? "no length");
        console.log("First item (if exists):", res.data?.[0] ?? "empty");

        dispatch(setCourseData(res.data || []));
        console.log("Dispatched setCourseData with length:", res.data?.length ?? 0);
      } catch (error) {
        console.error("=== FETCH COURSES FAILED ===");
        console.error("Error message:", error.message);
        if (error.response) {
          console.error("Status code:", error.response.status);
          console.error("Server reply:", error.response.data);
        } else if (error.request) {
          console.error("No response received - possible CORS / network issue");
          console.error("Request details:", error.request);
        }
      }
    };

    fetchPublishedCourses();
  }, [dispatch]);

  // Optional: you can return loading/error if you want later
};

export default useGetCourseData;