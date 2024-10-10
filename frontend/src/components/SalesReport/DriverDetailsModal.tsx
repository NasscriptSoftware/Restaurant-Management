import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface DriverDetailsModalProps {
    driverId: string;
    closeModal: () => void;
}

interface Driver {
    id: number;
    username: string;
    email: string;
    mobile_number: string | null;
    is_active: boolean;
    is_available: boolean;
}

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driverId, closeModal }) => {
    const [driverDetails, setDriverDetails] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriverDetails = async () => {
            try {
                const response = await api.get(`/delivery-drivers/${driverId}`);
                setDriverDetails(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching driver details:", error);
                setLoading(false);
            }
        };

        fetchDriverDetails();
    }, [driverId]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                    onClick={closeModal}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center">Driver Details</h2>
                {loading ? (
                    <p className="text-gray-500 text-center">Loading...</p>
                ) : driverDetails ? (
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">ID:</span>
                            <span>{driverDetails.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Username:</span>
                            <span>{driverDetails.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{driverDetails.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Mobile Number:</span>
                            <span>{driverDetails.mobile_number || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Active:</span>
                            <span>{driverDetails.is_active ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Available:</span>
                            <span>{driverDetails.is_available ? "Yes" : "No"}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-red-600 text-center">No driver details found.</p>
                )}
                <div className="mt-6 text-center">
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        onClick={closeModal}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverDetailsModal;
