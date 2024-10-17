import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import Layout from "../components/Layout/Layout";
import RealTimeClock from "../components/DiningTable/RealTimeClock";
import { Loader2 } from "lucide-react";
import Chairs from "@/components/Chairs/Chairs";

interface Chair {
  id: number;
  order:number;
  chair_name: string;
  customer_name: string | null;
  customer_mob: string | null;
  start_time: string | null;
  end_time: string | null;
  amount: number | null;
  is_active: boolean;
}

export default function ChairsPage() {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchChairs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<Chair[]>("/chairs/");
      console.log('response', response);
      setChairs(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching chairs:", error);
      setError("Error fetching chairs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChairs();
  }, [fetchChairs]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = async () => {
    await fetchChairs();
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className={`flex flex-col h-screen bg-gray-100 ${isModalOpen ? 'backdrop-blur-sm' : ''}`}>
        <header className="bg-white text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl text-black font-bold">Chairs</h1>
            <RealTimeClock />
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4 flex gap-4">
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-500 text-white p-4 rounded-lg">
                {error}
              </div>
            ) : chairs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {chairs.map((chair) => (
                  <Chairs
                    key={chair.id}
                    id={chair.id} 
                    order={chair.order}
                    chair_name={chair.chair_name}
                    customer_name={chair.customer_name ?? ''}
                    customer_mob={chair.customer_mob ?? ''}
                    start_time={chair.start_time ?? ''}
                    end_time={chair.end_time ?? ''}
                    amount={chair.amount ?? 0}
                    is_active={chair.is_active}
                    onModalOpen={handleModalOpen} 
                    onModalClose={handleModalClose}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4">
                No chairs available.
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}