
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Finance Hub 2.0 - Deployment Guide

এই অ্যাপ্লিকেশনটি Vercel-এ ডেপ্লয় করার জন্য নিচের ধাপগুলো অনুসরণ করুন।

## Vercel-এ ডেপ্লয় করার নিয়ম (Step-by-Step)

1. **প্রজেক্ট পুশ করুন**: আপনার কোডগুলো GitHub-এ আপলোড করুন।
2. **Vercel Connect**: Vercel ড্যাশবোর্ড থেকে "Add New Project" ক্লিক করে আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
3. **Environment Variables (খুবই গুরুত্বপূর্ণ)**:
   ডেপ্লয় করার আগে Vercel-এর **Environment Variables** সেকশনে নিচের ভেরিয়েবলটি সেট করুন:
   - `GEMINI_API_KEY`: (আপনার Gemini API কী এখানে দিন)
4. **Build & Deploy**: 'Deploy' বাটনে ক্লিক করুন। Vercel অটোমেটিক সব কনফিগার করে নেবে।

## ডাটাবেস সেটআপ (Supabase)

অ্যাপ্লিকেশনটি সচল করতে আপনার Supabase SQL Editor-এ `schema.sql` ফাইলের কোডগুলো রান করতে হবে। এটি না করলে ডাটা সেভ হবে না।

## লোকাল রান করার নিয়ম
1. `npm install`
2. `.env.local` ফাইলে `GEMINI_API_KEY` যোগ করুন।
3. `npm run dev`

## বিশেষ সতর্কতা
- Vercel-এ প্রজেক্ট রিফ্রেশ করলে যেন সমস্যা না হয় সেজন্য `vercel.json` ফাইলটি যোগ করা হয়েছে।
- API Key সিকিউরিটির জন্য `vite.config.ts` আপডেট করা হয়েছে।
