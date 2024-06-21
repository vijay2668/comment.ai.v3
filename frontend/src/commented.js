// import { cn } from "./utils";
// import "./App.css";
// import React, { useState, useEffect } from "react";
// import { gapi } from "gapi-script";
// import {
//   authenticate,
//   download,
//   execute,
//   fetchComments,
//   handleCategorize,
//   handleGroups,
//   handleSimplified,
//   loadClient
// } from "./helpers";
// import { BsArrowRepeat } from "react-icons/bs";
// import { AiOutlineDownload } from "react-icons/ai";
// import { MultiSelect } from "react-multi-select-component";

// const App = () => {
//   const [input, setInput] = useState([]);
//   const [textarea, setTextarea] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [categorize, setCategorize] = useState(null);
//   const [groups, setGroups] = useState(null);
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     if (comments?.length === 0) return;
//     setSelected(
//       Object.keys(comments[0])?.map((key) => ({
//         label: key,
//         value: key
//       }))
//     );
//   }, [comments]);

//   const [options, setOptions] = useState({
//     replies: false,
//     sort: "relevance",
//     max: "50"
//   });

//   const currentItemIndex = 0;

//   const isGameComplete = currentItemIndex >= categorize?.neutrals?.length;

//   // Handle arrow key press
//   const handleKeyPress = (event) => {
//     if (event.key === "ArrowLeft") {
//       handleButtonClick("left");
//     } else if (event.key === "ArrowRight") {
//       handleButtonClick("right");
//     }
//   };

//   const handleButtonClick = (input) => {
//     setCategorize((prev) => {
//       const updatedNeutrals = prev.neutrals?.filter(
//         (item) => item !== prev.neutrals[currentItemIndex]
//       );
//       const updatedCategory = {
//         ...prev,
//         [input.startsWith("L") ? "positives" : "questions"]: input.startsWith(
//           "L"
//         )
//           ? [...(prev.positives || []), prev.neutrals[currentItemIndex]]
//           : [...(prev.questions || []), prev.neutrals[currentItemIndex]]
//       };
//       if (updatedNeutrals.length > 0)
//         updatedCategory.neutrals = updatedNeutrals;
//       else delete updatedCategory.neutrals;
//       return updatedCategory;
//     });
//   };

//   // console.log(
//   //   categorize &&
//   //     categorize?.neutral &&
//   //     categorize?.neutral?.length !== 0 &&
//   //     !isGameComplete
//   // );

//   // Attach event listener when component mounts
//   useEffect(() => {
//     if (
//       categorize &&
//       categorize?.neutrals &&
//       categorize?.neutrals?.length !== 0 &&
//       !isGameComplete
//     ) {
//       window.addEventListener("keydown", handleKeyPress);
//       return () => {
//         window.removeEventListener("keydown", handleKeyPress);
//       };
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [categorize, isGameComplete]);

//   useEffect(() => {
//     gapi.load("client:auth2", () => {
//       gapi.auth2.init({
//         client_id:
//           "109273160691-lm8mldvomphvh4u73keksvis6iukspve.apps.googleusercontent.com"
//       });
//     });
//   }, []);

//   // console.log(options);

//   return (
//     <div className="flex flex-col w-full overflow-x-hidden h-fit p-5 space-y-4">
//       <h2 className="text-xl font-bold text-center">
//         Live Stream Comments: {comments.length}
//       </h2>
//       <h2 className="text-lg font-semibold text-center">
//         Questions: {categorize?.questions?.length || 0}, Negatives:{" "}
//         {categorize?.negatives?.length || 0}, Positives:{" "}
//         {categorize?.positives?.length || 0}, Neutral:{" "}
//         {categorize?.neutrals?.length || 0}
//       </h2>
//       <div className="divide-y divide-black space-y-2">
//         {groups?.map((group, index) => (
//           <div key={index}>
//             <h2>{group?.group_about}</h2>
//             <ul>
//               {group?.group_of_comments?.map((group_of_comment) => (
//                 <li key={group_of_comment?.cid}>
//                   {group_of_comment?.simplified_comment}
//                 </li>
//               ))}
//             </ul>
//             <div className="flex items-baseline space-x-2">
//               <textarea
//                 type="text"
//                 className="border border-black p-1.5 rounded-md w-5/6"
//                 value={textarea[index]}
//                 onChange={(e) =>
//                   setTextarea((prev) => {
//                     let alltextarea = [...prev];
//                     alltextarea[index] = e.target.value;
//                     return alltextarea;
//                   })
//                 }
//               />
//               <button
//                 className="w-1/6 bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//                 onClick={async () => {
//                   // Update the state
//                   let selectedGroup;

