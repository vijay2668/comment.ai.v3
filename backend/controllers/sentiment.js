const { db } = require("../lib/db");

const createSentiment = async (req, res) => {
  const { videoId } = req.params;
  const { channelId, sentiment_data, sentimentId } = req.body;

  if (sentimentId) {
    const sentiment = await db.sentiment.update({
      where: { id: sentimentId },
      data: { sentiment_data }
    });

    return res.send(sentiment);
  }

  const sentiment = await db.sentiment.create({
    data: {
      videoId, // videoId as db.video.id
      channelId, //currentUser's channel id
      sentiment_data //sentiment data
    }
  });

  return res.send(sentiment);
};

const getSentiment = async (req, res) => {
  const { videoId } = req.params;

  const sentiment = await db.sentiment.findFirst({
    where: { videoId }, // videoId as db.video.id
    orderBy: {
      createdAt: "desc" // getting newest sentiment
    }
  });

  res.send(sentiment);
};

module.exports = { createSentiment, getSentiment };
