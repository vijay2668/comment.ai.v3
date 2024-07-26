import {
  AccordionItem,
  ControlledAccordion,
  useAccordionProvider,
} from "@szhsin/react-accordion";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoIosArrowDown } from "react-icons/io";
import { arraysAreEqual, linkRegex, replacer, replies } from "../helpers";
import { cn } from "../utils";
import { FaRegUser } from "react-icons/fa";
import { Tooltip } from "./tooltip";
import { FiThumbsUp } from "react-icons/fi";

export const RenderAccordion = ({ groupification, sentimentValue }) => {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedComments, setSelectedComments] = useState([]);
  const [isPending, setIsPending] = useState(false);

  const handleReply = async (e, group) => {
    e.preventDefault();
    const { value } = e.target[0];
    if (!value || value.trim() === "") {
      toast.error("Your reply is empty!");
    } else if (group?.length === 0) {
      toast.error("Please choose alteast one comment to reply!");
    } else {
      const res = await replies(group, setIsPending, value);
      // console.log(res);
      if (res) e.target[0].value = "";
    }
  };

  const providerValue = useAccordionProvider();

  const handleSelect = (selected) => {
    // console.log(selected);
    setSelectedComments((prev) => {
      if (JSON.stringify(prev).includes(JSON.stringify(selected))) {
        return prev.filter(
          (item) => JSON.stringify(item) !== JSON.stringify(selected),
        );
      } else {
        return [...prev, selected];
      }
    });
  };

  // console.log(selectedComments);
  // console.log(sentimentValue);

  return (
    <div className="flex h-full w-full flex-col space-y-2 overflow-hidden">
      <ControlledAccordion
        // Forward the `providerValue` directly to `ControlledAccordion`
        providerValue={providerValue}
        className="flex h-full w-full flex-col divide-y divide-[#252C36] overflow-auto overflow-x-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]"
      >
        {groupification?.map((group, index) => (
          <AccordionItem
            key={index}
            itemKey={`item-${index}`}
            header={
              <div
                onClick={() => {
                  setCurrentIndex((prev) => (prev === index ? null : index));
                  if (group?.group_of_comments?.length === 1) {
                    setSelectedComments([group?.group_of_comments[0]]);
                  } else {
                    setSelectedComments([]);
                  }
                }}
                className="flex w-full items-center space-x-2 overflow-hidden px-4 py-3"
              >
                <div className="flex w-full items-center justify-start overflow-hidden">
                  <div className="flex w-fit items-center p-2">
                    <label className="relative flex cursor-pointer items-center rounded-md">
                      <input
                        className="peer relative h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-900 bg-gray-900/25 transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-gray-100 dark:bg-gray-100/25"
                        // checked={group?.group_of_comments.lengthJSON.stringify(selectedComments))}
                        checked={arraysAreEqual(
                          selectedComments,
                          group?.group_of_comments,
                        )}
                        onClick={(e) => {
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          }
                        }}
                        onChange={() =>
                          setSelectedComments((prev) =>
                            arraysAreEqual(prev, group?.group_of_comments)
                              ? []
                              : group.group_of_comments,
                          )
                        }
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
                  </div>

                  <span className="truncate">{`${group.group_about} :`}</span>
                </div>
                <div>
                  <IoIosArrowDown
                    className={cn(
                      currentIndex === index && "-rotate-180",
                      "text-xl text-white transition-transform duration-[0.2s] ease-in-out",
                    )}
                  />
                </div>
              </div>
            }
            className={cn(
              currentIndex === index && "min-h-full",
              "flex flex-col",
            )}
          >
            <div className="flex h-full w-full flex-col divide-y divide-[#252C36] overflow-auto overflow-x-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]">
              {group?.group_of_comments?.map((group_of_comment, i) => {
                const originalComment = sentimentValue.find(
                  (item) => item.cid === group_of_comment.cid,
                );
                return (
                  <div
                    key={i}
                    className="flex h-fit w-full items-start space-x-4 px-4 py-2"
                  >
                    <div
                      onClick={() => handleSelect(group_of_comment)}
                      className="flex w-full cursor-pointer items-start space-x-2 overflow-hidden"
                    >
                      {group?.group_of_comments?.length > 1 && (
                        <label className="relative mt-1.5 flex cursor-pointer items-center rounded-md">
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
                      <div className="mt-0.5 flex min-h-6 min-w-6 items-center justify-center rounded-full border border-[#252C36] text-[#7D828F]">
                        <FaRegUser className="text-xs" />
                      </div>
                      <div className="flex flex-col space-y-1 overflow-hidden">
                        <div className="flex w-full items-center space-x-2 overflow-hidden text-xs">
                          <span className="truncate">
                            {originalComment?.author}
                          </span>
                          <span className="whitespace-nowrap text-[#7D828F]">
                            {originalComment?.time}
                          </span>
                        </div>
                        <div
                          onMouseEnter={() => setHoverIndex(i)}
                          onMouseLeave={() => setHoverIndex(null)}
                          className={cn(
                            hoverIndex !== i && "truncate",
                            "w-full cursor-pointer text-sm",
                          )}
                        >
                          {/* {originalComment?.text} */}
                          {originalComment?.text?.replace(linkRegex, replacer)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex h-fit min-w-fit items-center justify-start space-x-2">
                      <Tooltip content="Like Count">
                        <div className="flex min-w-fit items-center justify-start space-x-2 text-sm">
                          <span>{originalComment?.votes}</span>
                          <div>
                            <FiThumbsUp className="text-green-500" />
                          </div>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={(e) => handleReply(e, selectedComments)}>
              <div className="flex w-full overflow-hidden rounded-xl border border-[#252C36] bg-[#1D242E]">
                <textarea className="h-20 w-full resize-none bg-[#1D242E] p-2 focus:outline-none" />
                <button
                  type="submit"
                  disabled={isPending}
                  className="mr-2 mt-2 h-fit rounded-full bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:text-white/50"
                >
                  {isPending ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-400 border-t-blue-400/50" />
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </form>
          </AccordionItem>
        ))}
      </ControlledAccordion>
    </div>
  );
};
