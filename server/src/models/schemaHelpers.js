import { Schema } from 'mongoose';

// Emits only the options it is given, so an absent key stays absent — Mongoose
// treats an explicit `index: false` as a real value and rejects it next to
// `unique: true`.
export const objectId = (ref, { required, index, unique, default: defaultValue } = {}) => {
  const path = { type: Schema.Types.ObjectId, ref };
  if (required) path.required = true;
  if (index) path.index = true;
  if (unique) path.unique = true;
  if (defaultValue !== undefined) path.default = defaultValue;
  return path;
};

export const timestamps = (updatedAt) => ({ timestamps: { createdAt: true, updatedAt } });