const { analyzeComments } = require("../functions");

const generateSentiment = async (req, res) => {
  try {
    const { comments } = req.body;

    const result = await analyzeComments(JSON.parse(comments));
    // console.log(result);

    res.json(result);
  } catch (error) {
    console.error("Error while generating sentiment:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateSentiment };
