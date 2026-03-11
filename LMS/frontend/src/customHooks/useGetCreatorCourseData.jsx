import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import { setCreatorCourseData } from "../redux/courseSlice";

const useGetCreatorCourseData = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
     console.log("userData:", userData?.role)
    // ✅ only educators can call this API
    if (!userData || userData.role !== "educator") return;

    const fetchCreatorCourses = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/course/getcreatorcourses`,
          { withCredentials: true }
        );
        console.log("full response:" ,res)
console.log("creator courses data:", res.data)
        dispatch(setCreatorCourseData(res.data));
      } catch (error) {
        console.log(
          "Fetch creator courses error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message || "Failed to load creator courses"
        );
      }
    };

    fetchCreatorCourses();
  }, [userData, dispatch]);
};

export default useGetCreatorCourseData;