-- Add rating column to past_clients table
ALTER TABLE public.past_clients 
ADD COLUMN rating integer DEFAULT NULL CHECK (rating >= 1 AND rating <= 5);

-- Add comment to explain the rating column
COMMENT ON COLUMN public.past_clients.rating IS 'Client rating from 1-5 stars based on ease of working together';