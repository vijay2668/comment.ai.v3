import axios from "axios";
import exportFromJSON from "export-from-json";
import toast from "react-hot-toast";

function extractVideoId(url){
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

async function fetchComments({ videoId, options }){
  try {
    const response = await axios.post(
      `http://localhost:5000/api/comments/${videoId}`,
      { options }
    );

    const comments = [
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
    ]

    return comments
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    toast.error(err.message)
  }
};

// async function fetchComments({ input, setComments, options }){
//   try {
//     // Check if input exists and is not an empty string
//     if (
//       !input ||
//       typeof input !== "string" ||
//       input.trim() === "" ||
//       extractVideoId(input)?.length < 11 ||
//       extractVideoId(input) === null
//     ) {
//       setComments([]);
//       return;
//     }

//     const response = await axios.post(
//       `http://localhost:5000/api/comments/${extractVideoId(input)}`,
//       { options }
//     );

//     setComments([
//       ...response.data.items.map((comment) => ({
//         cid: comment.id,
//         text: comment.snippet.topLevelComment.snippet.textDisplay,
//         time: timeAgo(comment.snippet.topLevelComment.snippet.publishedAt),
//         author: comment.snippet.topLevelComment.snippet.authorDisplayName,
//         channel: comment.snippet.topLevelComment.snippet.authorChannelId.value,
//         votes: comment.snippet.topLevelComment.snippet.likeCount,
//         replies: comment.snippet.totalReplyCount,
//         photo: comment.snippet.topLevelComment.snippet.authorProfileImageUrl,
//         heart: comment.snippet.topLevelComment.snippet.canRate,
//         reply: comment.snippet.canReply,
//         publishedAt: formatDate(
//           comment.snippet.topLevelComment.snippet.publishedAt
//         )
//       })),
//       ...(options?.replies
//         ? response.data.items
//             .filter((item) => Number(item.snippet.totalReplyCount) > 0)
//             .flatMap((item) =>
//               item.replies.comments.map((reply) => ({
//                 cid: reply.id,
//                 text: reply.snippet.textDisplay,
//                 time: timeAgo(reply.snippet.publishedAt),
//                 author: reply.snippet.authorDisplayName,
//                 channel: reply.snippet.authorChannelId.value,
//                 votes: reply.snippet.likeCount,
//                 replies: 0,
//                 photo: reply.snippet.authorProfileImageUrl,
//                 heart: reply.snippet.canRate,
//                 reply: true,
//                 publishedAt: formatDate(reply.snippet.publishedAt)
//               }))
//             )
//         : [])
//     ]);
//   } catch (error) {
//     console.error("Error fetching comments:", error.message);
//     setComments([]);
//   }
// };

async function handleCategorize(comments){
  try {
    const sentiments = await axios.post("http://localhost:5000/api/categorize", {
      comments: JSON.stringify(comments)
    }).then((res)=> res.data);

    return sentiments
  } catch (error) {
    console.error("Error Categorization:", error.message);
  }
};

// async function handleCategorize({ comments, setCategorize }){
//   try {
//     const response = await axios.post("http://localhost:5000/api/categorize", {
//       comments
//     });

//     setCategorize(response.data);
//     console.log(response.data);
//   } catch (error) {
//     console.error("Error Categorization:", error.message);
//   }
// };

async function handleSimplified(sentiment){
  try {
    const response = await axios.post("http://localhost:5000/api/simplified", {
      sentiment
    });

    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error Simplified:", error.message);
    toast.error(error.message)
  }
};

// async function handleSimplified({ questions, setCategorize }){
//   try {
//     const response = await axios.post("http://localhost:5000/api/simplified", {
//       questions
//     });

//     console.log(response.data);

//     setCategorize((prev) => {
//       const updatedQuestions = prev.questions.map((question) => ({
//         cid: question.cid,
//         text: question.text,
//         simplified_comment:
//           response.data[
//             response.data.findIndex((item) => item.cid === question.cid)
//           ].simplified_comment
//       }));

//       return {
//         ...prev,
//         questions: updatedQuestions
//       };
//     });
//     // console.log(response.data.split("\n").filter((item)=> item.includes("- '")));
//   } catch (error) {
//     console.error("Error Simplified:", error.message);
//   }
// };

async function handleGroups({ simplified_comments, sentiment }){
  try {
    const response = await axios.post("http://localhost:5000/api/groups", {
      simplified_comments
    });

    // console.log(response.data);
    
    const data = 
      response.data
        .map((group) => {
          let newGroup = { ...group };
          newGroup.group_of_comments = newGroup?.group_of_comments?.filter(
            (comment) =>
              sentiment.some((item) => item?.cid === comment?.cid)
          );
          return newGroup.group_of_comments.length !== 0 ? newGroup : null;
        })
        .filter(Boolean)

    const remaining = sentiment.filter((item)=> {
      
    })
    
    return data
  } catch (error) {
    console.error("Error during Groups:", error.message);
    toast.error(error.message)
  }
};

// async function handleGroups({ questions, setGroups, setTextarea }){
//   try {
//     const response = await axios.post("http://localhost:5000/api/groups", {
//       simplified_comments: questions.map((question) => ({
//         cid: question.cid,
//         simplified_comment: question.simplified_comment
//       }))
//     });

//     console.log(response.data);
//     setGroups(
//       response.data
//         .map((group) => {
//           let newGroup = { ...group };
//           newGroup.group_of_comments = newGroup?.group_of_comments?.filter(
//             (comment) =>
//               questions.some((question) => question?.cid === comment?.cid)
//           );
//           return newGroup.group_of_comments.length !== 0 ? newGroup : null;
//         })
//         .filter(Boolean)
//     );

//     setTextarea(response.data.map(() => ""));
//   } catch (error) {
//     console.error("Error Groups:", error.message);
//   }
// };

async function reply(group, setIsPending, reply){
  try {
    setIsPending(true)
    const refresh_token =  getCookie('refresh_token');
    let access_token =  getCookie('access_token');
    
    if(!access_token) {
      const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token: newAccessToken, expires_in } = response.data;

      access_token = newAccessToken;
      
      const expiresAt = new Date(Date.now() + expires_in * 1000);
      document.cookie = `access_token=${access_token}; expires=${expiresAt.toUTCString()}; path=/`;
    }

    const promises = group?.group_of_comments.map(async (comment) => {
      const response = await axios.post(`https://youtube.googleapis.com/youtube/v3/comments?part=snippet&key=${process.env.REACT_APP_API_KEY}`, {
        "snippet": {
          "parentId": comment?.cid,
          "textOriginal": reply
        }
      }, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      
      return response.data
    });

    const results = await Promise.all(promises);
    // console.log(results);
    return results
  } catch (err) {
    console.error("Error inserting comments", err.message);
    toast.error(err.message)
    setIsPending(false)
  } finally {
    toast.success("Reply sent successfully to this group");
    setIsPending(false)
  }
};

// async function reply(group){
//   try {
//     const refresh_token =  getCookie('refresh_token');
//     let access_token =  getCookie('access_token');
    
//     if(!access_token) {
//       const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
//         client_id: process.env.REACT_APP_CLIENT_ID,
//         client_secret: process.env.REACT_APP_CLIENT_SECRET,
//         refresh_token,
//         grant_type: 'refresh_token',
//       }), {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       });

//       const { access_token: newAccessToken, expires_in } = response.data;

//       access_token = newAccessToken;
      
//       const expiresAt = new Date(Date.now() + expires_in * 1000);
//       document.cookie = `access_token=${access_token}; expires=${expiresAt.toUTCString()}; path=/`;
//     }

//     const promises = group?.group_of_comments.map(async (comment) => {
//       const response = await axios.post(`https://youtube.googleapis.com/youtube/v3/comments?part=snippet&key=${process.env.REACT_APP_API_KEY}`, {
//         "snippet": {
//           "parentId": comment?.cid,
//           "textOriginal": group?.reply
//         }
//       }, {
//         headers: {
//           'Authorization': `Bearer ${access_token}`,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       })

      
//       return response.data
//     });

//     const results = await Promise.all(promises);
//     console.log(results);
//   } catch (err) {
//     console.error("Error inserting comments", err.message);
//     toast.error(err.message)
//   } finally {
//     toast.success("Reply sent successfully to this group");
//   }
// };

function download({ data, type, fields, fileName }){
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

function timeAgo(publishedAt){
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

function formatDate(isoString){
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

function getCookie(name){
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.replace(`${name}=`, "");
    }
  }
  return null;
}

async function getTokenInfo(accessToken){
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
  );
  if (!response.ok) {
    throw new Error("Failed to get token info");
  }
  const tokenInfo = await response.json();
  return tokenInfo;
}

function getSessionStorage(name){
  return JSON.parse(sessionStorage.getItem(name)) || null;
}

// Helper functions to render table rows
const renderRow = (comments, index, style) => (
  <tr
    key={index}
    className="flex h-fit w-full items-center divide-x divide-[#252C36]"
    style={style}
  >
    {/* <td className="h-full min-w-16 px-4 py-2 text-center">{index + 1}</td> */}
    <td className="h-full w-full overflow-hidden px-4 py-2">
      <p className="scrollbar-hide overflow-scroll whitespace-nowrap">
        {comments[index]?.text}
      </p>
    </td>
  </tr>
);

function timeSince(date) {
  const now = new Date();
  const past = new Date(date);
  const secondsPast = Math.floor((now - past) / 1000);

  const years = Math.floor(secondsPast / (365.25 * 24 * 60 * 60));
  if (years > 0) return years + (years === 1 ? " year" : " years");

  const months = Math.floor(secondsPast / (30.44 * 24 * 60 * 60));
  if (months > 0) return months + (months === 1 ? " month" : " months");

  const days = Math.floor(secondsPast / (24 * 60 * 60));
  if (days > 0) return days + (days === 1 ? " day" : " days");

  const hours = Math.floor(secondsPast / (60 * 60));
  if (hours > 0) return hours + (hours === 1 ? " hour" : " hours");

  const minutes = Math.floor(secondsPast / 60);
  if (minutes > 0) return minutes + (minutes === 1 ? " minute" : " minutes");

  return secondsPast + (secondsPast === 1 ? " second" : " seconds");
}

function formatNumber(num) {
  if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export {
  fetchComments,
  extractVideoId,
  handleCategorize,
  handleSimplified,
  handleGroups,
  download,
  timeAgo,
  formatDate,
  getCookie,
  reply,
  getTokenInfo,
  getSessionStorage,
  renderRow,
  timeSince,
  formatNumber
};
