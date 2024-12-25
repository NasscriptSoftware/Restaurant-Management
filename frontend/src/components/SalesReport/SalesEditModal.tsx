import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SalesReport {
    id: number;
    total_amount: number;
    status: string;
    order_type: string;
    payment_method: string;
    created_at: string;
    invoice_number: string;
    cash_amount: string;
    bank_amount: string;
    customer_phone_number: string;
    customer_name: string;
    delivery_driver_id:string;
    credit_amount:string;
}

interface SalesEditModalProps {
    isOpen: boolean;
    report: SalesReport | null;
    onClose: () => void;
    onUpdate: (updatedReport: SalesReport) => void;
}

interface FormData {
    customer_name: string;
    customer_phone_number: string;
    payment_method: string;
    cash_amount: string;
    bank_amount: string;
    credit_amount: string;
}

const SalesEditModal: React.FC<SalesEditModalProps> = ({ isOpen, report, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<FormData>({
        customer_name: report?.customer_name || "",
        customer_phone_number: report?.customer_phone_number || "",
        payment_method: report?.payment_method || "",
        cash_amount: report?.cash_amount || "0",
        bank_amount: report?.bank_amount || "0",
        credit_amount: report?.credit_amount || "0"
    });

    useEffect(() => {
        if (report) {
            setFormData({
                customer_name: report.customer_name,
                customer_phone_number: report.customer_phone_number,
                payment_method: report.payment_method,
                cash_amount: report.cash_amount || "0",
                bank_amount: report.bank_amount || "0",
                credit_amount: report.credit_amount || "0"
            });
        }
    }, [report]);

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     setFormData({
    //         ...formData,
    //         [name]: value,
    //     });
    // };

    const handleSave = async () => {
        if (!report) return;
    
        try {
            const response = await api.patch(`/orders/${report.id}/`, formData);
            const updatedReport: SalesReport = response.data; // Extract the data property
            onUpdate(updatedReport); // Pass the updated report to the parent component
        } catch (error) {
            console.error("Failed to update report:", error);
        }
    };
    

    if (!isOpen) return null;

    if (!report) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Sales Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label>Payment Method</label>
                        <Select
                            value={report.payment_method}
                            onValueChange={(value) => {
                                const totalAmount = parseFloat(report.total_amount.toString());
                                let updatedValues = {
                                    payment_method: value,
                                    cash_amount: '0',
                                    bank_amount: '0',
                                    credit_amount: '0'
                                };

                                switch (value) {
                                    case 'cash':
                                        updatedValues.cash_amount = totalAmount.toString();
                                        break;
                                    case 'bank':
                                        updatedValues.bank_amount = totalAmount.toString();
                                        break;
                                    case 'cash-bank':
                                        const splitAmount = (totalAmount / 2).toFixed(2);
                                        updatedValues.cash_amount = splitAmount;
                                        updatedValues.bank_amount = splitAmount;
                                        break;
                                    case 'credit':
                                        updatedValues.credit_amount = totalAmount.toString();
                                        break;
                                }

                                setFormData(prev => ({
                                    ...prev,
                                    ...updatedValues
                                }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">Bank</SelectItem>
                                <SelectItem value="cash-bank">Cash and Bank</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label>Cash Amount</label>
                        <Input
                            type="number"
                            value={formData.cash_amount}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                cash_amount: e.target.value
                            }))}
                            disabled={formData.payment_method === 'bank' || formData.payment_method === 'credit'}
                        />
                    </div>

                    <div>
                        <label>Bank Amount</label>
                        <Input
                            type="number"
                            value={formData.bank_amount}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                bank_amount: e.target.value
                            }))}
                            disabled={formData.payment_method === 'cash' || formData.payment_method === 'credit'}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SalesEditModal;
