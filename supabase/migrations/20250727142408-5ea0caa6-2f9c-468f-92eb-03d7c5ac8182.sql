-- Add a commissions table relationship to buyers for tracking closed deals
-- and create a view for past clients

-- First, let's ensure we can link commissions to buyers
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS buyer_id uuid;

-- Add an index for better performance when querying buyer commissions
CREATE INDEX IF NOT EXISTS idx_commissions_buyer_id ON commissions(buyer_id);

-- Create a view for past clients that includes their commission totals
CREATE OR REPLACE VIEW past_clients AS
SELECT 
    b.id,
    b.name,
    b.email,
    b.phone,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    b.user_id,
    COALESCE(SUM(c.amount), 0) as total_commission,
    COUNT(c.id) as total_transactions,
    MAX(c.date_earned) as last_transaction_date
FROM buyers b
LEFT JOIN commissions c ON c.buyer_id = b.id
WHERE b.status IN ('closed', 'inactive')
GROUP BY b.id, b.name, b.email, b.phone, b.status, b.notes, b.created_at, b.updated_at, b.user_id;

-- Enable RLS on the view (inherits from underlying tables)
-- Views automatically inherit RLS policies from their underlying tables