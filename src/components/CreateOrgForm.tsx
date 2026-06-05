import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  
  // 1. Initialize the Query Client
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<OrgFormInputs>({
    resolver: zodResolver(orgSchema),
  });

  const selectedType = watch('type');

  // 2. Wrap the database insert in a React Query Mutation
  const createMutation = useMutation({
    mutationFn: async (data: OrgFormInputs) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const priceValue = data.type === 'SaaS' && data.subscription_price 
        ? Number(data.subscription_price) 
        : null;

      const { error: dbError } = await supabase.from('organizations').insert([{
        name: data.name,
        type: data.type,
        subscription_price: priceValue,
        created_by: user.id,
      }]);

      if (dbError) throw new Error(dbError.message);
      return data;
    },
    onSuccess: () => {
      reset();
      // 3. This is the magic! It tells the list to instantly re-fetch in the background
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onCreated();
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });

  const onSubmit = (data: OrgFormInputs) => {
    setError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-8 transition-colors">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Startup</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Company Name</label>
          <input {...register('name')} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Startup Type</label>
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

        {/* 4. Disable button automatically while React Query is working */}
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? 'Saving...' : 'Create Startup'}
        </Button>
      </form>
    </div>
  );
}
