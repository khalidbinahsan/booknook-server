import { booksCollection, borrowsCollection } from "../../db.js";
import { toObjectId } from "../../utils/objectId.js";

const DEFAULT_BORROW_DAYS = 7;
const MAX_BORROW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// POST /borrows  (token required)
// Body: { bookId, returnDate? }
export async function createBorrow(req, res) {
  const { bookId, returnDate } = req.body || {};
  const _id = toObjectId(bookId);
  if (!_id) return res.status(400).send({ message: "Invalid book id" });

  const book = await booksCollection.findOne({ _id });
  if (!book) return res.status(404).send({ message: "Book not found" });

  // Return date: optional, between tomorrow and 30 days from now
  const borrowDate = new Date();
  let due = new Date(borrowDate.getTime() + DEFAULT_BORROW_DAYS * DAY_MS);
  if (returnDate) {
    const picked = new Date(returnDate);
    const days = (picked - borrowDate) / DAY_MS;
    if (Number.isNaN(picked.getTime()) || days < 0 || days > MAX_BORROW_DAYS) {
      return res.status(400).send({
        message: `Return date must be within the next ${MAX_BORROW_DAYS} days`,
      });
    }
    due = picked;
  }

  // No double borrow (a unique index on { bookId, userEmail } also guards races)
  const already = await borrowsCollection.findOne({ bookId, userEmail: req.user.email });
  if (already) {
    return res.status(409).send({ message: "You have already borrowed this book" });
  }

  // Take one copy only if one is available - atomic with $inc
  const taken = await booksCollection.updateOne(
    { _id, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } }
  );
  if (taken.modifiedCount === 0) {
    return res.status(400).send({ message: "Not available: all copies are borrowed" });
  }

  const borrow = {
    bookId,
    bookTitle: book.title,
    bookImage: book.image,
    bookAuthor: book.author,
    userEmail: req.user.email,
    userName: req.user.name,
    borrowDate,
    returnDate: due,
  };

  try {
    const result = await borrowsCollection.insertOne(borrow);
    res.status(201).send({ ...borrow, _id: result.insertedId });
  } catch (error) {
    // Give the copy back if saving the borrow failed
    await booksCollection.updateOne({ _id }, { $inc: { availableCopies: 1 } });
    if (error?.code === 11000) {
      return res.status(409).send({ message: "You have already borrowed this book" });
    }
    throw error;
  }
}
