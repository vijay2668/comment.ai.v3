const { db } = require("../lib/db");

const createGroupification = async (req, res) => {
  const { sentimentId, sentimentKey } = req.params;
  const { videoId, channelId, groupification_data } = req.body;

  await db.groupification.create({
    data: {
      videoId, // videoId as db.video.id
      channelId, //currentUser's channel id as db.channel.id
      sentimentId, // sentimentId as db.sentiment.id
      sentimentKey, // sentimentKey as (positives, negatives, questions, neutrals, comments)
      groupification_data //groupification data
    }
  });

  res.send("Groupification created successfully!");
};

const getGroupification = async (req, res) => {
  const { sentimentId, sentimentKey } = req.params;

  const groupification = await db.groupification.findFirst({
    where: {
      sentimentId, // sentimentId as db.sentiment.id
      sentimentKey // sentimentKey as (positives, negatives, questions, neutrals, comments)
    },
    orderBy: {
      createdAt: "desc" // getting newest groupification
    }
  });

  res.send(groupification);
};

module.exports = { createGroupification, getGroupification };
