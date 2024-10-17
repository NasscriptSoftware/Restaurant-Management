import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

// Define the Option type
interface Option {
  id: string | number;
  name: string;
  price: number;
}

// Define the props for the AddOptionsModal component
interface AddOptionsModalProps {
  onClose: () => void;
  onSubmit: (options: { option: Option; quantity: number }[]) => void;
}

const AddOptionsModal: React.FC<AddOptionsModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [optionSearch, setOptionSearch] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Option[]>([]);
  const [addedOptions, setAddedOptions] = useState<
    { option: Option; quantity: number }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (optionSearch.length > 1) {
        try {
          const response = await api.get(
            `search-options/?search=${optionSearch}`
          );
          if (response && response.data && response.data.results) {
            setSuggestions(response.data.results);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error fetching option suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [optionSearch]);

  const handleAddOption = (option: Option) => {
    setAddedOptions((prevOptions) => {
      const existingOption = prevOptions.find(
        (item) => item.option.id === option.id
      );

      if (existingOption) {
        return prevOptions.map((item) =>
          item.option.id === option.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevOptions, { option, quantity: 1 }];
      }
    });

    setOptionSearch("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setAddedOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index].quantity = Math.max(quantity, 1);
      return updatedOptions;
    });
  };

  const handleRemoveOption = (index: number) => {
    setAddedOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const totalValue = addedOptions.reduce(
      (sum, item) => sum + item.quantity * item.option.price,
      0
    );
    setTotalAmount(totalValue);
  };

  useEffect(() => {
    calculateTotal();
  }, [addedOptions]);

  const handleFinalSubmit = () => {
    onSubmit(addedOptions);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add FOC to Order</DialogTitle>
          <DialogDescription>
            Search and add options to your order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="option-search"
              value={optionSearch}
              ref={inputRef}
              onChange={(e) => setOptionSearch(e.target.value)}
              placeholder="Search option..."
              className="col-span-3 w-[100%]"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="border rounded mb-4 max-h-40 overflow-y-auto col-span-3 col-start-2">
              {suggestions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleAddOption(option)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {option.name} - QAR {option.price}
                </li>
              ))}
            </ul>
          )}
          {addedOptions.length > 0 && (
            <div className="col-span-4">
              <h4 className="text-sm font-medium mb-2">Added Options:</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Option</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addedOptions.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.option.name}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                index,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 text-center"
                            min="1"
                          />
                        </td>
                        <td className="p-2">QAR {item.option.price}</td>
                        <td className="p-2">
                          QAR {(item.quantity * item.option.price).toFixed(2)}
                        </td>
                        <td className="p-2">
                          <Button
                            onClick={() => handleRemoveOption(index)}
                            variant="destructive"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <span className="text-lg font-semibold">
              Total: QAR {totalAmount.toFixed(2)}
            </span>
            <div className="flex space-x-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleFinalSubmit} variant="default">
                Add to Order
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionsModal;
