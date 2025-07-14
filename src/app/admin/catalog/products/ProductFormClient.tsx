"use client";

import { useState } from 'react';
import { ProductFormData } from '@/types/catalog';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';

export default function ProductFormClient() {
  const [showForm, setShowForm] = useState(false);

  const handleCreateProduct = async (data: ProductFormData) => {
    // TODO: Implement createProduct logic here using a server action
    // After creating the product, update the products state
    console.log('Creating product:', data);
    setShowForm(false);
    
    // Refresh the page to show the new product
    window.location.reload();
  };

  return (
    <div className="mb-6">
      <Button onClick={() => setShowForm(true)}>Create Product</Button>
      {showForm && (
        <div className="mt-4 p-4 border rounded-md">
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      )}
    </div>
  );
}