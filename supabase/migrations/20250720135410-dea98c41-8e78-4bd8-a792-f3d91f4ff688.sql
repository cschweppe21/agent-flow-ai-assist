-- Create a monthly cron job to update market data
-- This will run on the 1st day of every month at 2 AM UTC
SELECT cron.schedule(
  'monthly-market-data-update',
  '0 2 1 * *',
  $$
  SELECT
    net.http_post(
        url:='https://tsrhrdlaoysxtydcrfda.supabase.co/functions/v1/update-market-data-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcmhyZGxhb3lzeHR5ZGNyZmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODAxMzEsImV4cCI6MjA2ODI1NjEzMX0.IiFBGUTvSUiGQ-qx4rLlZxM9JyyObaVaQOkrQfsjvrU"}'::jsonb,
        body:='{"trigger": "monthly_cron"}'::jsonb
    ) as request_id;
  $$
);