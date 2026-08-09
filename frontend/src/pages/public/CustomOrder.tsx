import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

const customOrderSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  companyName: z.string().optional(),
  productCategory: z.string().min(1, 'Please select a category'),
  specifications: z.string().min(10, 'Please provide detailed specifications (min 10 chars)'),
  estimatedQuantity: z.number().min(1, 'Quantity must be at least 1').or(z.string().regex(/^\d+$/).transform(Number)),
  notes: z.string().optional(),
});

type CustomOrderFormValues = z.infer<typeof customOrderSchema>;

export const CustomOrderPage = () => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CustomOrderFormValues>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      estimatedQuantity: 1,
    }
  });

  const onSubmit = async (data: CustomOrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Create quotation request in backend
      await api.post('/api/v1/quotations/custom-request', data);
      
      setIsSuccess(true);
      success('Request Submitted', 'Your custom order request has been received!');
      reset();
    } catch (err: any) {
      error('Failed to submit', err.response?.data?.message || 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Request Sent Successfully!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for choosing Multi Kreasi Printing. Our team will review your custom specifications and send a quotation to your email within 1-2 business days.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Request a Custom Order</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Need something unique that's not in our standard catalog? Describe your print project below and we'll provide a custom quotation.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  {...register('fullName')}
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  {...register('email')}
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  {...register('phone')}
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                <input 
                  type="text" 
                  {...register('companyName')}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Category *</label>
                <select 
                  {...register('productCategory')}
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.productCategory ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Select a category...</option>
                  <option value="Packaging">Packaging & Boxes</option>
                  <option value="Marketing">Marketing Materials (Brosur, Flyer)</option>
                  <option value="LargeFormat">Large Format (Banner, Spanduk)</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Books">Books & Publishing</option>
                  <option value="Other">Other / Not Sure</option>
                </select>
                {errors.productCategory && <p className="mt-1 text-sm text-red-600">{errors.productCategory.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity *</label>
                <input 
                  type="number" 
                  min="1"
                  {...register('estimatedQuantity')}
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.estimatedQuantity ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.estimatedQuantity && <p className="mt-1 text-sm text-red-600">{errors.estimatedQuantity.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Specifications *</label>
                <p className="text-xs text-gray-500 mb-2">Please describe the dimensions, material type, finishing, color format, etc.</p>
                <textarea 
                  rows={4}
                  {...register('specifications')}
                  placeholder="Example: Box size 20x10x5 cm, Ivory 300gsm, Doff lamination, Hot print gold on logo..."
                  className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 ${errors.specifications ? 'border-red-300' : 'border-gray-300'}`}
                ></textarea>
                {errors.specifications && <p className="mt-1 text-sm text-red-600">{errors.specifications.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Design Reference (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto md:min-w-[200px] flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Custom Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
