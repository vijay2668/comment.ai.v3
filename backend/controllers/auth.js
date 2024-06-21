const { db } = require("../lib/db");

const login = async (req, res) => {
  try {
    const { id, email, name, picture } = req.body;

    const user = await db.user.create({
      data: {
        userId: id,
        email: email,
        name: name,
        photo: picture
      }
    });

    console.log("user", user);

    res.send("Logged in Successfully");
  } catch (error) {
    console.log(error);
    res.send("Error while creating User");
  }
};

module.exports = { login };
