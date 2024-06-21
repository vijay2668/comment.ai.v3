import axios from "axios";
import exportFromJSON from "export-from-json";
import { googleLogout } from "@react-oauth/google";

const extractVideoId = (url) => {
  // Regex pattern to match YouTube URLs
  // const regex =
  //   /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S+|shorts\/|[^/]+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  // Extract video ID using regex
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1]; // Return the video ID
  } else {
    return null; // Return null if no match is found
  }
};

const fetchComments = async ({ input, setComments, options }) => {
  try {
    // Check if input exists and is not an empty string
    if (
      !input ||
      typeof input !== "string" ||
      input.trim() === "" ||
      extractVideoId(input)?.length < 11 ||
      extractVideoId(input) === null
    ) {
      setComments([]);
      return;
    }

    const response = await axios.post(
      `http://localhost:5000/api/comments/${extractVideoId(input)}`,
      { options }
    );

    setComments([
      ...response.data.items.map((comment) => ({
        cid: comment.id,
        text: comment.snippet.topLevelComment.snippet.textDisplay,
        time: timeAgo(comment.snippet.topLevelComment.snippet.publishedAt),
        author: comment.snippet.topLevelComment.snippet.authorDisplayName,
        channel: comment.snippet.topLevelComment.snippet.authorChannelId.value,
        votes: comment.snippet.topLevelComment.snippet.likeCount,
        replies: comment.snippet.totalReplyCount,
        photo: comment.snippet.topLevelComment.snippet.authorProfileImageUrl,
        heart: comment.snippet.topLevelComment.snippet.canRate,
        reply: comment.snippet.canReply,
        publishedAt: formatDate(
          comment.snippet.topLevelComment.snippet.publishedAt
        )
      })),
      ...(options?.replies
        ? response.data.items
            .filter((item) => Number(item.snippet.totalReplyCount) > 0)
            .flatMap((item) =>
              item.replies.comments.map((reply) => ({
                cid: reply.id,
                text: reply.snippet.textDisplay,
                time: timeAgo(reply.snippet.publishedAt),
                author: reply.snippet.authorDisplayName,
                channel: reply.snippet.authorChannelId.value,
                votes: reply.snippet.likeCount,
                replies: 0,
                photo: reply.snippet.authorProfileImageUrl,
                heart: reply.snippet.canRate,
                reply: true,
                publishedAt: formatDate(reply.snippet.publishedAt)
              }))
            )
        : [])
    ]);
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    setComments([]);
  }
};

const handleCategorize = async ({ comments, setCategorize }) => {
  try {
    const response = await axios.post("http://localhost:5000/api/categorize", {
      comments
    });

    setCategorize(response.data);
    console.log(response.data);
  } catch (error) {
    console.error("Error Categorization:", error.message);
  }
};

const handleSimplified = async ({ questions, setCategorize }) => {
  try {
    const response = await axios.post("http://localhost:5000/api/simplified", {
      questions
    });

    console.log(response.data);

    setCategorize((prev) => {
      const updatedQuestions = prev.questions.map((question) => ({
        cid: question.cid,
        text: question.text,
        simplified_comment:
          response.data[
            response.data.findIndex((item) => item.cid === question.cid)
          ].simplified_comment
      }));

      return {
        ...prev,
        questions: updatedQuestions
      };
    });
    // console.log(response.data.split("\n").filter((item)=> item.includes("- '")));
  } catch (error) {
    console.error("Error Simplified:", error.message);
  }
};

const handleGroups = async ({ questions, setGroups, setTextarea }) => {
  try {
    const response = await axios.post("http://localhost:5000/api/groups", {
      simplified_comments: questions.map((question) => ({
        cid: question.cid,
        simplified_comment: question.simplified_comment
      }))
    });

    console.log(response.data);
    setGroups(
      response.data
        .map((group) => {
          let newGroup = { ...group };
          newGroup.group_of_comments = newGroup?.group_of_comments?.filter(
            (comment) =>
              questions.some((question) => question?.cid === comment?.cid)
          );
          return newGroup.group_of_comments.length !== 0 ? newGroup : null;
        })
        .filter(Boolean)
    );

    setTextarea(response.data.map(() => ""));
  } catch (error) {
    console.error("Error Groups:", error.message);
  }
};

const reply = async (group) => {
  try {
    const token =  getCookie('access_token');
    
    if(!token) {
      alert("Session is expired, please login again!!")
      googleLogout();
      return
    }

    const promises = group?.group_of_comments.map(async (comment) => {
      const response = await axios.post(`https://youtube.googleapis.com/youtube/v3/comments?part=snippet&key=${process.env.REACT_APP_API_KEY}`, {
        "snippet": {
          "parentId": comment?.cid,
          "textOriginal": group?.reply
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      
      return response.data
    });

    const results = await Promise.all(promises);
    console.log(results);
  } catch (error) {
    console.error("Error inserting comments", error);
  }
};

function download({ data, type, fields, fileName }) {
  let exportType;

  switch (type) {
    case "txt":
      exportType = exportFromJSON.types.txt;
      break;
    case "html":
      exportType = exportFromJSON.types.html;
      break;
    case "json":
      exportType = exportFromJSON.types.json;
      break;
    case "csv":
      exportType = exportFromJSON.types.csv;
      break;
    case "xls":
      exportType = exportFromJSON.types.xls;
      break;
    default:
      alert("Please enter a valid file type eg: json");
      return;
  }

  exportFromJSON({ data, fileName, fields, exportType });
}

function timeAgo(publishedAt) {
  const now = new Date();
  const publishedDate = new Date(publishedAt);
  const diffInSeconds = Math.floor((now - publishedDate) / 1000);

  const units = [
    { name: "year", seconds: 31536000 },
    { name: "month", seconds: 2592000 },
    { name: "week", seconds: 604800 },
    { name: "day", seconds: 86400 },
    { name: "hour", seconds: 3600 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 }
  ];

  for (const unit of units) {
    const interval = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name}${interval !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

function formatDate(isoString) {
  // Create a Date object from the ISO string
  const date = new Date(isoString);

  // Extract date components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

  // Extract time components
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  // Format the time as hh:mm:ss
  const time = `${hours}:${minutes}:${seconds}`;

  // Return the formatted date string
  return `${day}-${month}-${year} @${time}`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.replace(`${name}=`, "");
    }
  }
  return null;
}

export {
  fetchComments,
  handleCategorize,
  handleSimplified,
  handleGroups,
  download,
  timeAgo,
  formatDate,
  getCookie,
  reply
};
