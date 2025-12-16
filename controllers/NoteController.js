const Note = require("../models/NoteModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/apiError");

//@des get all categories
// @route GET /api/v1/categories
// @access Public
exports.getNotes = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 4;
  const skip = (page - 1) * limit;
  const notes = await Note.find({user:req.user._id}).skip(skip).limit(limit);

  res.status(200).json({ total: notes.length, page, data: notes });
});

//@des get single category
// @route GET /api/v1/categories/:id
// @access Public
exports.getNote = asyncHandler(async (req, res,next) => {
  const id = req.params.id;
  //lets see if it works
  const note = await Note.findOne({_id:id,user:req.user._id});
  if (!note) {
   return next(new ApiError(`no note for this id: ${id}`,404));
  } else {
    res.status(200).json({ data: note });
  }
});

//@des create category
// @route POST /api/v1/categories
// @access Public
exports.createNote = asyncHandler(async (req, res) => {

  const title = req.body.title;
  let image = "";
  if (req.file) {
    image = `uploads/notes/${req.file.filename}`;
  }

  const note = await Note.create({
    title,
    slug: slugify(title),
    image,
    user: req.user._id,
  });
  res.status(201).json({ message: "Note created successfully", data: note });
});

//@des update category
// @route PUT /api/v1/categories/:id
// @access Private

exports.updateNote = asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  const { title } = req.body;
  let update = {};
  if (title) {
    update.title = title;
    update.slug = slugify(title);
  }
  if (req.file) {
    update.image = `uploads/notes/${req.file.filename}`;
  }
  const note = await Note.findOne({_id:id,user:req.user._id});
  if (!note)
  {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
     return next(new ApiError(`no note for this id: ${id}`, 404));
  }

  if (req.file && note.image) {
    const oldPath = path.join(__dirname,`../${note.image}`);
    if (fs.existsSync(oldPath))
    {
      fs.unlinkSync(oldPath);
    }
  }

  const updatedNote = await Note.findOneAndUpdate( {_id:id,user:req.user._id},update,{ new: true });
  
  
    res.status(200).json({ data: updatedNote });
  
});


//@des delete category
// @route DELETE /api/v1/categories/:id
// @access Private

exports.deleteNote = asyncHandler(async(req, res,next) => {
  const{id}=req.params;
  const note =await Note.findOne({_id:id,user:req.user._id});
  if (!note) 
   return next(new ApiError(`no note for this id: ${id}`, 404));

  if (note.image) {
    const imagePath = path.join(__dirname, `../${note.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

 await Note.findByIdAndDelete(id)
  

 
  res.status(204).send();
});

