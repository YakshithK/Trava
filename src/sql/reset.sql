DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) on delete cascade,
    name TEXT NOT NULL,
    age INT,
    contact_number TEXT,
    email TEXT UNIQUE,
    photo TEXT, -- STORES BASE54
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

DROP TABLE IF EXISTS trip CASCADE;

CREATE EXTENSION IF NOT EXISTS "pcrypto";

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    date DATE NOT NULL,
    airline TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

DROP TABLE IF EXISTS matches CASCADE;

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- CAN BE PENDING, ACCEPTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

DROP TABLE IF EXISTS connections CASCADE;

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,

  request_id UUID NOT NULL, -- optional: track the request that led to this connection

  status TEXT NOT NULL DEFAULT 'accepted', -- future-proof for more states
  connected_at TIMESTAMP DEFAULT NOW(),

  chat_room_id UUID UNIQUE, -- to link to chat if needed

  CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  text TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
)