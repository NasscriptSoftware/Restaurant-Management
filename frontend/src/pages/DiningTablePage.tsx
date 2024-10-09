import { useState, useEffect } from "react";
import { api } from "@/services/api";
import Layout from "../components/Layout/Layout";
import Table from "../components/DiningTable/Table";
import FloorSelector from "../components/DiningTable/FloorSelector";
import RealTimeClock from "../components/DiningTable/RealTimeClock";
import { Loader2 } from "lucide-react";

interface Table {
  id: number;
  table_name: string;
  start_time: string;
  end_time: string;
  seats_count: number;
  capacity: number;
  is_ready: boolean;
}

export default function DiningTablePage() {
  const [selectedFloor, setSelectedFloor] = useState<string>(''); // Selected floor as a string
  const [floors, setFloors] = useState<string[]>([]); // Array of floor names
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const response = await api.get<string[]>('/floors'); 
        setFloors(response.data);
        
        if (response.data.length > 0) {
          setSelectedFloor(response.data[0]); // Set the first floor as the default
        }
      } catch (error) {
        console.error("Error fetching floors:", error);
        setError("Error fetching floors.");
      }
    };

    fetchFloors();
  }, []);

  const fetchTables = async () => {
    if (selectedFloor) { 
      setLoading(true);
      try {
        const response = await api.get<{ results: Table[] }>(`/tables?floor=${selectedFloor}`);
        console.log('response', response);
        
        setTables(response.data.results);
        setError(null);
      } catch (error) {
        console.error("Error fetching tables:", error);
        setError("Error fetching tables.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTables();
  }, [selectedFloor]);

  const handleFloorChange = (floorName: string) => { // Accept floor name
    setSelectedFloor(floorName); // Update selectedFloor with the floor name
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = async () => {
    await fetchTables(); 
    setIsModalOpen(false); 
  };

  const formatTime = (time: string): string => {
    const [hourString, minuteString] = time.split(":");
    const hour = parseInt(hourString, 10);
    const minute = minuteString.substring(0, 2);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Format hour to 12-hour format

    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <Layout>
      <div className={`flex flex-col h-screen bg-gray-100 ${isModalOpen ? 'backdrop-blur-sm' : ''}`}>
        <header className="bg-white text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl text-black font-bold">Dining Table</h1>
            <RealTimeClock />
          </div>
          <div className="mt-4">
            <FloorSelector floors={floors} onFloorChange={handleFloorChange} />
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
            ) : tables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <Table
                    key={table.id}
                    id={table.id}
                    name={table.table_name}
                    startTime={formatTime(table.start_time)} // Format start time
                    endTime={formatTime(table.end_time)} // Format end time
                    seatsCount={table.seats_count}
                    capacity={table.capacity}
                    isReady={table.is_ready}
                    onModalOpen={handleModalOpen}
                    onModalClose={handleModalClose}
                    onUpdate={handleUpdate} // Pass the handleUpdate function
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4">
                No tables available for the selected floor.
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
