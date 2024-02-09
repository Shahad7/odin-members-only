const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const messageSchema = new Schema({
    title: { type: String, required: true, minLength: 3, maxLength: 30 },
    content: { type: String, required: true, minLength: 3, maxLength: 300 },
    timestamp: { type: Date, required: true },
    sender: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
