import { useEffect, useState } from "react";
import API from "../services/api";

const TransactionTable = () => {

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 5;

  const [typeFilter, setTypeFilter] = useState("all");

  const fetchTransactions = async () => {
    try {
      const res = await API.get(`/transactions?page=${page}&limit=${limit}`);

      const data = res.data.data || [];

      setTransactions(data);
      setFiltered(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  // 🔍 filter logic
  useEffect(() => {
    if (typeFilter === "all") {
      setFiltered(transactions);
    } else {
      setFiltered(
        transactions.filter((t) => t.type === typeFilter)
      );
    }
  }, [typeFilter, transactions]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl border">

      <h2 className="text-lg font-semibold mb-4">
        Recent Transactions
      </h2>

      {/* 🔍 FILTER */}
      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p>No transactions</p>
      ) : (
        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b">

                <td className={tx.type === "income" ? "text-green-600" : "text-red-500"}>
                  {tx.type}
                </td>

                <td>₹{tx.amount}</td>

                <td>{tx.category}</td>

                <td>{tx.description}</td>

                <td>{new Date(tx.created_at).toLocaleDateString()}</td>

              </tr>
            ))}

          </tbody>

        </table>
      )}

      {/* 📄 PAGINATION */}
      <div className="flex justify-between mt-4">

        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>

        <span>Page {page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default TransactionTable;