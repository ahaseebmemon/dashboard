import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { Button } from "./ui/button";

// Schema definition updated for Zod v4
const orgSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  type: z.enum(['SaaS', 'E-Commerce', 'Hardware'], {
    message: 'Please select a valid type',
  }),
  subscription_price: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'SaaS' && (!data.subscription_price || data.subscription_price.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Monthly price is required for SaaS startups',
      path: ['subscription_price'],
    });
  }
});

type OrgFormInputs = z.infer<typeof orgSchema>;

export function CreateOrgForm({ onCreated }: { onCreated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<OrgFormInputs>({
    resolver: zodResolver(orgSchema),
  });

  const selectedType = watch('type');

  const onSubmit = async (data: OrgFormInputs) => {
    setIsLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setIsLoading(false);
      return;
    }

    const priceValue = data.type === 'SaaS' && data.subscription_price 
      ? Number(data.subscription_price) 
      : null;

    const { error: dbError } = await supabase.from('organizations').insert([{
      name: data.name,
      type: data.type,
      subscription_price: priceValue,
      created_by: user.id,
    }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      reset();
      onCreated();
    }
    setIsLoading(false);
  };

  return (
    // 1. Fixed Card Background and Borders
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-8 transition-colors">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Startup</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Company Name</label>
          {/* 2. Fixed Input Backgrounds and Text */}
          <input {...register('name')} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Startup Type</label>
          {/* 3. Fixed Select Dropdown Backgrounds and Text */}
          <select {...register('type')} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select a type...</option>
            <option value="SaaS">SaaS</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Hardware">Hardware</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>

        {selectedType === 'SaaS' && (
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Monthly Subscription Price ($)</label>
            <input type="number" {...register('subscription_price')} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.subscription_price && <p className="text-red-500 text-sm">{errors.subscription_price.message}</p>}
          </div>
        )}

        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Create Startup'}
        </Button>
      </form>
    </div>
  );
}

