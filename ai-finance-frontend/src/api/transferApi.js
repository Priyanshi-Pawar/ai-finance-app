import API from "./axios";
import { v4 as uuidv4 } from "uuid";

export const transferMoney = async (receiverId, amount) => {
  const idempotencyKey = uuidv4();

  const res = await API.post(
    "/transfer",
    { receiverId, amount },
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  return res.data;
};