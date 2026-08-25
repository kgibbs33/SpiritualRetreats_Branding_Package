-- Supply-side retreat intake (M3) with approval workflow per Operations Manual
CREATE TABLE IF NOT EXISTS retreat_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  email text NOT NULL,
  retreat_title text NOT NULL,
  location text,
  start_date date,
  end_date date,
  description text,
  capacity integer,
  price_range text,
  facilitator_notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retreat_submissions_status ON retreat_submissions (status);
CREATE INDEX IF NOT EXISTS idx_retreat_submissions_created ON retreat_submissions (created_at);