//                   setGroups((prev) => {
//                     const newGroups = [...prev];
//                     newGroups[index] = {
//                       ...newGroups[index],
//                       reply: textarea[index]
//                     };

//                     selectedGroup = newGroups[index];

//                     return newGroups;
//                   });

//                   // Continue with authenticate, loadClient, and execute
//                   try {
//                     await authenticate();
//                     await loadClient();
//                     await execute(selectedGroup);
//                     setTextarea((prev) => {
//                       let alltextarea = [...prev];
//                       alltextarea[index] = "";
//                       return alltextarea;
//                     });
//                   } catch (error) {
//                     console.error(
//                       "Error during authentication or execution:",
//                       error
//                     );
//                   }
//                 }}
//               >
//                 Reply
//               </button>
//             </div>
//           </div>
//         ))}
//         {/* {comments.map((comment, index) => (
//           <div key={index}>
//             <h2>{comment.snippet.title}</h2>
//             <p>{comment.snippet.textOriginal}</p>
//           </div>
//         ))} */}
//       </div>
//       <div className="flex items-baseline space-x-2 w-full">
//         <div className="flex flex-col w-1/4 space-y-2">
//           <div className="flex items-center space-x-2 w-full">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="w-full border border-black p-1 rounded-md"
//             />

//             <button
//               className="w-fit bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//               onClick={() =>
//                 fetchComments({
//                   input,
//                   setComments,
//                   options
//                 })
//               }
//             >
//               <BsArrowRepeat className="text-2xl" />
//             </button>
//             <button
//               className="w-fit bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//               onClick={() => {
//                 let type = prompt(
//                   "Please enter one of the following type:\ntxt\nhtml\njson\ncsv\nxls"
//                 );

//                 let fileName = prompt("Please name the file");

//                 let fields = selected?.map((select) => select?.value);

//                 download({ data: comments, type, fields, fileName });
//               }}
//             >
//               <AiOutlineDownload className="text-2xl" />
//             </button>
//           </div>
//           <div className="flex flex-col space-y-2 w-full">
//             <div className="flex items-center space-x-2">
//               <input
//                 checked={options["replies"]}
//                 onChange={(e) =>
//                   setOptions((prev) => {
//                     const newOptions = { ...prev };
//                     newOptions["replies"] = e.target.checked;
//                     return newOptions;
//                   })
//                 }
//                 type="checkbox"
//               />
//               <span>Do you want Replies to download?</span>
//             </div>
//             <div className="flex flex-col space-y-2 w-full">
//               <select
//                 name="sort"
//                 value={options["sort"]}
//                 onChange={(e) =>
//                   setOptions((prev) => {
//                     const newOptions = { ...prev };
//                     newOptions["sort"] = e.target.value;
//                     return newOptions;
//                   })
//                 }
//                 className="border border-black p-1.5 rounded-md w-full cursor-pointer"
//               >
//                 <option value="relevance">Top comments</option>
//                 <option value="time">Newest first</option>
//               </select>
//               <select
//                 name="max"
//                 value={options["max"]}
//                 onChange={(e) =>
//                   setOptions((prev) => {
//                     const newOptions = { ...prev };
//                     newOptions["max"] = e.target.value;
//                     return newOptions;
//                   })
//                 }
//                 className="border border-black p-1.5 rounded-md w-full cursor-pointer"
//               >
//                 <option value="50">50 comments</option>
//                 <option value="100">100 comments</option>
//                 <option value="300">300 comments</option>
//                 <option value="1000">1000 comments</option>
//                 <option value="1800">All Comments (Max 1800)</option>
//               </select>
//             </div>
//             {comments?.length !== 0 && (
//               <MultiSelect
//                 options={Object.keys(comments[0])?.map((key) => ({
//                   label: key,
//                   value: key
//                 }))}
//                 value={selected}
//                 onChange={setSelected}
//                 labelledBy="Select"
//               />
//             )}
//           </div>
//         </div>

