import { booksCollection, borrowsCollection } from "../../db.js";
import { toObjectId } from "../../utils/objectId.js";

// DELETE /books/:id  (token required, only the user who added the book)
export async function deleteBook(req, res) {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).send({ message: "Invalid book id" });

  const book = await booksCollection.findOne({ _id });
  if (!book) return res.status(404).send({ message: "Book not found" });
  if (book.addedBy?.email !== req.user.email) {
    return res.status(403).send({ message: "You can only delete books you added" });
  }

  // Do not remove a book that readers still have
  const activeBorrows = await borrowsCollection.countDocuments({ bookId: req.params.id });
  if (activeBorrows > 0) {
    return res.status(409).send({
      message: `This book is borrowed by ${activeBorrows} reader${activeBorrows > 1 ? "s" : ""}. You can delete it after it is returned.`,
    });
  }

  await booksCollection.deleteOne({ _id, "addedBy.email": req.user.email });
  res.send({ message: "Book deleted", deletedId: req.params.id });
}
