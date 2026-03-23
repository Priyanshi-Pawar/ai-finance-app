const Groq = require("groq-sdk");
const analyticsService = require("./analyticsService");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateAdvancedInsight = async () => {
  const summary = await analyticsService.getSummary();
  const categories = await analyticsService.getCategoryBreakdown();

 const prompt = `
You are a professional financial advisor.

Here is a user's financial data:

Total Income: ${summary.total_income}
Total Expense: ${summary.total_expense}
Balance: ${summary.balance}

Category Breakdown:
${categories.map(c => `${c.category}: ${c.total}`).join("\n")}

Please respond in STRICT JSON format like this:

{
  "risk_score": number (0-100),
  "health_status": "Excellent" | "Good" | "Warning" | "Critical",
  "key_issue": "short explanation",
  "recommendations": [
     "recommendation 1",
     "recommendation 2",
     "recommendation 3"
  ]
}

Do NOT include any extra text outside JSON.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // Fast + free
    messages: [
      { role: "system", content: "You are a professional financial advisor." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return {
    summary,
    aiAdvice: JSON.parse(response.choices[0].message.content)
  };
};

module.exports = {
  generateAdvancedInsight
};