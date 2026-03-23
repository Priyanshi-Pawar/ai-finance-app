import { useEffect, useState } from "react";
import API from "../services/api";

const TransactionTable = () => {

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");

      console.log("API RESPONSE:", res.data);

      let tx = [];

      // ✅ Handle YOUR backend response correctly
      if (Array.isArray(res.data?.data)) {
        tx = res.data.data; // 🔥 THIS WAS MISSING
      } 
      else if (res.data?.data?.transactions) {
        tx = res.data.data.transactions;
      } 
      else if (res.data?.transactions) {
        tx = res.data.transactions;
      } 
      else if (Array.isArray(res.data)) {
        tx = res.data;
      }

      console.log("FINAL TX:", tx);

      setTransactions(tx);

    } catch (error) {
      console.error("Transaction fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border">

      <h2 className="text-lg font-semibold mb-6">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="pb-3">Type</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>

          <tbody>

            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b text-sm">

                <td className={`py-3 font-medium ${
                  tx.type === "income"
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                  {tx.type || "transfer"}
                </td>

                <td className="py-3">
                  ₹{Number(tx.amount).toFixed(2)}
                </td>

                <td className="py-3">
                  {tx.category || "transfer"}
                </td>

                <td className="py-3">
                  {tx.description || "-"}
                </td>

                <td className="py-3">
                  {tx.created_at
                    ? new Date(tx.created_at).toLocaleDateString()
                    : "-"}
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      )}

    </div>
  );
};

export default TransactionTable;