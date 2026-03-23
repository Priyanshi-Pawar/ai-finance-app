const analyticsService = require("../services/analyticsService.js");
const aiService = require("../services/aiService");

const generateInsight = async () => {
      const summary = await analyticsService.getSummary();

      const income = Number(summary.total_income);
      const expense = Number(summary.total_expense);

      let insight = "";

      if (income === 0) {
            insight = "No income recorded yet. Add income to generate insights.";
      } else {
            const spendingRatio = (expense / income) * 100;

            if (spendingRatio > 80) {
                  insight = "You are spending more than 80% of your income. This is risky.";
            } else if (spendingRatio > 50) {
                  insight = "You are spending over half of your income. Consider reducing expenses.";
            } else {
                  insight = "Your spending is under control. Good job managing finances.";
            }
      }

      return {
            summary,
            insight
      };
};

const getAdvancedInsight = async (req, res) => {
      try {
            console.log(req.generateAdvancedInsight            )
            const result = await aiService.generateAdvancedInsight();
            res.json(result);
      } catch (error) {
  console.error("ADVANCED AI ERROR:", error);
  res.status(500).json({ error: error.message });
}
};

module.exports = {
  getAdvancedInsight,
  generateInsight
};