import { booksCollection, borrowsCollection } from "../../db.js";
import { toObjectId } from "../../utils/objectId.js";

// DELETE /borrows/:id  (token required) - return a borrowed book
export async function returnBorrow(req, res) {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).send({ message: "Invalid borrow id" });

  // Only the borrower can return it
  const borrow = await borrowsCollection.findOneAndDelete({
    _id,
    userEmail: req.user.email,
  });
  if (!borrow) return res.status(404).send({ message: "Borrow record not found" });

  // Put the copy back on the shelf
  const bookId = toObjectId(borrow.bookId);
  if (bookId) {
    await booksCollection.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
  }

  res.send({ message: "Book returned", returnedId: req.params.id });
}
