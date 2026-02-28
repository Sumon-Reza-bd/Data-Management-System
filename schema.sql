
-- ১. 'user_data' টেবিল তৈরি করা (এখানে সব ইউজারের ইনফরমেশন একটি JSON ব্লব হিসেবে জমা থাকবে)
CREATE TABLE IF NOT EXISTS public.user_data (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২. Row Level Security (RLS) সক্রিয় করা
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- ৩. আরএলএস পলিসি তৈরি করা (যাতে ইউজাররা শুধু তাদের নিজস্ব ডাটা দেখতে ও এডিট করতে পারে)
DROP POLICY IF EXISTS "Users can manage their own data" ON public.user_data;
CREATE POLICY "Users can manage their own data" ON public.user_data
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ৪. ইউজার অ্যাকাউন্ট মুছে ফেলার জন্য RPC ফাংশন তৈরি করা
-- এই ফাংশনটি সেটিংস পেজ থেকে অ্যাকাউন্ট ডিলিট করার সময় ব্যবহৃত হয়।
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- এটি সুপারইউজার পারমিশন নিয়ে রান হবে যাতে auth.users থেকে ডাটা মুছে ফেলা যায়
SET search_path = public
AS $$
BEGIN
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
