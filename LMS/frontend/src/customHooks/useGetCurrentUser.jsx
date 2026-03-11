import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // add this

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/currentuser`, { withCredentials: true });
        dispatch(setUserData(res.data));
      } catch (error) {
        console.log("Get current user error:", error);
      } finally {
        setLoading(false); // always stop loading
      }
    };
    fetchUser();
  }, [dispatch]);

  return { loading }; // return it
};

export default useGetCurrentUser;