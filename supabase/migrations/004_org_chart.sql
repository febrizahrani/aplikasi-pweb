-- Add parent_id to departments for org chart hierarchy
ALTER TABLE public.departments ADD COLUMN parent_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

-- Insert sample org structure
UPDATE public.departments SET parent_id = NULL WHERE nama_departemen = 'Human Resources';
UPDATE public.departments SET parent_id = NULL WHERE nama_departemen = 'Engineering';
UPDATE public.departments SET parent_id = NULL WHERE nama_departemen = 'Marketing';
UPDATE public.departments SET parent_id = NULL WHERE nama_departemen = 'Finance';
UPDATE public.departments SET parent_id = NULL WHERE nama_departemen = 'Operations';

-- Index for hierarchy queries
CREATE INDEX idx_departments_parent ON public.departments(parent_id);
