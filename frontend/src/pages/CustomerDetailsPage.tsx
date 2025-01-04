

"use client";

import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import Layout from "@/components/Layout/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CustomerDetailsModal from "@/components/modals/CustomerDetailsModal";

interface Customer {
  id?: number;
  customer_name: string;
  address: string;
  phone_number: string;
}

export default function CustomerDetailsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customer-details/");
      if (!response) {
        throw new Error("Failed to fetch customer data");
      }
      const { data } = response;
      setCustomers(data);
      setFilteredCustomers(data);
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred while fetching customer data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (customerId: number) => {
    try {
      await api.delete(`/customer-details/${customerId}/`);
      setCustomers(customers.filter((c) => c.id !== customerId));
      setFilteredCustomers(
        filteredCustomers.filter((c) => c.id !== customerId)
      );
    } catch (error) {}
  };

  const handleAdd = () => {
    setCurrentCustomer(null);
    setIsModalOpen(true);
  };

  const handleSave = async (customer: Customer) => {
    try {
      if (customer.id) {
        // Edit existing customer
        const response = await api.put(
          `/customer-details/${customer.id}/`,
          customer
        );
        const updatedCustomers = customers.map((c) =>
          c.id === customer.id ? response.data : c
        );
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
      } else {
        // Add new customer
        const response = await api.post("/customer-details/", customer);
        const newCustomers = [...customers, response.data];
        setCustomers(newCustomers);
        setFilteredCustomers(newCustomers);
      }
      setIsModalOpen(false);
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Customer Details
        </h1>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search by name or phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAdd}>Add Customer</Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.customer_name}
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.phone_number}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(customer)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(customer.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <CustomerDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          customer={currentCustomer}
        />
      </div>
    </Layout>
  );
}
