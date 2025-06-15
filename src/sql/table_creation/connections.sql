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
