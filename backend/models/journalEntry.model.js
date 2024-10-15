import mongoose from "mongoose"
const Schema = mongoose.Schema

const journalEntrySchema = new Schema({
  title: { type: String, required: true },
  notes: { type: String, required: true },
  tag: { type: [String], default: [] },
  isFavourite: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdOn: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  journalDate: { type: Date, required: true },
})

export default mongoose.model("JournalEntry", journalEntrySchema)
