import LogoutBtn from "./LogoutBtn";

export const DeliveryDriverHeader = () => {
  return (
    <header className="w-full flex gap-2 justify-between items-center">
      <div className="flex items-center">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="hidden sm:block h-8 w-auto"
        />
        <img
          src="/images/nasscript_company_logo.jpg"
          alt="Logo"
          className="block sm:hidden h-16 w-auto"
        />
      </div>
      <div className="flex justify-end">
        <LogoutBtn />
      </div>
    </header>
  );
};
