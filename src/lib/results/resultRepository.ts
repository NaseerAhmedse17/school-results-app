import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/mongo";
import { ResultDoc, ResultModel } from "@/lib/results/resultModel";

export type ResultRecord = ResultDoc & { _id: Types.ObjectId };

export async function listResults() {
  await connectMongo();
  return ResultModel.find().sort({ createdAt: -1 }).lean<ResultRecord[]>();
}

export async function createResult(data: Pick<ResultDoc, "fullName" | "marks" | "feePaid">) {
  await connectMongo();
  const created = await ResultModel.create(data);
  return created.toObject() as ResultRecord;
}

export async function updateResult(
  id: string,
  data: Pick<ResultDoc, "fullName" | "marks" | "feePaid">
) {
  await connectMongo();
  const updated = await ResultModel.findByIdAndUpdate(id, data, { new: true }).lean<ResultRecord | null>();
  return updated;
}

export async function deleteManyResults(ids: string[]) {
  await connectMongo();
  const objectIds = ids.map((x) => new Types.ObjectId(x));
  const res = await ResultModel.deleteMany({ _id: { $in: objectIds } });
  return { deletedCount: res.deletedCount ?? 0 };
}

