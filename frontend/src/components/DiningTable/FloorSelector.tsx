import React from "react";

interface FloorSelectorProps {
  floors: string[];
  onFloorChange: (floor: string) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({ floors, onFloorChange }) => {
  const [selectedFloor, setSelectedFloor] = React.useState<string>(floors[0]);

  const handleFloorClick = (floor: string) => {
    setSelectedFloor(floor);
    onFloorChange(floor);
  };

  return (
    <div className="flex space-x-4">
      {floors.map((floor) => (
        <div
          key={floor}
          className={`cursor-pointer p-2 rounded ${selectedFloor === floor ? 'bg-purple-900 text-white' : 'bg-purple-700 text-white'}`}
          onClick={() => handleFloorClick(floor)}
        >
          {floor}
        </div>
      ))}
    </div>
  );
};

export default FloorSelector;
