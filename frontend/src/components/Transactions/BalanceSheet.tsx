import { api } from "@/services/api";
import React, { useState } from "react";

interface LedgerGroup {
    name: string;
}

interface Ledger {
    name: string;
    group: LedgerGroup;
}

interface Transaction {
    ledger: Ledger;
    debit_amount?: string;
    credit_amount?: string;
}

const BalanceSheet: React.FC = () => {
    const [liabilitiesData, setLiabilitiesData] = useState<Transaction[]>([]);
    const [assetData, setAssetData] = useState<Transaction[]>([]);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates");
            return;
        }

        setIsSearching(true);

        try {
            const expenseResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Liability', from_date: fromDate, to_date: toDate },
            });

            const incomeResponse = await api.get('/transactions/filter-by-nature-group/', {
                params: { nature_group_name: 'Asset', from_date: fromDate, to_date: toDate },
            });

            if (Array.isArray(expenseResponse.data)) {
                setLiabilitiesData(expenseResponse.data);
            } else {
                console.error('Unexpected data format for expenses:', expenseResponse.data);
            }

            if (Array.isArray(incomeResponse.data)) {
                setAssetData(incomeResponse.data);
            } else {
                console.error('Unexpected data format for income:', incomeResponse.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const parseAmount = (amount?: string) => Number(amount) || 0;

    const calculateTotal = (data: Transaction[], key: 'debit_amount' | 'credit_amount') => {
        return data.reduce((total, item) => total + parseAmount(item[key]), 0);
    };

    const groupBy = (data: Transaction[], key: keyof LedgerGroup) => {
        return data.reduce((groups, item) => {
            const groupName = item.ledger.group[key];
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(item);
            return groups;
        }, {} as Record<string, Transaction[]>);
    };

    const aggregateLedgerTotals = (transactions: Transaction[]) => {
        return transactions.reduce((acc, transaction) => {
            const ledgerName = transaction.ledger.name;
    
            if (!acc[ledgerName]) {
                acc[ledgerName] = { debit: 0, credit: 0, balance: 0 };
            }
    
            // Update totals for debit and credit
            acc[ledgerName].debit += parseAmount(transaction.debit_amount);
            acc[ledgerName].credit += parseAmount(transaction.credit_amount);
    
            // Calculate balance based on which amount is greater
            if (acc[ledgerName].debit > acc[ledgerName].credit) {
                acc[ledgerName].balance = acc[ledgerName].debit - acc[ledgerName].credit;
            } else {
                acc[ledgerName].balance = acc[ledgerName].credit - acc[ledgerName].debit;
            }
    
            return acc;
        }, {} as Record<string, { debit: number; credit: number; balance: number }>);
    };
    

    const liabilitiesGroups = groupBy(liabilitiesData, 'name');
    const assetGroups = groupBy(assetData, 'name');

    const totalExpenses = calculateTotal(liabilitiesData, 'debit_amount');
    const totalIncome = calculateTotal(assetData, 'credit_amount');
    const netProfit = totalIncome - totalExpenses;
    const netLoss = totalExpenses > totalIncome ? totalExpenses - totalIncome : 0;
    const grandTotalExpenses = totalExpenses + (netProfit > 0 ? netProfit : 0);
    const grandTotalIncome = totalIncome + (netLoss > 0 ? netLoss : 0);

    return (
        <div className="p-4">
            {/* Search Form */}
            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
                <div className="flex items-center space-x-4">
                    {/* From Date */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="block w-full py-2 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-300 ease-in-out disabled:opacity-50"
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Display Results after Search */}
            {liabilitiesData.length > 0 || assetData.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Liabilities Section */}
                    <div className="flex-1 bg-white shadow-md rounded-md flex flex-col">
                        <h2 className="text-2xl font-bold mb-4 text-center">Liabilities</h2>
                        <div className="flex-1 overflow-auto">
                            {Object.entries(liabilitiesGroups).map(([groupName, transactions]) => (
                                <div key={groupName} className="mb-6">
                                    <table className="min-w-full table-auto border-collapse ">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className=" px-4 py-2 text-left">{groupName}</th>
                                                <th className=" px-4 py-2 text-right">
                                                    QAR {Object.values(aggregateLedgerTotals(transactions))
                                                        .reduce((acc, { balance }) => acc + balance, 0)
                                                        .toFixed(2)}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(aggregateLedgerTotals(transactions)).map(([ledgerName, totals]) => (
                                                <tr key={ledgerName}>
                                                    <td className=" px-4 py-2">{ledgerName}</td>
                                                    <td className=" px-4 py-2 text-right">
                                                        {totals.balance.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                        <div className="font-bold mt-4">
                            <div className="flex justify-between mb-2">
                                <p>Total Liabilities:</p>
                                <p>{totalExpenses.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between mb-2">
                                <p>Net Profit:</p>
                                <p>{netProfit > 0 ? netProfit.toFixed(2) : "0.00"}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Grand Total:</p>
                                <p>{grandTotalExpenses.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assets Section */}
                    <div className="flex-1 bg-white shadow-md rounded-md flex flex-col">
                        <h2 className="text-2xl font-bold mb-4 text-center">Assets</h2>
                        <div className="flex-1 overflow-auto">
                            {Object.entries(assetGroups).map(([groupName, transactions]) => (
                                <div key={groupName} className="mb-6">
                                    <table className="min-w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className=" px-4 py-2 text-left">{groupName}</th>
                                                <th className=" px-4 py-2 text-right">
                                                    QAR {Object.values(aggregateLedgerTotals(transactions))
                                                        .reduce((acc, { balance }) => acc + balance, 0)
                                                        .toFixed(2)}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(aggregateLedgerTotals(transactions)).map(([ledgerName, totals]) => (
                                                <tr key={ledgerName}>
                                                    <td className=" px-4 py-2">{ledgerName}</td>
                                                    <td className=" px-4 py-2 text-right">
                                                        {totals.balance.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                        <div className="font-bold mt-4">
                            <div className="flex justify-between mb-2">
                                <p>Total Assets:</p>
                                <p>{totalIncome.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between mb-2">
                                <p>Net Loss:</p>
                                <p>{netLoss > 0 ? netLoss.toFixed(2) : "0.00"}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Grand Total:</p>
                                <p>{grandTotalIncome.toFixed(2)}</p>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">No data available. Please perform a search.</p>
            )}
        </div>
    );
};

export default BalanceSheet;
