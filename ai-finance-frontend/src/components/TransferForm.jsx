import { useState } from "react";
import { transferMoney } from "../api/transferApi";

const TransferForm = ({ onSuccess }) => {
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    setLoading(true);
    setError("");

    try {
      await transferMoney(receiverId, Number(amount));
      setReceiverId("");
      setAmount("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mt-10">
      <h2 className="text-lg font-semibold mb-6">Transfer Money</h2>

      <input
        type="text"
        placeholder="Receiver User ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
      />

      {error && (
        <div className="text-red-500 text-sm mb-3">{error}</div>
      )}

      <button
        onClick={handleTransfer}
        disabled={loading}
        className="w-full bg-primary text-white p-3 rounded-lg"
      >
        {loading ? "Processing..." : "Transfer"}
      </button>
    </div>
  );
};

export default TransferForm;