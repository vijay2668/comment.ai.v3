const { db } = require("../lib/db");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

const auth = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
    // console.log(tokens);

    const { sub: userId, picture: photo, email, name } = jwt.decode(
      tokens.id_token
    );

    const isUserExist = await db.user
      .findFirst({
        where: {
          userId
        }
      })
      .then(res => (res ? true : false));
    // console.log(isUserExist);

    if (!isUserExist) {
      await db.user.create({
        data: {
          userId,
          email,
          name,
          photo
        }
      });
    }

    res.send(tokens);
  } catch (error) {
    console.log(error);
    res.send("Error while creating User");
  }
};

module.exports = { auth };
