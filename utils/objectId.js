import { ObjectId } from "mongodb";

// Returns an ObjectId, or null when the string is not a valid id
export function toObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id ? new ObjectId(id) : null;
}
