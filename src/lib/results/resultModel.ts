import mongoose, { Model, Schema } from "mongoose";

export type ResultDoc = {
  fullName: string;
  marks: number;
  feePaid: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ResultSchema = new Schema<ResultDoc>(
  {
    fullName: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 1, max: 100 },
    feePaid: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const ResultModel: Model<ResultDoc> =
  (mongoose.models.Result as Model<ResultDoc>) || mongoose.model<ResultDoc>("Result", ResultSchema);

