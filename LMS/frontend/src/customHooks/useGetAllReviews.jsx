import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setAllReview } from "../redux/reviewSlice";

const useGetAllReviews = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/review/allReview`,
          { withCredentials: true }
        );

        dispatch(setAllReview(res.data));
      } catch (error) {
        console.log(
          "Fetch all reviews error:",
          error.response?.data || error
        );
      }
    };

    fetchAllReviews();
  }, [dispatch]);
};

export default useGetAllReviews;