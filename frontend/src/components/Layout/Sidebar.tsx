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
  ChevronRight,
  ChevronLeft,
  CalendarCheck ,
} from "lucide-react";
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
  calendarcheck: CalendarCheck,
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
  const [isOpen, setIsOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(() => {
    // Initialize isCompact from localStorage, default to false if not set
    const savedIsCompact = localStorage.getItem("sidebarCompact");
    return savedIsCompact ? JSON.parse(savedIsCompact) : false;
  });

  // Fetch menu items and logo
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get("/sidebar-items/");
        if (Array.isArray(response.data.results)) {
          const activeMenuItems = response.data.results.filter(
            (item: MenuItem) => item.active
          );
          setMenuItems(activeMenuItems);
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    const fetchLogoInfo = async () => {
      try {
        const response = await api.get("/logo-info/");
        if (response.data.results?.[0]?.main_logo) {
          setMainLogoUrl(response.data.results[0].main_logo);
        }
      } catch (error) {
        console.error("Failed to fetch logo info:", error);
      }
    };

    fetchMenuItems();
    fetchLogoInfo();
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setIsOpen(true);
        // Don't change isCompact here, let it be controlled by user preference
      } else if (width >= 768) {
        setIsOpen(true);
        setIsCompact(true);
      } else {
        setIsOpen(false);
        // Don't change isCompact here either
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update localStorage when isCompact changes
  useEffect(() => {
    localStorage.setItem("sidebarCompact", JSON.stringify(isCompact));
  }, [isCompact]);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleCompact = useCallback(() => {
    setIsCompact((prev: any) => !prev);
  }, []);

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
              className={`flex items-center justify-between p-3 rounded-lg touch-manipulation ${isActive(
                item.path
              )}`}
            >
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <IconComponent
                    className={`w-6 h-6 ${isCompact ? "mx-auto" : ""}`}
                  />
                )}
                {!isCompact && (
                  <span className="font-bold text-lg">{item.label}</span>
                )}
              </div>
              {!isCompact && location.pathname === item.path && (
                <ArrowRight className="w-6 h-6" />
              )}
            </Link>
          </TooltipTrigger>
          {isCompact && (
            <TooltipContent side="left" className="text-lg p-2 ">
              <p>{item.label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <Button
        onClick={toggleSidebar}
        variant="outline"
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-lg shadow-xl touch-manipulation"
        size="lg"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-300 shadow-lg z-40 overflow-y-auto invisible-scrollbar
              ${isCompact ? "w-20" : "w-80"} transition-all duration-300`}
          >
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                {!isCompact && (
                  <Link
                    to="/"
                    className="flex justify-center items-center w-full"
                  >
                    <img
                      src={mainLogoUrl}
                      alt="Logo"
                      className="max-h-[75px] w-auto object-contain"
                    />
                  </Link>
                )}
                <Button
                  onClick={toggleCompact}
                  variant="ghost"
                  className="p-2 hidden md:flex"
                >
                  {isCompact ? (
                    <ChevronRight className="w-6 h-6" />
                  ) : (
                    <ChevronLeft className="w-6 h-6" />
                  )}
                </Button>
              </div>

              {!isCompact && (
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <div className="bg-[#6f42c1] rounded-full p-2">
                    <UserRoundCheck size={28} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      Logged in as
                    </span>
                    <span className="text-lg font-bold text-[#6f42c1]">
                      {username || "Guest"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <nav className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="touch-manipulation">
                    {renderMenuItem(item)}
                  </div>
                ))}
              </nav>

              <div className="mt-6 border-t pt-4">
                <div className="space-y-3">
                  <Link
                    to="/notifications"
                    className={`relative flex items-center p-3 rounded-lg touch-manipulation ${isActive(
                      "/notifications"
                    )}`}
                  >
                    <Bell className="w-6 h-6" />
                    {!isCompact && (
                      <span className="ml-3 font-bold text-lg">
                        Notifications
                      </span>
                    )}
                    <NotificationBadge
                      className={`absolute ${
                        isCompact ? "top-2 right-2" : "top-3 right-3"
                      }`}
                    />
                  </Link>
                  <LogoutBtn isCompact={isCompact} />
                </div>
              </div>
            </div>

            {!isCompact && (
              <div className="p-4 border-t mt-auto">
                <a
                  href="https://nasscript.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <p className="text-gray-600 text-sm mb-1">Powered by</p>
                  <img
                    src="/images/nasscript_full_banner_logo.png"
                    alt="Logo"
                    className="h-6 w-auto"
                  />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
