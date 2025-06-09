import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://kqrvuazjzcnlysbrndmq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnZ1YXpqemNubHlzYnJuZG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4OTM4MTksImV4cCI6MjA2MjQ2OTgxOX0.Q8ZwRfb3mxIkFHZT2gPUR5KsANNvXi1v1Cjnm3YFW9U' // your anon key
);

