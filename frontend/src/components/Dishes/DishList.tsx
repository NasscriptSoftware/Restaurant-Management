import React, { useState } from "react";
import DishItem from "./DishItem";
import { DishListProps } from "../../types";
import { motion } from 'framer-motion'
import { RadioGroup } from '@headlessui/react'

const DishList: React.FC<DishListProps> = ({ dishes, onAddDish }) => {
  const [showImage, setShowImage] = useState(true);
  const options = [
    { title: 'With Images', value: true },
    { title: 'Without Images', value: false },
  ]

  const handleAddDish = (dish: any) => {
    onAddDish(dish);
  };

  const handleChange = (value: boolean) => {
    setShowImage(value)
  }

  return (
    <div>
      <div className="w-full max-w-md mx-auto mb-5">
        <RadioGroup value={showImage} onChange={handleChange} className="mt-2">
          <RadioGroup.Label className="sr-only">
            Image display options
          </RadioGroup.Label>
          <div className="flex p-1 space-x-1 bg-white border rounded-xl">
            {options.map((option) => (
              <RadioGroup.Option
                key={option.title}
                value={option.value}
                className={({ active, checked }) =>
                  `${
                    active
                      ? "ring-2 ring-purple-500 ring-opacity-60 ring-offset-2 ring-offset-purple-300"
                      : ""
                  }
                ${checked ? "bg-purple-600 text-white" : "bg-white"}
                  relative flex-1 cursor-pointer rounded-lg px-5 py-3 focus:outline-none`
                }
              >
                {({ checked }) => (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium ${
                              checked ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {option.title}
                          </RadioGroup.Label>
                        </div>
                      </div>
                      {checked && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          layoutId="highlight"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {dishes.map((dish) => (
          <DishItem
            key={dish.id}
            dish={dish}
            onAddDish={handleAddDish}
            showImage={showImage}
          />
        ))}
      </div>
    </div>
  );
};

export default DishList;
