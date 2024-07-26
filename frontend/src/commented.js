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


// backend
// const { UserRefreshClient } = require("google-auth-library");
// app.post("/auth/google/refresh-token", async (req, res) => {
//       const user = new UserRefreshClient(
//         process.env.CLIENT_ID,
//         process.env.CLIENT_SECRET,
//         // req.body.refreshToken
//         "1//0gr1LsqdArsJ_CgYIARAAGBASNwF-L9IrsMY3PUHQId4OrZ6J_VahK5nFeqn8SugZzVTP1sD1ffUcUCtJdfHj89jlfd0BZ1vJNLc"
//       );
//       const { credentials } = await user.refreshAccessToken(); // optain new tokens
//       res.json(credentials);
//     });



// // getting the expiry in from access token by getTokenInfo for creatting cookie with expires at
      // const { expires_in } = await getTokenInfo(access_token);
      // console.log(expires_in);
      // const expiresAt = new Date(Date.now() + expires_in * 1000);
      // document.cookie = `access_token=${access_token}; expires=${expiresAt.toUTCString()}; path=/`;
      // console.log("cookie access_token expire", expiresAt);
      // console.log(
      //   "cookie access_token expire attoUTCString",
      //   expiresAt.toUTCString(),
      // );


      // *dashboard*

      
{
      /* <table className="flex h-full w-1/2 flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
              <thead className="flex h-fit w-full flex-col">
                <tr className="flex h-full w-full flex-col">
                  <th className="flex h-full w-full items-center justify-between space-x-2 overflow-hidden px-4 py-2">
                    <span className="scrollbar-hide overflow-scroll whitespace-nowrap">
                      Top 10 Question
                    </span>
                    {sentiments && (
                      <button
                        onClick={() => generateGroups(top10Question)}
                        className="whitespace-nowrap rounded-full bg-blue-600 px-2 py-1 text-sm font-normal"
                      >
                        Group them
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody
                id="table_body"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                {sentiments && (
                  <List
                    height={600}
                    itemCount={top10Question?.length}
                    itemSize={50}
                    width="100%"
                  >
                    {Top10QuestionCommentsRow}
                  </List>
                )}
              </tbody>
            </table> */
    }
    
    {
      /* {sentiments && ( */
    }
    {
      /* )} */
    }
    {
      /* {sentiments?.positives && sentiments?.negatives && ( */
    }
    {
      /* <div className="flex min-h-[50%] w-full items-center space-x-6"> */
    }
    {
      /* Positives Comments Table */
    }
    {
      /* {sentiments?.positives && ( */
    }
    {
      /* <table className="flex h-full w-1/2 flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
              <thead className="flex h-fit w-full flex-col">
                <tr className="flex h-full w-full flex-col">
                  <th className="flex h-full w-full items-center justify-between space-x-2 px-4 py-2">
                    <span className="scrollbar-hide overflow-scroll whitespace-nowrap">
                      POSITIVE - {sentiments?.positives?.length}
                    </span>
                    <button
                      onClick={() => generateGroups(sentiments?.positives)}
                      className="whitespace-nowrap rounded-full bg-blue-600 px-2 py-1 text-sm font-normal"
                    >
                      Group them
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody
                id="table_body"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                <List
                  height={600}
                  itemCount={sentiments?.positives?.length}
                  itemSize={50}
                  width="100%"
                >
                  {PositiveCommentsRow}
                </List>
              </tbody>
            </table> */
    }
    {
      /* )} */
    }
    {
      /* Negatives Comments Table */
    }
    {
      /* {sentiments?.negatives && ( */
    }
    {
      /* <table className="flex h-full w-1/2 flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
              <thead className="flex h-fit w-full flex-col">
                <tr className="flex h-full w-full flex-col">
                  <th className="flex h-full w-full items-center justify-between space-x-2 px-4 py-2">
                    <span className="scrollbar-hide overflow-scroll whitespace-nowrap">
                      NEGATIVE - {sentiments?.negatives?.length}
                    </span>
                    <button
                      onClick={() => generateGroups(sentiments?.negatives)}
                      className="whitespace-nowrap rounded-full bg-blue-600 px-2 py-1 text-sm font-normal"
                    >
                      Group them
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody
                id="table_body"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                <List
                  height={600}
                  itemCount={sentiments?.negatives?.length}
                  itemSize={50}
                  width="100%"
                >
                  {NegativeCommentsRow}
                </List>
              </tbody>
            </table> */
    }
    {
      /* )} */
    }
    {
      /* </div> */
    }
    {
      /* )} */
    }
    {
      /* {sentiments?.questions && sentiments?.neutrals && ( */
    }
    {
      /* <div className="flex min-h-[50%] w-full items-center space-x-6"> */
    }
    {
      /* Questions Comments Table */
    }
    {
      /* {sentiments?.questions && ( */
    }
    {
      /* <table className="flex h-full w-1/2 flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
              <thead className="flex h-fit w-full flex-col">
                <tr className="flex h-full w-full flex-col">
                  <th className="flex h-full w-full items-center justify-between space-x-2 px-4 py-2">
                    <span className="scrollbar-hide overflow-scroll whitespace-nowrap">
                      QUESTION - {sentiments?.questions?.length}
                    </span>
                    <button
                      onClick={() => generateGroups(sentiments?.questions)}
                      className="whitespace-nowrap rounded-full bg-blue-600 px-2 py-1 text-sm font-normal"
                    >
                      Group them
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody
                id="table_body"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                <List
                  height={600}
                  itemCount={sentiments?.questions?.length}
                  itemSize={50}
                  width="100%"
                >
                  {QuestionCommentsRow}
                </List>
              </tbody>
            </table> */
    }
    {
      /* )} */
    }
    {
      /* Neutral Comments Table */
    }
    {
      /* {sentiments?.neutrals && ( */
    }
    {
      /* <table className="flex h-full w-1/2 flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
              <thead className="flex h-fit w-full flex-col">
                <tr className="flex h-full w-full flex-col">
                  <th className="flex h-full w-full items-center justify-between space-x-2 px-4 py-2">
                    <span className="scrollbar-hide overflow-scroll whitespace-nowrap">
                      NEUTRAL - {sentiments?.neutrals?.length}
                    </span>
                    <button
                      onClick={() => generateGroups(sentiments?.neutrals)}
                      className="whitespace-nowrap rounded-full bg-blue-600 px-2 py-1 text-sm font-normal"
                    >
                      Group them
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody
                id="table_body"
                className="flex h-full w-full flex-col overflow-hidden"
              >
                <List
                  height={600}
                  itemCount={sentiments?.neutrals?.length}
                  itemSize={50}
                  width="100%"
                >
                  {NeutralCommentsRow}
                </List>
              </tbody>
            </table> */
    }
    {
      /* )} */
    }
    {
      /* </div> */
    }
    {
      /* )} */
    }

    
    // render-accordion
    // <ControlledAccordion
    //       // Forward the `providerValue` directly to `ControlledAccordion`
    //       providerValue={providerValue}
    //       className="scrollbar-hide flex h-full w-full flex-col divide-y divide-[#252C36] overflow-scroll rounded-2xl border border-[#252C36] bg-[#0E1420]"
    //     >
    //       {groups.map((group, index) => (
    //         <AccordionItem
    //           key={index}
    //           // Set an explicit `itemKey`
    //           itemKey={`item-${index}`}
    //           header={
    //             <div
    //               onClick={() => {
    //                 setCurrentIndex((prev) => (prev === index ? null : index));
    //                 if (group?.group_of_comments?.length === 1) {
    //                   setSelectedComments([group?.group_of_comments[0]]);
    //                 } else {
    //                   setSelectedComments([]);
    //                 }
    //               }}
    //               className="flex w-full items-center space-x-2 overflow-hidden pb-2"
    //             >
    //               <div className="scrollbar-hide flex w-full overflow-scroll whitespace-nowrap">
    //                 {`${group.group_about} :`}
    //               </div>
    //               <div>
    //                 <IoIosArrowDown
    //                   className={cn(
    //                     currentIndex === index && "-rotate-180",
    //                     "text-xl text-white transition-transform duration-[0.2s] ease-in-out",
    //                   )}
    //                 />
    //               </div>
    //             </div>
    //           }
    //           className="flex-col divide-y divide-[#252C36] px-4 py-3"
    //         >
    //           <form onSubmit={(e) => handleReply(e, selectedComments)}>
    //             <div className="flex w-full space-x-2">
    //               <textarea className="scrollbar-hide mt-2 h-20 w-full resize-none rounded-xl border border-[#252C36] bg-[#1D242E] px-4 py-2 focus:outline-none" />
    //               <button
    //                 type="submit"
    //                 disabled={isPending}
    //                 className="mt-2 h-fit rounded-full bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:text-white/50"
    //               >
    //                 {isPending ? (
    //                   <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-400 border-t-blue-400/50" />
    //                 ) : (
    //                   "Send"
    //                 )}
    //               </button>
    //             </div>
    //           </form>
    //         </AccordionItem>
    //       ))}
    //     </ControlledAccordion>

      // Destructuring `toggle` and `toggleAll` from `providerValue`
  // const { toggle } = providerValue;

  // console.log(selectedComments);
  // useEffect(() => {
  //   toggle(`item-0`);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);


  // render-accordion

  {
    /* <div className="flex w-full max-w-full flex-col divide-y divide-[#252C36] overflow-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]">
          <div className="flex w-full px-4 py-2 font-bold">
            <p className="scrollbar-hide w-full overflow-scroll whitespace-nowrap tracking-wider">
              {groups[currentIndex]?.group_about
                ? `Comment: ${groups[currentIndex]?.group_of_comments?.length} - ${groups[currentIndex]?.group_about} :`
                : "Unknown"}
            </p>
          </div>
          {groups[currentIndex]?.group_of_comments?.length > 1 && (
            <div className="flex w-full items-center p-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedComments((prev) =>
                    JSON.stringify(prev) ===
                    JSON.stringify(groups[currentIndex]?.group_of_comments)
                      ? []
                      : groups[currentIndex]?.group_of_comments,
                  )
                }
                className="mr-auto rounded-full bg-blue-600 px-2 py-1 text-sm"
              >
                {JSON.stringify(selectedComments) ===
                JSON.stringify(groups[currentIndex]?.group_of_comments)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          )}
          <div className="scrollbar-hide flex h-full w-full flex-col divide-y divide-[#252C36] overflow-scroll">
            {groups[currentIndex]?.group_of_comments?.map(
              (group_of_comment, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(group_of_comment)}
                  className="flex cursor-pointer items-center space-x-2 px-4 py-2"
                >
                  {groups[currentIndex]?.group_of_comments?.length > 1 && (
                    <label className="relative flex cursor-pointer items-center rounded-md">
                      <input
                        readOnly
                        className="peer relative h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-900 bg-gray-900/25 transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-gray-100 dark:bg-gray-100/25"
                        checked={JSON.stringify(selectedComments).includes(
                          JSON.stringify(group_of_comment),
                        )}
                        type="checkbox"
                      />
                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </label>
                  )}
  
                  <div
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    className={cn(
                      hoverIndex !== index && "truncate",
                      "text w-full cursor-pointer",
                    )}
                  >
                    {
                      sentimentValue.find(
                        (item) => item.cid === group_of_comment.cid,
                      ).text
                    }
                  </div>
                </div>
              ),
            )}
          </div>
        </div> */
  }
  
  {
    /* <div className="flex h-full w-full space-x-2 overflow-hidden">
        <div className="flex max-h-full min-w-[320px] max-w-[320px] flex-col space-y-2 overflow-hidden">
          <div className="h-fit w-full px-4 py-2 text-start text-xl font-bold capitalize">
            Categorize - {groups.length}
          </div>
          <div className="scrollbar-hide flex h-full w-full flex-col divide-y divide-[#252C36] overflow-scroll rounded-2xl border border-[#252C36] bg-[#0E1420]">
            {groups.map((group, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentIndex((prev) => (prev === index ? null : index));
                  if (group?.group_of_comments?.length === 1) {
                    setSelectedComments([group?.group_of_comments[0]]);
                  } else {
                    setSelectedComments([]);
                  }
                }}
                className={cn(currentIndex === index && "bg-zinc-700","flex h-fit w-full px-4 py-2")}
              >
                <p
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className={cn(
                    hoverIndex !== index && "truncate",
                    "w-full cursor-pointer",
                  )}
                >{`${group.group_about} :`}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full max-w-full flex-col divide-y divide-[#252C36] overflow-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]">
          <div className="flex w-full px-4 py-2 font-bold">
            <p className="scrollbar-hide w-full overflow-scroll whitespace-nowrap tracking-wider">
              {groups[currentIndex]?.group_about
                ? `Comment: ${groups[currentIndex]?.group_of_comments?.length} - ${groups[currentIndex]?.group_about} :`
                : "Unknown"}
            </p>
          </div>
          {groups[currentIndex]?.group_of_comments?.length > 1 && (
            <div className="flex w-full items-center p-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedComments((prev) =>
                    JSON.stringify(prev) ===
                    JSON.stringify(groups[currentIndex]?.group_of_comments)
                      ? []
                      : groups[currentIndex]?.group_of_comments,
                  )
                }
                className="mr-auto rounded-full bg-blue-600 px-2 py-1 text-sm"
              >
                {JSON.stringify(selectedComments) ===
                JSON.stringify(groups[currentIndex]?.group_of_comments)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          )}
          <div className="scrollbar-hide flex h-full w-full flex-col divide-y divide-[#252C36] overflow-scroll">
            {groups[currentIndex]?.group_of_comments?.map(
              (group_of_comment, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(group_of_comment)}
                  className="flex cursor-pointer items-center space-x-2 px-4 py-2"
                >
                  {groups[currentIndex]?.group_of_comments?.length > 1 && (
                    <label className="relative flex cursor-pointer items-center rounded-md">
                      <input
                        readOnly
                        className="peer relative h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-900 bg-gray-900/25 transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-gray-100 dark:bg-gray-100/25"
                        checked={JSON.stringify(selectedComments).includes(
                          JSON.stringify(group_of_comment),
                        )}
                        type="checkbox"
                      />
                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </label>
                  )}
  
                  <div
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    className={cn(
                      hoverIndex !== index && "truncate",
                      "text w-full cursor-pointer",
                    )}
                  >
                    {
                      sentimentValue.find(
                        (item) => item.cid === group_of_comment.cid,
                      ).text
                    }
                  </div>
                </div>
              ),
            )}
          </div>
          {selectedComments.length > 0 && (
            <form className="" onSubmit={(e) => handleReply(e, selectedComments)}>
              <div className="flex h-fit w-full items-end bg-[#1D242E]">
                <textarea className="scrollbar-hide h-20 w-full resize-none bg-[#1D242E] px-4 py-2 focus:outline-none" />
                <button
                  type="submit"
                  disabled={isPending}
                  className="mb-2 mr-2 h-fit rounded-full bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:text-white/50"
                >
                  {isPending ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-400 border-t-blue-400/50" />
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div> */
  }


  // menu operations of comments

  // moderationStatus === "heldForReview"
    //   ? {
    //       label: "Mark as to Public",
    //       onClick: (e) => {
    //         const { value } = e;
    //         console.log("published", value);
    //         handleModerator({ ...value, moderationStatus: "published" });
    //       },
    //     }
    //   : {
    //       label: "Mark as to Review",
    //       onClick: (e) => {
    //         const { value } = e;
    //         console.log("heldForReview", value);
    //         handleModerator({ ...value, moderationStatus: "heldForReview" });
    //       },
    //     },
    // {
    //   label: "Mark as Spam",
    //   onClick: (e) => {
    //     const { value } = e;
    //     console.log("likelySpam", e);
    //     handleModerator({ ...value, moderationStatus: "likelySpam" });
    //   },
    // },



    // handleModeration  helper
    // const handleModerator = async (moderationComments, banAuthor = false) => {
    //   const res = await moderateComments(
    //     moderationComments,
    //     setIsModerating,
    //     banAuthor,
    //   );
    //   console.log(res);
  
    //   if (res[0].status !== 204) return;
    //   const recentModeration = getSessionStorage("moderation") || [];
  
    //   const copy_of_moderations = recentModeration?.filter(
    //     (com) =>
    //       !moderationComments.some(
    //         (moderationComment) => moderationComment.cid === com.cid,
    //       ),
    //   );
  
    //   const filteredList = list?.filter(
    //     (com) =>
    //       !moderationComments.some(
    //         (moderationComment) => moderationComment?.cid === com?.cid,
    //       ),
    //   );
  
    //   set_dataCopy(filteredList);
  
    //   sessionStorage.setItem(
    //     "moderation",
    //     JSON.stringify([
    //       ...moderationComments.map((moderationComment) => ({
    //         ...moderationComment,
    //         banAuthor,
    //       })),
    //       ...copy_of_moderations,
    //     ]),
    //   );
    //   setSelected([]);
    // };