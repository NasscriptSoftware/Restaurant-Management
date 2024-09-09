import React, { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';
import axios from 'axios'; // Ensure axios is imported
import { api } from "@/services/api"; // Ensure this file is correctly configured

interface NameSection {
    id: number;
    optionName: string;
    profitLoss: string;
    percentage: string;
    category: string; // This will be a text input if a user is selected
    amount: string;
}

interface ShareUser {
    id: number;
    name: string;
    category: string; // Assuming category is part of ShareUser
    profitlose_share: string; // Add this field to hold profit/loss share percentage
}

const ProfitLossShareTransaction: React.FC = () => {
    const [commonFields, setCommonFields] = useState({
        date: '',
        periodFrom: '',
        periodTo: ''
    });

    const [nameSections, setNameSections] = useState<NameSection[]>([
        {
            id: Date.now(),
            optionName: '',
            profitLoss: '',
            percentage: '',
            category: '',
            amount: ''
        }
    ]);

    const [shareUsers, setShareUsers] = useState<ShareUser[]>([]);

    useEffect(() => {
        const fetchShareUsers = async () => {
            try {
                const response = await api.get('/share-user-management/');
                // Ensure response data is an array
                if (Array.isArray(response.data.results)) {
                    setShareUsers(response.data.results);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Error fetching share users:', error.response ? error.response.data : error.message);
                } else {
                    console.error('Unexpected Error:', error);
                }
            }
        };

        fetchShareUsers();
    }, []);

    const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCommonFields({ ...commonFields, [name]: value });
    };

    const handleSectionChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedSections = nameSections.map(section => {
            if (section.id === id) {
                if (name === 'optionName') {
                    // Find the selected user
                    const selectedUser = shareUsers.find(user => user.id === Number(value));
                    return {
                        ...section,
                        [name]: value,
                        category: selectedUser ? selectedUser.category : section.category,
                        percentage: selectedUser ? selectedUser.profitlose_share : section.percentage
                    };
                }
                return { ...section, [name]: value };
            }
            return section;
        });
        setNameSections(updatedSections);
    };

    const addNameSection = () => {
        setNameSections([
            ...nameSections,
            {
                id: Date.now(),
                optionName: '',
                profitLoss: '',
                percentage: '',
                category: '',
                amount: ''
            }
        ]);
    };

    const removeNameSection = (id: number) => {
        setNameSections(nameSections.filter(section => section.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Prepare data for submission
        const data = {
            created_date: commonFields.date,
            period_from: commonFields.periodFrom,
            period_to: commonFields.periodTo,
            percentage: "", // Ensure this is included if required
            amount: "", // Ensure this is included if required
            share_users: nameSections.map(section => ({
                share_user: section.optionName, // Ensure optionName is correct
                profit_lose: section.profitLoss,
                percentage: section.percentage,
                amount: section.amount
            }))
        };

        try {
            const response = await api.post('/profit-loss-share-transactions/', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Success:', response.data);
            // Reset form or provide feedback
            setCommonFields({ date: '', periodFrom: '', periodTo: '' });
            setNameSections([
                {
                    id: Date.now(),
                    optionName: '',
                    profitLoss: '',
                    percentage: '',
                    category: '',
                    amount: ''
                }
            ]);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error submitting data:', error.response ? error.response.data : error.message);
            } else {
                console.error('Unexpected Error:', error);
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profit Loss Share Transaction</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="border p-4 rounded-md shadow-sm">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={commonFields.date}
                            onChange={handleCommonChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <div className="flex-1">
                            <label htmlFor="periodFrom" className="block text-sm font-medium text-gray-700">Period From:</label>
                            <input
                                type="date"
                                id="periodFrom"
                                name="periodFrom"
                                value={commonFields.periodFrom}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="periodTo" className="block text-sm font-medium text-gray-700">Period To:</label>
                            <input
                                type="date"
                                id="periodTo"
                                name="periodTo"
                                value={commonFields.periodTo}
                                onChange={handleCommonChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Dynamic Name Sections */}
                {nameSections.map((section) => (
                    <div key={section.id} className="border p-4 rounded-md shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor={`optionName-${section.id}`} className="block text-sm font-medium text-gray-700">Name:</label>
                                <select
                                    id={`optionName-${section.id}`}
                                    name="optionName"
                                    value={section.optionName}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">Select a name</option>
                                    {Array.isArray(shareUsers) && shareUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label htmlFor={`profitLoss-${section.id}`} className="block text-sm font-medium text-gray-700">Profit/Loss:</label>
                                <select
                                    id={`profitLoss-${section.id}`}
                                    name="profitLoss"
                                    value={section.profitLoss}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="">Select Profit or Loss</option>
                                    <option value="Profit">Profit</option>
                                    <option value="Loss">Loss</option>
                                </select>
                            </div>

                            <div className="flex-1">
                                <label htmlFor={`percentage-${section.id}`} className="block text-sm font-medium text-gray-700">Percentage:</label>
                                <input
                                    type="number"
                                    id={`percentage-${section.id}`}
                                    name="percentage"
                                    value={section.percentage}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>

                            {/* Conditionally render category input */}
                            {section.optionName ? (
                                <div className="flex-1">
                                    <label htmlFor={`category-${section.id}`} className="block text-sm font-medium text-gray-700">Category:</label>
                                    <input
                                        type="text"
                                        id={`category-${section.id}`}
                                        name="category"
                                        value={section.category}
                                        onChange={(e) => handleSectionChange(section.id, e)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <label htmlFor={`category-${section.id}`} className="block text-sm font-medium text-gray-700">Category:</label>
                                    <input
                                        type="text"
                                        id={`category-${section.id}`}
                                        name="category"
                                        value={section.category}
                                        onChange={(e) => handleSectionChange(section.id, e)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        placeholder="Enter category"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <label htmlFor={`amount-${section.id}`} className="block text-sm font-medium text-gray-700">Amount:</label>
                                <input
                                    type="number"
                                    id={`amount-${section.id}`}
                                    name="amount"
                                    value={section.amount}
                                    onChange={(e) => handleSectionChange(section.id, e)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>

                            <button type="button" onClick={() => removeNameSection(section.id)} className="text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button type="button" onClick={addNameSection} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Add Section
                    </button>
                </div>

                <div className="flex justify-center">
                    <button type="submit" className="w-full bg-[#6f42c1] text-white px-4 py-2 rounded-md">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfitLossShareTransaction;
