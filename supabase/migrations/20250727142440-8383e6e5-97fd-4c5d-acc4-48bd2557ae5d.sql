-- Fix the security definer view issue by recreating the view without security definer
DROP VIEW IF EXISTS past_clients;

-- Recreate the view with proper security invoker (default)
-- This ensures the view uses the permissions of the user querying it, not the view creator
CREATE VIEW past_clients AS
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