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
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
      <h3 className="text-lg font-bold mb-4">Add New Startup</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input {...register('name')} className="w-full px-3 py-2 border rounded-md" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Startup Type</label>
          <select {...register('type')} className="w-full px-3 py-2 border rounded-md bg-white">
            <option value="">Select a type...</option>
            <option value="SaaS">SaaS</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Hardware">Hardware</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
        </div>

        {selectedType === 'SaaS' && (
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Subscription Price ($)</label>
            <input type="number" {...register('subscription_price')} className="w-full px-3 py-2 border rounded-md" />
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

