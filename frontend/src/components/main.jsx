import { useState, useEffect } from "react";
import {
  download,
  fetchComments,
  handleCategorize,
  handleGroups,
  handleSimplified,
  reply,
} from "../helpers";
import { BsArrowRepeat } from "react-icons/bs";
import { AiOutlineDownload } from "react-icons/ai";
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";

export const MainPage = () => {
  const [input, setInput] = useState([]);
  const [textarea, setTextarea] = useState(null);
  const [comments, setComments] = useState([]);
  const [categorize, setCategorize] = useState(null);
  const [groups, setGroups] = useState(null);
  const [selected, setSelected] = useState([]);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [options, setOptions] = useState({
    replies: false,
    sort: "relevance",
    max: "50",
  });

  // for updating the multiselect's state
  // useEffect(() => {
  //   if (comments?.length === 0) return;
  //   setInterval(async () => {
  //     const details = await axios
  //       .get(
  //         `https://api.socialcounts.org/youtube-live-subscriber-count/${comments[0].channel}`,
  //       )
  //       .then((res) => ({
  //         subscribers: res.data.est_sub,
  //         channel_views: res.data.table[0].count,
  //       }));

  //     setCreatorDetails(details);
  //   }, 3000);
  // }, [comments]);

  // for updating the multiselect's state
  useEffect(() => {
    if (comments?.length === 0) return;
    setSelected(
      Object.keys(comments[0])?.map((key) => ({
        label: key,
        value: key,
      })),
    );
  }, [comments]);

  // console.log(options);
  return (
    <div className="flex h-fit w-full flex-col space-y-4 overflow-x-hidden p-5">
      <h2 className="text-center text-xl font-bold">
        Live Stream Comments: {comments.length}
      </h2>
      <h2 className="text-center text-lg font-semibold">
        Live Subscribers: {creatorDetails?.subscribers || 0} Channel Views:{" "}
        {creatorDetails?.channel_views || 0}
      </h2>
      <h2 className="text-center text-lg font-semibold">
        Questions: {categorize?.questions?.length || 0}, Negatives:{" "}
        {categorize?.negatives?.length || 0}, Positives:{" "}
        {categorize?.positives?.length || 0}, Neutral:{" "}
        {categorize?.neutrals?.length || 0}
      </h2>

      {/* groups of comments to reply */}
      <div className="space-y-2 divide-y divide-black">
        {groups?.map((group, index) => (
          <div key={index}>
            <h2>{group?.group_about}</h2>
            <ul>
              {group?.group_of_comments?.map((group_of_comment) => (
                <li key={group_of_comment?.cid}>
                  {group_of_comment?.simplified_comment}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline space-x-2">
              <textarea
                type="text"
                className="w-5/6 rounded-md border border-black p-1.5"
                value={textarea[index]}
                onChange={(e) =>
                  setTextarea((prev) => {
                    let alltextarea = [...prev];
                    alltextarea[index] = e.target.value;
                    return alltextarea;
                  })
                }
              />
              <button
                className="w-1/6 rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
                onClick={async () => {
                  // Update the state
                  let selectedGroup;

                  setGroups((prev) => {
                    const newGroups = [...prev];
                    newGroups[index] = {
                      ...newGroups[index],
                      reply: textarea[index],
                    };

                    selectedGroup = newGroups[index];

                    return newGroups;
                  });

                  try {
                    await reply(selectedGroup);
                    setTextarea((prev) => {
                      let alltextarea = [...prev];
                      alltextarea[index] = "";
                      return alltextarea;
                    });
                  } catch (error) {
                    console.error(
                      "Error during authentication or execution:",
                      error,
                    );
                  }
                }}
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full items-baseline space-x-2">
        <div className="flex w-1/4 flex-col space-y-2">
          <div className="flex w-full items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-md border border-black p-1"
            />

            <button
              className="w-fit rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
              onClick={() =>
                fetchComments({
                  input,
                  setComments,
                  options,
                })
              }
            >
              <BsArrowRepeat className="text-2xl" />
            </button>
            <button
              className="w-fit rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
              onClick={() => {
                let type = prompt(
                  "Please enter one of the following type:\ntxt\nhtml\njson\ncsv\nxls",
                );

                let fileName = prompt("Please name the file");

                let fields = selected?.map((select) => select?.value);

                download({ data: comments, type, fields, fileName });
              }}
            >
              <AiOutlineDownload className="text-2xl" />
            </button>
          </div>
          <div className="flex w-full flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                checked={options["replies"]}
                onChange={(e) =>
                  setOptions((prev) => {
                    const newOptions = { ...prev };
                    newOptions["replies"] = e.target.checked;
                    return newOptions;
                  })
                }
                type="checkbox"
              />
              <span>Do you want Replies to download?</span>
            </div>
            <div className="flex w-full flex-col space-y-2">
              <select
                name="sort"
                value={options["sort"]}
                onChange={(e) =>
                  setOptions((prev) => {
                    const newOptions = { ...prev };
                    newOptions["sort"] = e.target.value;
                    return newOptions;
                  })
                }
                className="w-full cursor-pointer rounded-md border border-black p-1.5"
              >
                <option value="relevance">Top comments</option>
                <option value="time">Newest first</option>
              </select>
              <select
                name="max"
                value={options["max"]}
                onChange={(e) =>
                  setOptions((prev) => {
                    const newOptions = { ...prev };
                    newOptions["max"] = e.target.value;
                    return newOptions;
                  })
                }
                className="w-full cursor-pointer rounded-md border border-black p-1.5"
              >
                <option value="50">50 comments</option>
                <option value="100">100 comments</option>
                <option value="300">300 comments</option>
                <option value="1000">1000 comments</option>
                <option value="1800">All Comments (Max 1800)</option>
              </select>
            </div>
            {comments?.length !== 0 && (
              <MultiSelect
                options={Object.keys(comments[0])?.map((key) => ({
                  label: key,
                  value: key,
                }))}
                value={selected}
                onChange={setSelected}
                labelledBy="Select"
              />
            )}
          </div>
        </div>

        <button
          className="w-1/4 rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
          onClick={() =>
            handleCategorize({
              comments: comments.filter((comment) => comment.cid.length === 26),
              setCategorize,
            })
          }
        >
          Categorize Them
        </button>
        <button
          className="w-1/4 rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
          onClick={() =>
            handleSimplified({
              questions: categorize?.questions,
              setCategorize,
            })
          }
        >
          Simplified Them
        </button>
        <button
          className="w-1/4 rounded-md border border-black bg-gray-200 p-1.5 hover:bg-gray-400"
          onClick={() =>
            handleGroups({
              questions: categorize.questions,
              setGroups,
              setTextarea,
            })
          }
        >
          Group Them
        </button>
      </div>
      <div className="flex h-[35rem] w-full space-x-2 overflow-hidden">
        <ul className="flex h-full w-1/2 flex-col space-y-2 overflow-x-hidden overflow-y-scroll rounded-md border border-black px-8 py-2">
          {comments?.map((comment, index) => (
            <li className="w-full" key={index}>
              {comment?.cid} + {comment?.text}
            </li>
          ))}
        </ul>
        <div className="flex h-full w-1/2 flex-col space-y-2 overflow-x-hidden overflow-y-scroll rounded-md border border-black px-8 py-2">
          {categorize &&
            Object.entries(categorize).map((category, index) => (
              <div key={index}>
                <h3>{category[0]}:</h3>
                <ul>
                  {category[1].map((comment) => (
                    <li key={comment.cid}>
                      {comment.cid}+{comment.text}+
                      {comment?.simplified_comment &&
                        comment.simplified_comment}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
