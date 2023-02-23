import mongoose from "mongoose";
const bulkSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    data: [
      {
        name: {
          type: String,
        },
        number: {
          type: Number,
        },
      },
    ],
    timestamp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Bulk = mongoose.model("Bulk", bulkSchema);

export default Bulk;
