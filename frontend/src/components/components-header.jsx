import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaLayerGroup } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { getSessionStorage, handleGroups, handleSimplified } from "../helpers";
import { useEffect } from "react";
import { cn } from "../utils";

export const ComponentsHeader = ({ setSentimentsGroups }) => {
  const navigate = useNavigate();
  const { sentiment } = useParams();
  const { sentiments } = getSessionStorage("comments_and_sentiments") || {};
  const sentimentValue = sentiments ? sentiments[sentiment] : [];

  const { isPending, mutateAsync: generateGroups } = useMutation({
    mutationFn: async (sentiment) => {
      const simplified_comments = await handleSimplified(sentiment);
      return await handleGroups({ simplified_comments, sentiment });
    },
    onSuccess: (data) => {
      if (!data) return;
      setSentimentsGroups((prev) => {
        const oldSentiments = { ...prev };

        sessionStorage.setItem(
          "sentimentsGroups",
          JSON.stringify({
            ...oldSentiments,
            [sentiment]: data ? data : [],
            isPending: false,
          }),
        );

        const newSentiments = {
          ...oldSentiments,
          [sentiment]: data ? data : [],
          isPending: false,
        };

        return newSentiments;
      });

      // console.log(data);
    },
  });

  useEffect(() => {
    if (!isPending) return;
    setSentimentsGroups((prev) => ({
      ...prev,
      isPending,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <div className="flex h-fit w-full items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="group flex h-fit w-fit items-center space-x-1"
      >
        <div className="flex min-h-10 min-w-10 items-center justify-center rounded-l-lg border border-[#252C36] bg-[#0E1420] transition-colors group-hover:bg-[#1D242E]">
          <IoIosArrowBack className="h-5 w-5" />
        </div>
        <div className="flex h-10 w-fit items-center justify-center rounded-r-lg border border-[#252C36] bg-[#0E1420] px-6 transition-colors group-hover:bg-[#1D242E]">
          <p>Back</p>
        </div>
      </button>
      {sentimentValue && sentimentValue.length !== 0 && (
        <button
          disabled={isPending}
          onClick={() => generateGroups(sentimentValue)}
          className="group flex h-fit w-fit items-center space-x-1"
        >
          <div
            className={cn(
              isPending
                ? "border-0 text-zinc-500"
                : "border group-hover:bg-[#1D242E]",
              "flex min-h-10 min-w-10 items-center justify-center rounded-l-lg border-[#252C36] bg-[#0E1420] transition-colors",
            )}
          >
            <FaLayerGroup className="h-4 w-4" />
          </div>
          <div
            className={cn(
              isPending
                ? "border-0 text-zinc-500"
                : "border group-hover:bg-[#1D242E]",
              "flex h-10 w-fit items-center justify-center rounded-r-lg border-[#252C36] bg-[#0E1420] px-6 transition-colors",
            )}
          >
            {isPending ? (
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-400 border-t-blue-400/50" />
            ) : (
              <p>Group to Reply</p>
            )}
          </div>
        </button>
      )}
    </div>
  );
};
