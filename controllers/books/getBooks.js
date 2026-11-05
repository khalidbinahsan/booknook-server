import { booksCollection } from "../../db.js";

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /books
// Public. Optional query params:
//   ?limit=6          -> newest N books (Home "New Arrivals")
//   ?category=Science -> filter by category
//   ?search=word      -> match title or author
//   ?email=me@x.com   -> books added by that user (My Books, token required -
//                        enforced in the route)
export async function getBooks(req, res) {
  const { limit, category, search, email } = req.query;
  const filter = {};

  if (category && category !== "All") filter.category = category;
  if (email) filter["addedBy.email"] = email;
  if (search?.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ title: regex }, { author: regex }];
  }

  let cursor = booksCollection.find(filter).sort({ createdAt: -1 });

  const max = Number.parseInt(limit, 10);
  if (Number.isInteger(max) && max > 0) cursor = cursor.limit(Math.min(max, 100));

  const books = await cursor.toArray();
  res.send(books);
}
