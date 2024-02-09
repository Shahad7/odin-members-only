const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    title: { type: String, required: true, minLength: 3, maxLength: 30 },
    content: { type: String, required: true, minLength: 3, maxLength: 300 },
    timestamp: new Date(),
});

const Message = mongoose.model("message", messageSchema);
module.exports = Message;
