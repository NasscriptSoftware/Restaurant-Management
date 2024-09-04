import { Floor } from "@/pages/DiningTablePage";
import React from "react";

export type FloorName = "Ground floor" | "1st Floor" | "2nd floor" | "3rd floor";

export const initialFloors: FloorName[] = ["Ground floor", "1st Floor", "2nd floor", "3rd floor"];

interface FloorSelectorProps {
  floors: Floor[];
  onFloorChange: (floor: FloorName) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({ floors, onFloorChange }) => {
  const [selectedFloor, setSelectedFloor] = React.useState<Floor>();

  const handleFloorClick = (floor: Floor) => {
    setSelectedFloor(selectedFloor);
    onFloorChange(floor.name);
  };

  return (
    <div className="w-1/4 bg-[#6a0dad] p-4 rounded-lg text-white space-y-4">
      <button 
        className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 py-2 px-4 rounded-full w-full mb-4"
        onClick={() => {}}
      >
        New
      </button>
      <ul className="space-y-2">
        {floors.map((floor) => (
          <li
            key={floor.id}
            className={`cursor-pointer p-2 rounded ${selectedFloor === floor ? 'bg-purple-900' : 'bg-purple-700'}`}
            onClick={() => handleFloorClick(floor)}
          >
            {floor.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FloorSelector;
