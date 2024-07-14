const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import the 'cors' package
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
// const { translate } = require("free-translate");
const translate = require("@iamtraction/google-translate");
const {
  gpt,
  gemini,
  analyzeComments,
  promptTemplate,
  getGroupCommentsWithSimplified,
  isEnglish
} = require("./functions");
const { rootRouter } = require("./routes/index");

dotenv.config();

const app = express();
// Enable CORS for all routes
app.use(cors());
// Increase the request size limit to 50MB
app.use(bodyParser.json({ limit: "50mb" }));
const PORT = process.env.PORT || 5000;

app.use("/api", rootRouter);

app.post("/api/comments/:videoId", async (req, res) => {
  // Defining a POST route with videoId as a URL parameter
  try {
    const { videoId } = req.params; // Extracting videoId from URL parameters
    const { options } = req.body; // Extracting options from the request body
    const items = []; // Initializing an array to store fetched comments
    let nextPageToken = null; // Initializing the token for pagination
    let count = 0; // Initializing a counter for number of requests
    const maxComments = Number(options["max"]) || 100; // Setting the maximum number of comments to fetch

    do {
      // Making a GET request to the YouTube API to fetch comment threads
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads`,
        {
          params: {
            videoId, // The ID of the video for which comments are to be fetched
            part: options["replies"] ? "id,snippet,replies" : "id,snippet", // Including replies if specified in options
            key: process.env.YOUTUBE_API_KEY, // YouTube API key from environment variables
            order: options["sort"], // Sorting order for comments
            pageToken: nextPageToken, // Token for fetching the next page of comments
            maxResults: maxComments > 100 ? 100 : maxComments // Limiting results per request to 100 or less
          }
        }
      );

      items.push(...response.data.items); // Adding the fetched comments to the items array

      nextPageToken = response.data.nextPageToken || null; // Updating the nextPageToken for the next request
      count += 1; // Incrementing the request count

      // Breaking the loop if the desired number of comments is fetched or there are no more comments
      if (!nextPageToken || items.length >= maxComments) break;
    } while (maxComments > 100 && count < Math.ceil(maxComments / 100)); // Continue fetching until the desired number of comments is reached

    res.json({ items }); // Sending the fetched comments as a JSON response
  } catch (error) {
    console.error("Error fetching comments:", error.message); // Logging any errors to the console
    res.status(500).json({ error: "Error fetching comments" }); // Sending an error response
  }
});

app.post("/api/categorize", async (req, res) => {
  try {
    const { comments } = req.body;

    const result = await analyzeComments(JSON.parse(comments));
    // console.log(result);

    res.json(result);
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

app.post("/api/simplified", async (req, res) => {
  const simplified_prompt =
    "Rewite the user's comment into detailed but simple words such that it will explain what user want to say.";

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
          const prompt = `Here is a Structure of comment that you have to use:\n${comment.cid}:${comment.text}\n\n\nAnd return output in this format: {"cid": "${comment.cid}", "text": (detailed Simplified Comment)}.`;

          // Call GPT API
          const simplifiedComment = await gpt(`${simplified_prompt}\n\n${prompt}`, 0.2, []);
          
          // Parse and return simplified comment
          return JSON.parse(simplifiedComment);
        } catch (err) {
          console.error("Error processing comment:", err);
          console.log({ cid: comment.cid, error: comment.text }) 
          return  { cid: comment.cid, error: err.message }
        }
      })
    );

    // Respond with simplified comments
    res.json(simplified_comments);
  } catch (error) {
    console.error("Error during Simplifying:", error.message);
    res.status(500).json({ error: "Error during Simplifying" });
  }
});

app.post("/api/groups", async (req, res) => {
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
    res.status(500).json({ error: "Error During Grouping" });
  }
});

app.get("/api/subscriber&view-count/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;

    const response = await axios.get(
      `https://api.socialcounts.org/youtube-live-subscriber-count/${channelId}`
    );

    // console.log(response.data.est_sub)

    res.json({
      subscribers: response.data.est_sub,
      channel_views: response.data.table[0].count
    });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
