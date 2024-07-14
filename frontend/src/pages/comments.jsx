import { useParams, useSearchParams } from "react-router-dom";
import {
  fetchComments,
  getSessionStorage,
  handleCategorize,
  renderRow,
} from "../helpers";
import { FixedSizeList as List } from "react-window";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Loader } from "../components/loader/loader";

const Comments = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("sort");
  const max = searchParams.get("max");
  const options = getSessionStorage("options");
  const checkCondition =
    !options || options?.max !== max || options?.sort !== sort;
  const comments_and_sentiments =
    getSessionStorage("comments_and_sentiments") || {};

  // Queries and Mutations
  const {
    data: { comments, sentiments } = {},
    isFetched,
    isFetching,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["comments_and_sentiments"],
    queryFn: async () => {
      // fetching latest Comments
      const latestComments = await fetchComments({
        videoId,
        options: checkCondition ? { max, sort } : options,
      });

      // Generating latest Sentiments
      const latestSentiments = await handleCategorize(latestComments);

      return { comments: latestComments, sentiments: latestSentiments };
    },
    refetchOnWindowFocus: false,
    enabled: !comments_and_sentiments || checkCondition,
    initialData: comments_and_sentiments ? comments_and_sentiments : {}, // Provide default value here
  });

  // Use useEffect to handle onSuccess logic
  useEffect(() => {
    if (isSuccess && comments && sentiments) {
      // This is where you can put your onSuccess logic
      // console.log("Comments fetched successfully:", comments);
      // console.log("Sentiments generated successfully:", sentiments);
      sessionStorage.setItem(
        "comments_and_sentiments",
        JSON.stringify({ comments, sentiments }),
      );
    }
  }, [comments, isSuccess, sentiments]);

  useEffect(() => {
    if (checkCondition) {
      sessionStorage.setItem("options", JSON.stringify({ sort, max }));
      // console.log("changed options in sesstionStorage");
    }
  }, [checkCondition, max, sort]);

  // Render loading state
  if ((!isFetched && !comments && !sentiments) || isFetching)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Loader />
      </div>
    );

  if (isError)
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        Error loading comments
      </div>
    );

  const ALLCommentsRow = (props) =>
    renderRow(comments, props.index, props.style);

  return (
    // All Comments Table
    <table className="flex h-full w-full flex-col divide-y divide-[#252C36] rounded-2xl border border-[#252C36] bg-[#0E1420]">
      <thead className="flex h-fit w-full flex-col">
        <tr className="flex h-full w-full flex-col">
          <th className="h-full w-full px-4 py-2">COMMENTS</th>
        </tr>
      </thead>
      <tbody
        id="table_body"
        className="flex h-full w-full flex-col overflow-hidden"
      >
        <List
          height={600}
          itemCount={comments.length}
          itemSize={50}
          width="100%"
        >
          {ALLCommentsRow}
        </List>
      </tbody>
    </table>
  );
};

export default Comments;