//         <button
//           className="w-1/4 bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//           onClick={() =>
//             handleCategorize({
//               comments: comments.filter((comment) => comment.cid.length === 26),
//               setCategorize
//             })
//           }
//         >
//           Categorize Them
//         </button>
//         <button
//           className="w-1/4 bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//           onClick={() =>
//             handleSimplified({
//               questions: categorize?.questions,
//               setCategorize
//             })
//           }
//         >
//           Simplified Them
//         </button>
//         <button
//           className="w-1/4 bg-gray-200 p-1.5 border border-black rounded-md hover:bg-gray-400"
//           onClick={() =>
//             handleGroups({
//               questions: categorize.questions,
//               setGroups,
//               setTextarea
//             })
//           }
//         >
//           Group Them
//         </button>
//       </div>
//       <div className="flex w-full h-[35rem] space-x-2 overflow-hidden">
//         <ul className="w-1/2 flex flex-col h-full space-y-2 overflow-x-hidden border py-2 px-8 rounded-md border-black overflow-y-scroll">
//           {comments?.map((comment, index) => (
//             <li className="w-full" key={index}>
//               {comment?.cid} + {comment?.text}
//             </li>
//           ))}
//         </ul>
//         <div className="w-1/2 flex flex-col h-full space-y-2 overflow-x-hidden border py-2 px-8 rounded-md border-black overflow-y-scroll">
//           {categorize &&
//             Object.entries(categorize).map((category, index) => (
//               <div key={index}>
//                 <h3>{category[0]}:</h3>
//                 <ul>
//                   {category[1].map((comment) => (
//                     <li key={comment.cid}>
//                       {comment.cid}+{comment.text}+
//                       {comment?.simplified_comment &&
//                         comment.simplified_comment}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//         </div>
//       </div>
//       <div className="w-full border border-black h-fit rounded-md">
//         <div type="1" className="list-decimal divide-y divide-black">
//           {categorize?.neutrals?.map((comment, index) => (
//             <div
//               key={index}
//               className={cn(
//                 currentItemIndex === index && "bg-green-100 rounded-t-md",
//                 "flex items-center justify-between px-4 py-2"
//               )}
//             >
//               <p>{comment.text}</p>
//               <div className="flex items-center space-x-2">
//                 <button
//                   className="py-1 px-2 whitespace-nowrap bg-gray-200 hover:bg-gray-300 rounded-md border border-black"
//                   onClick={() => handleButtonClick("left")}
//                 >
//                   L (postive)
//                 </button>
//                 <button
//                   className="py-1 px-2 whitespace-nowrap bg-gray-200 hover:bg-gray-300 rounded-md border border-black"
//                   onClick={() => handleButtonClick("right")}
//                 >
//                   R (question)
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default App;



// const login = useGoogleLogin({
//     onSuccess: (tokenResponse) => {
//       // const hasAccess = hasGrantedAllScopesGoogle(
//       //   tokenResponse,
//       //   "https://www.googleapis.com/auth/userinfo.email",
//       //   "https://www.googleapis.com/auth/userinfo.profile",
//       //   "https://www.googleapis.com/auth/youtube.force-ssl",
//       // );
//       // console.log({ ...tokenResponse, hasAccess: hasAccess });

//       // Save access token and expires in to cookies
//       const accessToken = tokenResponse.access_token;
//       const expiresIn = tokenResponse.expires_in;
//       const expiresAt = new Date(Date.now() + expiresIn * 1000);
//       document.cookie = `access_token=${accessToken}; expires=${expiresAt.toUTCString()}; path=/`;
//     },
//     scope: [
//       "https://www.googleapis.com/auth/userinfo.profile",
//       "https://www.googleapis.com/auth/userinfo.email",
//       "https://www.googleapis.com/auth/youtube.force-ssl",
//     ].join(" "),
//   });