import { booksCollection } from "../../db.js";
import { validateBook } from "../../utils/bookValidation.js";

// POST /books  (token required)
export async function createBook(req, res) {
  const { errors, data } = validateBook(req.body);
  if (errors.length) return res.status(400).send({ message: errors[0], errors });

  const book = {
    ...data,
    availableCopies: data.totalCopies,
    // Who added it comes from the verified token, not from the form
    addedBy: { name: req.user.name, email: req.user.email },
    createdAt: new Date(),
  };

  const result = await booksCollection.insertOne(book);
  res.status(201).send({ ...book, _id: result.insertedId });
}
