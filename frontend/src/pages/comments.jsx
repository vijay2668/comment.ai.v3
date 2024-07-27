import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaLayerGroup } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import { CommentsComp } from "../components/comments";
import { Loader } from "../components/loader/loader";
import { MenuComp } from "../components/menu";
import { RenderAccordion } from "../components/render-accordion";
import {
  arraysAreEqual,
  backend_url,
  deleteComments,
  fetchComments,
  getCookie,
  getCurrentUser,
  getGroupification,
  getSentiment,
  getSessionStorage,
  getVideoSession,
  handleGroups,
  handleSimplified,
  moderateComments,
} from "../helpers";
import { cn } from "../utils";

const Comments = () => {
  const { videoId } = useParams();

  const refresh_token = getCookie("refresh_token");
  // Queries and Mutations
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    refetchOnWindowFocus: false,
    enabled: !!refresh_token,
  });

  const { data: videoSession } = useQuery({
    queryKey: ["videoSession"],
    queryFn: () => getVideoSession(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
  });

  const { data: recentSentiment } = useQuery({
    queryKey: ["recentSentiment"],
    queryFn: () => getSentiment(videoSession.id),
    refetchOnWindowFocus: false,
    enabled: !!videoSession,
  });

  const { data: recentGroupification, isFetching: isFetchingGroupification } =
    useQuery({
      queryKey: [`recentGroupification-comments`],
      queryFn: () => getGroupification(recentSentiment.id, "comments"),
      refetchOnWindowFocus: false,
      enabled: !!recentSentiment,
    });

  const [searchParams] = useSearchParams();
  const sort = searchParams.get("sort");
  const max = searchParams.get("max");

  const [groupification, setGroupification] = useState([]);

  useEffect(() => {
    if (!recentGroupification) return;
    setGroupification(recentGroupification.groupification_data);
  }, [recentGroupification]);

  // console.log(groupification);

  const { isPending, mutateAsync: generateGroups } = useMutation({
    mutationFn: async (sentimentValue) => {
      const simplified_comments = await handleSimplified(sentimentValue);
      return await handleGroups({ simplified_comments, sentimentValue });
    },
    onSuccess: async (latestGroupification) => {
      // console.log(
      //   "groupification generated successfully:",
      //   latestGroupification,
      // );

      if (recentSentiment) {
        await axios.post(
          `${backend_url}/api/groupification/${recentSentiment?.id}/comments`, //getLastRecentSentiment.id as sentimentId as db.sentiment.id & // comments as sentimentKey as (positives, negatives, questions, neutrals, comments)
          {
            videoId: videoSession.id, // videoId as db.video.id
            channelId: currentUser.id, //currentUser's channel id
            groupification_data: latestGroupification, //groupification data
          },
        );
      } else {
        const generatedSentiment = await axios
          .post(`${backend_url}/api/sentiment/${videoSession.id}`, {
            channelId: currentUser.id, //currentUser's channel id
            sentiment_data: { comments },
          })
          .then((res) => res.data);

        await axios.post(
          `${backend_url}/api/groupification/${generatedSentiment?.id}/comments`, //getLastRecentSentiment.id as sentimentId as db.sentiment.id & // comments as sentimentKey as (positives, negatives, questions, neutrals, comments)
          {
            videoId: videoSession.id, // videoId as db.video.id
            channelId: currentUser.id, //currentUser's channel id
            groupification_data: latestGroupification, //groupification data
          },
        );
      }

      setGroupification(latestGroupification);
      // console.log(latestGroupification);

      toast.custom(
        (t) => (
          <div
            onClick={() => {
              setTab(1);
              toast.dismiss(t.id);
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } pointer-events-auto flex w-full max-w-md cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex w-full">
              <div className="w-0 flex-1 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">Done 👍</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Click here to check
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-scale h-1 bg-red-500"></div>
          </div>
        ),
        {
          position: "bottom-right",
          duration: 10000,
        },
      );
    },
  });

  const [_dataCopy, set_dataCopy] = useState([]);

  const [tab, setTab] = useState(0);

  // operations states start
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selected, setSelected] = useState([]);
  // operations states end

  // Queries and Mutations
  const { data: comments = [], isFetching } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const latestComments = await fetchComments({
        videoId,
        options: { max, sort },
      });

      return latestComments;
    },
    refetchOnWindowFocus: false,
    enabled: !!refresh_token,
  });

  const handleModerator = async (moderationComments, banAuthor = false) => {
    const res = await moderateComments(
      moderationComments,
      setIsModerating,
      banAuthor,
    );
    // console.log(res);

    if (res[0].status !== 204) return;
    const recentModeration = getSessionStorage("moderation") || [];

    const copy_of_moderations = [...recentModeration].filter(
      (com) =>
        !moderationComments.some(
          (moderationComment) => moderationComment.cid === com.cid,
        ),
    );

    const filteredList = _dataCopy.filter(
      (com) =>
        !moderationComments.some(
          (moderationComment) => moderationComment.cid === com.cid,
        ),
    );

    set_dataCopy(filteredList);

    sessionStorage.setItem(
      "moderation",
      JSON.stringify([
        ...moderationComments.map((moderationComment) => ({
          ...moderationComment,
          banAuthor,
        })),
        ...copy_of_moderations,
      ]),
    );
    setSelected([]);
  };

  // menu operations start
  const commonMenuOperations = [
    {
      label: "Hide user from channel",
      onClick: (e) => {
        const { value } = e;
        if (
          value.some(
            (comment) => comment.channel === currentUser.youtubeChannelId,
          )
        ) {
          toast.error("You can't Ban yourself, Please unSelect your Comments");
          return;
        }
        // console.log("banAuthor", e);
        handleModerator(
          value.map((comment) => ({
            ...comment,
            moderationStatus: "rejected",
          })),
          true,
        );
      },
    },
    {
      label: "Delete",
      onClick: async (e) => {
        const { value } = e;
        const res = await deleteComments(value, setIsDeleting);

        if (res[0].status !== 204) return;

        // console.log("delete", value);
        const filteredList = _dataCopy.filter(
          (com) => !value.some((comment) => comment.cid === com.cid),
        );

        set_dataCopy(filteredList);
        setSelected([]);
      },
    },
  ];

  // menu operations end

  if (isFetching || isFetchingGroupification)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Loader />
      </div>
    );

  if (!currentUser)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        User not Found
      </div>
    );

  if (!videoSession)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        VideoSession not Found
      </div>
    );

  return (
    <div className="flex h-full w-full flex-col space-y-2 overflow-hidden">
      <div className="flex h-fit w-full items-center justify-between px-4">
        <div className="h-fit w-fit text-xl font-bold capitalize">
          {showCheckboxes
            ? `Selected - ${selected?.length}`
            : tab === 0
              ? `Comment - ${comments?.length}`
              : `Categorize - ${groupification?.length}`}
        </div>
        {videoSession?.youtubeChannelId === currentUser?.youtubeChannelId &&
          _dataCopy.length > 1 && (
            <div className="flex h-fit w-fit items-center space-x-2">
              {showCheckboxes ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckboxes(false);
                      setSelected([]);
                    }}
                    className="h-fit rounded-full px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-white/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected((prev) =>
                        arraysAreEqual(prev, _dataCopy) ? [] : _dataCopy,
                      );
                    }}
                    className="h-fit rounded-full bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:text-white/50"
                  >
                    {arraysAreEqual(selected, _dataCopy)
                      ? "Unselect All"
                      : "Select All"}
                  </button>
                  {selected.length > 0 && (
                    <div className="flex h-fit w-fit items-center justify-start space-x-2">
                      <MenuComp
                        options={commonMenuOperations}
                        data={selected}
                        isPending={isDeleting || isModerating}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/80">
                          <BiDotsHorizontalRounded className="text-2xl" />
                        </div>
                      </MenuComp>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCheckboxes(true)}
                  className="h-fit rounded-full bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:text-white/50"
                >
                  Select
                </button>
              )}
            </div>
          )}
        {groupification?.length === 0 && (
          <button
            disabled={isPending}
            onClick={() => generateGroups(comments)}
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
                "flex h-10 w-fit items-center justify-center whitespace-nowrap rounded-r-lg border-[#252C36] bg-[#0E1420] px-6 transition-colors",
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

      {groupification?.length > 0 && (
        <div className="flex w-fit max-w-lg items-center rounded-lg border border-[#252C36] bg-[#0E1420] p-2">
          <button
            type="button"
            onClick={() => setTab(0)}
            className={cn(
              tab === 0 && "bg-[#1D242E]",
              "w-fit rounded-lg px-4 py-2 hover:bg-[#1D242E] hover:bg-opacity-50",
            )}
          >
            Comments
          </button>
          <button
            type="button"
            onClick={() => setTab(1)}
            className={cn(
              tab === 1 && "bg-[#1D242E]",
              "w-fit rounded-lg px-4 py-2 hover:bg-[#1D242E] hover:bg-opacity-50",
            )}
          >
            Groupification
          </button>
        </div>
      )}

      {tab === 0 ? (
        <CommentsComp
          currentUser={currentUser}
          videoSession={videoSession}
          list={comments}
          list_about={"comments"}
          showCheckboxes={showCheckboxes}
          selected={selected}
          setSelected={setSelected}
          _dataCopy={_dataCopy}
          set_dataCopy={set_dataCopy}
        />
      ) : (
        <RenderAccordion
          groupification={groupification}
          sentimentValue={comments}
        />
      )}
    </div>
  );
};

export default Comments;
