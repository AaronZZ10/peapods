-- Create RLS Policy to allow receivers to update the read status of messages they received
CREATE POLICY "Users can update own received messages"
ON messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);
