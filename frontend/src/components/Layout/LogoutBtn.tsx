import { logout } from "@/features/slices/authSlice";
import { logout as logoutAPI} from "@/services/api";
import { LogOutIcon } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const LogoutBtn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await logoutAPI({ refresh_token: refreshToken });
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        dispatch(logout())
        navigate("/login");
      }
    } catch (error) {
      console.error(`Failed to log out: ${error}`);
    }
  };

  return (
    <button className="w-full flex items-center space-x-2 px-3 hover:text-red-500 cursor-pointer mt-2 justify-start py-1 rounded-md focus:outline-none font-bold"
    onClick={handleLogout}
      >
        <LogOutIcon />
        <p>Logout</p>
    </button>
  );
};

export default LogoutBtn;
