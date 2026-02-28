
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const getFinancialAdvice = async (query: string, context: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const summarizedContext = {
      netWorth: context.transactions?.reduce((sum: number, t: any) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0),
      monthlyIncome: context.transactions?.filter((t: any) => t.type === 'income' && t.date.includes(new Date().toISOString().slice(0, 7))).reduce((s: number, t: any) => s + t.amount, 0),
      monthlyExpenses: context.transactions?.filter((t: any) => t.type === 'expense' && t.date.includes(new Date().toISOString().slice(0, 7))).reduce((s: number, t: any) => s + t.amount, 0),
      savingsProgress: context.savingsGoals?.map((s: any) => `${s.name}: ${Math.round((s.currentAmount/s.targetAmount)*100)}%`).join(', ')
    };

    const userPrompt = `User Financial State: ${JSON.stringify(summarizedContext)}\nUser Question: "${query}"`;
    const systemInstruction = `You are an expert financial advisor for the "Finance Hub" app.
      
      Instructions:
      1. Provide concise, actionable, and encouraging financial advice.
      2. Use the user's specific data to personalize the answer.
      3. Format the response with clear bullet points.
      4. If the user is doing well, encourage them. If they have high expenses, suggest specific categories to cut (referencing context if possible).
      5. Keep it professional but friendly.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I apologize, but I couldn't generate advice at this moment. Please try asking in a different way.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong while connecting to the AI advisor. Please check your connection and try again.";
  }
};

export const getSavingsStrategy = async (context: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const savingsContext = {
      goals: context.goals.map((g: any) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        monthly: g.monthlyDeposit,
        years: g.years
      })),
      totalSaved: context.analytics.deposit,
    };

    const prompt = `Portfolio: ${JSON.stringify(savingsContext)}\n\nBased on these savings goals, provide a 3-point strategy for wealth growth. Be specific about their targets.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a professional wealth manager. Give short, impactful advice.",
      },
    });

    return response.text || "Could not generate a strategy at this time.";
  } catch (error) {
    console.error("Gemini Savings Strategy Error:", error);
    return "The AI Strategist is currently unavailable.";
  }
};
