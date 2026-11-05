import { borrowsCollection } from "../../db.js";

// GET /borrows  (token required) - only the logged in user's borrows
export async function getMyBorrows(req, res) {
  const borrows = await borrowsCollection
    .find({ userEmail: req.user.email })
    .sort({ borrowDate: -1 })
    .toArray();

  res.send(borrows);
}
