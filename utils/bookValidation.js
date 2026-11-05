export const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Validates the editable fields of a book.
// partial = true (PATCH) only checks the fields that were sent.
// Returns { errors: string[], data: object } with clean values.
export function validateBook(body = {}, { partial = false } = {}) {
  const errors = [];
  const data = {};
  const has = (key) => body[key] !== undefined;

  if (!partial || has("title")) {
    if (!isNonEmpty(body.title)) errors.push("Book title is required");
    else data.title = body.title.trim();
  }

  if (!partial || has("author")) {
    if (!isNonEmpty(body.author)) errors.push("Author name is required");
    else data.author = body.author.trim();
  }

  if (!partial || has("category")) {
    if (!CATEGORIES.includes(body.category)) {
      errors.push(`Category must be one of: ${CATEGORIES.join(", ")}`);
    } else data.category = body.category;
  }

  if (!partial || has("image")) {
    if (!isNonEmpty(body.image) || !isHttpUrl(body.image.trim())) {
      errors.push("A valid book image URL is required");
    } else data.image = body.image.trim();
  }

  if (!partial || has("description")) {
    if (!isNonEmpty(body.description)) errors.push("Short description is required");
    else if (body.description.trim().length > 1000) {
      errors.push("Description must be 1000 characters or less");
    } else data.description = body.description.trim();
  }

  if (!partial || has("totalCopies")) {
    const copies = Number(body.totalCopies);
    if (!Number.isInteger(copies) || copies < 1 || copies > 1000) {
      errors.push("Total copies must be a whole number between 1 and 1000");
    } else data.totalCopies = copies;
  }

  return { errors, data };
}
