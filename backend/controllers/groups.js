const { getGroupCommentsWithSimplified, gemini, promptTemplate } = require("../functions");

const getGroups = async (req, res) => {
  try {
    const { simplified_comments } = req.body;

    const batches = [];
    const batch_size = 10;
    const responses = [];

    for (let i = 0; i < simplified_comments.length; i += batch_size) {
      batches.push(simplified_comments.slice(i, i + batch_size));
    }

    for (let i = 0; i < batches.length; i++) {
      const group_prompt = `Make a Group of comments based on their similarity. Generate a "group_about" which is a sentence has the essence of all comments included.\n\nHere is a Structure of comments that you have to use:\n${batches[
        i
      ]
        .map(comment => `- ${comment.cid}:${comment.text}`)
        .join("\n")}\n\n\nAnd return output in this format: ${JSON.stringify(
        getGroupCommentsWithSimplified
      )}.`;

      const result = await gemini(`${promptTemplate}\n\n${group_prompt}`);
      // console.log(result);
      responses.push(...JSON.parse(result));

      // console.log(promptTemplate + group_prompt);
    }

    res.json(responses);
  } catch (error) {
    console.error("Error During Grouping:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGroups };
