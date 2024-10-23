import Sidebar from './Sidebar';

const Layout = ({ children }: { children: any }) => {
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto ">
          <div className="container mx-auto px-6 py-12 sm:py-16 md:py-12 lg:py-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
