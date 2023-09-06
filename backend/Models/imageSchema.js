const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Image must have a name."],
  },
  img: {
    data: Buffer,
    contentType: String,
  },
});

const ImageModel = mongoose.model("Image", imageSchema);
module.exports = ImageModel;
