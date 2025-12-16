const mongoose = require("mongoose");

//create schema
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: [true, "Title must be unique"],
      minlength: [3, "Title is too short"],
      maxlength: [32, "Title is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    image: String,
  },
  { timestamps: true }
);

//create model

const NoteModel = mongoose.model("Note", noteSchema);


module.exports = NoteModel;