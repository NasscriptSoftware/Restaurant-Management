import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bell,
  LayoutDashboard,
  Settings,
  FileText,
  Receipt,
  HandPlatter,
  House,
  UtensilsCrossed,
  ScrollText,
  ArrowRight,
  Users,
  Salad,
  ArrowRightLeft,
  ChartColumn,
  CalendarRange,
  Armchair,
  Menu,
  UserRoundCheck,
  X,
} from "lucide-react"; // Import the icons you'll use
import { motion, AnimatePresence } from "framer-motion";
import LogoutBtn from "./LogoutBtn";
import NotificationBadge from "./NotificationBadge";
import { api } from "@/services/api";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";
import { Button } from "../ui/button";

const iconMap = {
  bell: Bell,
  layoutdashboard: LayoutDashboard,
  settings: Settings,
  filetext: FileText,
  receipt: Receipt,
  handplatter: HandPlatter,
  house: House,
  utensilscrossed: UtensilsCrossed,
  scrolltext: ScrollText,
  arrowright: ArrowRight,
  users: Users,
  salad: Salad,
  arrowrightleft: ArrowRightLeft,
  chartcolumn: ChartColumn,
  calendarrange: CalendarRange,
  armchair: Armchair,
};

interface MenuItem {
  id: number;
  path: string;
  icon: string;
  label: string;
  active: boolean;
}

const Sidebar: React.FC = () => {
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [mainLogoUrl, setMainLogoUrl] = useState<string>(
    "/images/nasscript_full_banner_logo.png"
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get("/sidebar-items/"); // Ensure this returns all items
        console.log("Menu items response:", response.data);

        // Check if we have results and set menu items
        if (Array.isArray(response.data.results)) {
          // Filter out inactive menu items
          const activeMenuItems = response.data.results.filter(
            (item: MenuItem) => item.active
          );
          setMenuItems(activeMenuItems);
        } else {
          console.error("Menu items response is not an array");
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    const fetchLogoInfo = async () => {
      try {
        const response = await api.get("/logo-info/");
        if (response.data.results && response.data.results.length > 0) {
          const logoInfo = response.data.results[0];
          if (logoInfo.main_logo) {
            setMainLogoUrl(logoInfo.main_logo);
          }
        }
      } catch (error) {
        console.error("Failed to fetch logo info:", error);
      }
    };

    fetchMenuItems();
    fetchLogoInfo();
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prevState => !prevState);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-[#6f42c1] text-white transition-all"
      : "hover:bg-[#6f42c1] hover:text-white";
  };

  const renderMenuItem = (item: MenuItem) => {
    const iconKey = item.icon.toLowerCase() as keyof typeof iconMap;
    const IconComponent = iconMap[iconKey];

    return (
      <TooltipProvider key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.path}
              className={`flex items-center justify-between space-x-2 p-2 rounded ${isActive(
                item.path
              )}`}
            >
              <div className="flex gap-2 items-center">
                {IconComponent ? (
                  <IconComponent className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5 text-gray-400">❓</div>
                )}
                <span className="font-bold">{item.label}</span>
              </div>
              <span className="flex text-end">
                {location.pathname === item.path && (
                  <ArrowRight className="w-5 h-5" />
                )}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="md:hidden">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <Button
        onClick={toggleSidebar}
        variant="outline"
        className="fixed top-4 left-4 z-0 lg:hidden p-2 rounded-md shadow-xl"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-64 bg-white p-4 h-screen border-r border-gray-300 flex flex-col z-40 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="flex justify-center md:justify-start"
                onClick={closeSidebar}
              >
                <img src={mainLogoUrl} alt="Logo" className="h-8 w-auto" />
              </Link>

              <button
                onClick={closeSidebar}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-100 rounded-lg">
              <div className="bg-[#6f42c1] rounded-full p-2">
                <UserRoundCheck size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Logged in as</span>
                <span className="text-base font-bold text-[#6f42c1]"> {username || 'Guest'}</span>
              </div>
            </div>

            <div className="flex-grow mr-2">
              <nav>
                <ul className="space-y-2">
                  {Array.isArray(menuItems) && menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <li key={item.id} onClick={() => setIsOpen(false)}>
                        {renderMenuItem(item)}
                      </li>
                    ))
                  ) : (
                    <p>No menu items available</p>
                  )}
                </ul>
              </nav>
            </div>
            <div className="mt-6">
              <h3 className="text-md text-black-500 mb-2 font-bold">Other</h3>
              <ul>
                <li onClick={() => setIsOpen(false)}>
                  <Link
                    to="/notifications"
                    className={`relative flex items-center space-x-2 p-2 mr-2 rounded ${isActive(
                      "/notifications"
                    )}`}
                  >
                    <Bell className="w-6 h-6" />
                    <span className="font-bold">Notifications</span>
                    <NotificationBadge className="absolute top-2 right-3" />
                  </Link>
                </li>
                <li onClick={() => setIsOpen(false)}>
                  <LogoutBtn />
                </li>
              </ul>
            </div>
            <a
              href="https://nasscript.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex justify-center items-center flex-col"
            >
              <p className="text-black-600 text-md font-bold">Powered by</p>
              <img
                src="/images/nasscript_full_banner_logo.png"
                alt="Logo"
                className="h-5 w-auto"
              />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
