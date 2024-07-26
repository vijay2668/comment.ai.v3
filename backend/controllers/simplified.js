const translate = require("@iamtraction/google-translate");
const { isEnglish } = require("../functions");

const getSimplified = async (req, res) => {
  // const simplified_prompt =
  //   "Rewite the user's comment into detailed but simple words such that it will explain what user want to say.";

  try {
    const { sentiment } = req.body;

    // Use map to gather all promises
    const simplified_comments = await Promise.all(
      sentiment.map(async (comment) => {
        try {
          // Translate if not in English
          if (!isEnglish(comment.text)) {
            const translationResult = await translate(comment.text, { to: "en" });
            comment.text = translationResult?.text || comment.text;
          }

          // Create prompt for GPT
          // const prompt = `Here is a Structure of comment that you have to use:\n${comment.cid}:${comment.text}\n\n\nAnd return output in this format: {"cid": "${comment.cid}", "text": (detailed Simplified Comment)}.`;

          // Call GPT API
          // const simplifiedComment = await gpt(`${simplified_prompt}\n\n${prompt}`, 0.2, []);
          
          // Parse and return simplified comment
          // return JSON.parse(simplifiedComment);
          return { cid: comment.cid, text: comment.text };
        } catch (err) {
          console.error("Error processing comment:", err.message);
          console.log({ cid: comment.cid, error: err.message }) 
          return  { cid: comment.cid, text: comment.text }
        }
      })
    );

    // Respond with simplified comments
    res.json(simplified_comments);
  } catch (error) {
    console.error("Error during Simplifying:", error.message);
    res.status(500).json({ error: "Error during Simplifying" });
  }
};

module.exports = { getSimplified };
