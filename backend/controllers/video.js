const { db } = require("../lib/db");

const createVideoSession = async (req, res) => {
  const { youtubeVideoId } = req.params;
  const { channelId, youtubeChannelId } = req.body;

  const video = await db.video.findUnique({
    where: { youtubeVideoId }
  });

  if (!video) {
    await db.video.create({
      data: {
        youtubeVideoId, //video owner's video id
        youtubeChannelId, //video owner's channel id
        channelId //currentUser's channel id
      }
    });

    return res.send("Video Session created successfully!");
  }

  return res.send("Video Session already created!");
};

const getVideoSession = async (req, res) => {
  const { youtubeVideoId } = req.params;

  const video = await db.video.findUnique({
    where: { youtubeVideoId }
  });

  res.send(video);
};

module.exports = { createVideoSession, getVideoSession };
