interface DeveloperOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOptionSelect: (options: { [key: string]: boolean }) => void;
    selectedMenuItems: { [key: string]: boolean }; // New prop to hold current selections
  }
  
  const DeveloperOptionModal: React.FC<DeveloperOptionModalProps> = ({
    isOpen,
    onClose,
    onOptionSelect,
    selectedMenuItems, // Destructure the new prop
  }) => {
    if (!isOpen) return null;
  
    const handleChange = (option: string) => {
      onOptionSelect({
        ...selectedMenuItems,
        [option]: !selectedMenuItems[option], // Toggle the checked state
      });
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white lg:max-w-lg p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Developer Options</h2>
          <div>
            {Object.keys(selectedMenuItems).map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMenuItems[option] || false} // Check if option is selected
                    onChange={() => handleChange(option)}
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="mt-4 bg-blue-500 text-white p-2 rounded">
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default DeveloperOptionModal;
  