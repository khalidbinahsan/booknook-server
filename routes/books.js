import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getBooks } from "../controllers/books/getBooks.js";
import { getBookById } from "../controllers/books/getBookById.js";
import { createBook } from "../controllers/books/createBook.js";
import { updateBook } from "../controllers/books/updateBook.js";
import { deleteBook } from "../controllers/books/deleteBook.js";

const router = Router();

// "My Books" (?email=) is private: it needs a token for that same email
function requireOwnEmailWhenFiltering(req, res, next) {
  if (!req.query.email) return next();
  return verifyToken(req, res, () => {
    if (req.user.email !== req.query.email) {
      return res.status(403).send({ message: "Forbidden: you can only list your own books" });
    }
    next();
  });
}

router.get("/", requireOwnEmailWhenFiltering, getBooks); // public
router.get("/:id", verifyToken, getBookById);
router.post("/", verifyToken, createBook);
router.patch("/:id", verifyToken, updateBook);
router.delete("/:id", verifyToken, deleteBook);

export default router;
