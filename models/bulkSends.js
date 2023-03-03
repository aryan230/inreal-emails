import mongoose from "mongoose";
const bulkSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: "String",
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
    messages: [
      {
        name: {
          type: String,
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
