import React, { useState, useEffect } from "react";
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
} from "lucide-react"; // Import the icons you'll use
import { motion, AnimatePresence } from "framer-motion";
import LogoutBtn from "./LogoutBtn";
import NotificationBadge from "./NotificationBadge";
import { api } from "@/services/api";

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
  armchair : Armchair,
};

interface MenuItem {
  id: number;
  path: string;
  icon: string;
  label: string;
  active: boolean;
}

const Sidebar: React.FC = () => {
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
        console.log('Menu items response:', response.data);
        
        // Check if we have results and set menu items
        if (Array.isArray(response.data.results)) {
          // Filter out inactive menu items
          const activeMenuItems = response.data.results.filter((item: MenuItem) => item.active);
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

  const toggleSidebar = () => setIsOpen(!isOpen);

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
              className={`flex items-center justify-between space-x-2 p-2 rounded ${isActive(item.path)}`}
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
                {location.pathname === item.path && <ArrowRight className="w-5 h-5" />}
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
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden bg-[#6f42c1] text-white p-2 rounded-md shadow-md hover:bg-[#5a32a3] transition-colors duration-200"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
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
              <Link to="/" className="flex justify-center md:justify-start" onClick={() => setIsOpen(false)}>
                <img src={mainLogoUrl} alt="Logo" className="h-8 w-auto" />
              </Link>
              <button
                onClick={toggleSidebar}
                className="lg:hidden bg-[#6f42c1] text-white p-2 rounded-md shadow-md hover:bg-[#5a32a3] transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/notifications"
                          className={`relative flex items-center space-x-2 p-2 mr-2 rounded ${isActive(
                            "/notifications"
                          )}`}
                        >
                          <Bell className="w-6 h-6" />
                          <NotificationBadge className="absolute -top-1 -right-1" />
                          <span className="font-bold">Notifications</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
              <img src="/images/nasscript_full_banner_logo.png" alt="Logo" className="h-5 w-auto" />
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
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
