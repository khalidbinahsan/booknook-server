import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createBorrow } from "../controllers/borrows/createBorrow.js";
import { getMyBorrows } from "../controllers/borrows/getMyBorrows.js";
import { returnBorrow } from "../controllers/borrows/returnBorrow.js";

const router = Router();

router.use(verifyToken); // every borrow route needs a logged in user

router.post("/", createBorrow);
router.get("/", getMyBorrows);
router.delete("/:id", returnBorrow);

export default router;
