import { booksCollection } from "../../db.js";
import { toObjectId } from "../../utils/objectId.js";

// GET /books/:id  (token required)
export async function getBookById(req, res) {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).send({ message: "Invalid book id" });

  const book = await booksCollection.findOne({ _id });
  if (!book) return res.status(404).send({ message: "Book not found" });

  res.send(book);
}
