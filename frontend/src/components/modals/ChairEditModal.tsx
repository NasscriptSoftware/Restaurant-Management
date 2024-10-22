import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { api } from '@/services/api';
import { parseISO, format } from 'date-fns';

interface ChairEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chair: {
    id: number;
    chair_name: string;
    customer_name: string | null;
    customer_mob: string | null;
    start_time: string;
    end_time: string;
    amount: string | number | null;
    is_active: boolean;
  };
  onUpdate: () => void;
}

export default function ChairEditModal({ isOpen, onClose, chair, onUpdate }: ChairEditModalProps) {
  const [formData, setFormData] = useState(chair);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else if (isOpen) {
      setFormData(chair);
    }
  }, [isOpen, chair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: string | boolean | number | null = value;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number') {
      newValue = value === '' ? null : Number(value);
    } else if (type === 'datetime-local') {
      newValue = value === '' ? null : new Date(value).toISOString();
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, update the chair
      const chairResponse = await api.put(`/chairs/${chair.id}/`, formData);
      
      // Then, update the order with the new chair details
      if (chairResponse.data.order) {
        const orderResponse = await api.get(`/orders/${chairResponse.data.order}/`);
        const orderData = orderResponse.data;
        
        // Calculate the new chair_amount
        const newChairAmount = orderData.chair_details.reduce((total: number, chair: any) => {
          return total + (parseFloat(chair.amount) || 0);
        }, 0);

        // Calculate the new total_amount
        const newTotalAmount = (parseFloat(orderData.total_amount) - parseFloat(orderData.chair_amount)) + newChairAmount;

        // Update the order with new chair_amount, total_amount, and chair_details
        await api.patch(`/orders/${chairResponse.data.order}/`, {
          chair_amount: newChairAmount.toFixed(2),
          total_amount: newTotalAmount.toFixed(2),
          chair_details: orderData.chair_details.map((chair: any) => ({
            ...chair,
            amount: parseFloat(chair.amount).toFixed(2)
          }))
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating chair and order:', error);
      // Add user feedback for error
      alert('An error occurred while updating the chair and order. Please try again.');
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '';
    const date = parseISO(dateTimeString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Edit Chair
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      id="customer_name"
                      value={formData.customer_name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer_mob" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Mobile
                    </label>
                    <input
                      type="text"
                      name="customer_mob"
                      id="customer_mob"
                      value={formData.customer_mob || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      name="start_time"
                      id="start_time"
                      value={formatDateTime(formData.start_time)}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      name="end_time"
                      id="end_time"
                      value={formatDateTime(formData.end_time)}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={formData.amount === null ? '' : formData.amount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
