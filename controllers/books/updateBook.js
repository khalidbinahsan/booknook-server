import { booksCollection } from "../../db.js";
import { toObjectId } from "../../utils/objectId.js";
import { validateBook } from "../../utils/bookValidation.js";

// PATCH /books/:id  (token required, only the user who added the book)
export async function updateBook(req, res) {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).send({ message: "Invalid book id" });

  const book = await booksCollection.findOne({ _id });
  if (!book) return res.status(404).send({ message: "Book not found" });
  if (book.addedBy?.email !== req.user.email) {
    return res.status(403).send({ message: "You can only edit books you added" });
  }

  const { errors, data } = validateBook(req.body, { partial: true });
  if (errors.length) return res.status(400).send({ message: errors[0], errors });
  if (!Object.keys(data).length) {
    return res.status(400).send({ message: "Nothing to update" });
  }

  // Keep availableCopies in sync when the total changes
  if (data.totalCopies !== undefined) {
    const borrowedNow = book.totalCopies - book.availableCopies;
    if (data.totalCopies < borrowedNow) {
      return res.status(400).send({
        message: `${borrowedNow} copies are borrowed right now, so total copies cannot be less than ${borrowedNow}`,
      });
    }
    data.availableCopies = data.totalCopies - borrowedNow;
  }

  const updated = await booksCollection.findOneAndUpdate(
    { _id, "addedBy.email": req.user.email },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  res.send(updated);
}
