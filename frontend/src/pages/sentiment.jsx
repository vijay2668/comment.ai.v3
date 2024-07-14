import { FixedSizeList as List } from "react-window";
import { getSessionStorage, renderRow, reply } from "../helpers";
import { useParams } from "react-router-dom";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { IoIosArrowDown } from "react-icons/io";
import { cn } from "../utils";
import { useState } from "react";
import toast from "react-hot-toast";

export const Sentiment = ({ sentimentsGroups }) => {
  const { sentiment } = useParams();
  const { sentiments } = getSessionStorage("comments_and_sentiments") || {};
  const sentimentValue = sentiments ? sentiments[sentiment] : [];
  const recentGroups = getSessionStorage("sentimentsGroups") || {};
  const { [sentiment]: groups } = sentimentsGroups;
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const SentimentRow = (props) =>
    renderRow(sentimentValue, props.index, props.style);

  const handleReply = async (e, group) => {
    e.preventDefault();
    const { value } = e.target[0];
    if (!value || value.trim() === "") {
      toast.error("Your reply is empty!");
    } else {
      const res = await reply(group, setIsPending, value);
      console.log(res);
      if (res) e.target[0].value = "";
    }
  };

  const renderAccordion = (groups) => (
    <Accordion className="scrollbar-hide flex max-h-[50%] w-full flex-col divide-y divide-[#252C36] overflow-scroll rounded-2xl border border-[#252C36] bg-[#0E1420]">
      {groups.map((group, index) => (
        <AccordionItem
          key={index}
          header={
            <div
              onClick={() => {
                setCurrentIndex((prev) => (prev === index ? null : index));
              }}
              className="flex w-full items-center space-x-2 overflow-hidden pb-2"
            >
              <div className="scrollbar-hide flex w-full overflow-hidden whitespace-nowrap">
                {`${group.group_about} :`}
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
          className="flex-col divide-y divide-[#252C36] px-4 py-3"
        >
          <form onSubmit={(e) => handleReply(e, group)}>
            <ul className="scrollbar-hide flex h-fit max-h-40 w-full flex-col overflow-scroll border-b border-[#252C36] py-2">
              {group.group_of_comments.map((group_of_comment, index) => (
                <li key={index}>{group_of_comment.text}</li>
              ))}
            </ul>
            <div className="flex w-full space-x-2">
              <textarea className="scrollbar-hide mt-2 h-20 w-full resize-none rounded-xl border border-[#252C36] bg-[#1D242E] px-4 py-2 focus:outline-none" />
              <button
                type="submit"
                className="mt-2 h-fit rounded-full bg-blue-600 px-4 py-2 text-white"
              >
                Send
              </button>
            </div>
          </form>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div className="flex h-full w-full flex-col space-y-6 overflow-hidden">
      {groups && groups.length > 0
        ? renderAccordion(groups)
        : recentGroups[sentiment] && recentGroups[sentiment].length > 0
          ? renderAccordion(recentGroups[sentiment])
          : null}
      <table
        className={cn(
          groups?.length > 0 && recentGroups?.[sentiment]?.length > 0
            ? "max-h-[50%]"
            : "max-h-full",
          "flex h-full w-full flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]",
        )}
      >
        <thead className="flex h-fit w-full flex-col">
          <tr className="flex h-full w-full flex-col">
            <th className="h-full w-full px-4 py-2 uppercase">
              {sentiment?.slice(0, -1)} - {sentiments[sentiment]?.length}
            </th>
          </tr>
        </thead>
        <tbody
          id="table_body"
          className="flex h-full w-full flex-col overflow-hidden"
        >
          <List
            height={600}
            itemCount={sentimentValue.length}
            itemSize={50}
            width="100%"
          >
            {SentimentRow}
          </List>
        </tbody>
      </table>
    </div>
  );
};
