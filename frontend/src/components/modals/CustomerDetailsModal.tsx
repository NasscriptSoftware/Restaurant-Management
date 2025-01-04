import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer | null;
}

interface Customer {
  id?: number;
  customer_name: string;
  address: string;
  phone_number: string;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [formData, setFormData] = useState<Customer>({
    customer_name: '',
    address: '',
    phone_number: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        customer_name: '',
        address: '',
        phone_number: ''
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer_name" className="text-right">
                Name
              </label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="address" className="text-right">
                Address
              </label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone_number" className="text-right">
                Phone Number
              </label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;

