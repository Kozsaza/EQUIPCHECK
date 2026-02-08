-- Add UTM tracking columns to validation_logs
alter table public.validation_logs
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text;

-- Index for aggregation queries
create index if not exists idx_validation_logs_utm_source
  on public.validation_logs (utm_source)
  where utm_source is not null;
