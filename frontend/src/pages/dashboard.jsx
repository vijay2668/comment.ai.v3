import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader } from "../components/loader/loader";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ToolT,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { FiThumbsUp } from "react-icons/fi";
import "react-circular-progressbar/dist/styles.css";
import { FaRegUser } from "react-icons/fa";

import { fetchComments, getSessionStorage, handleCategorize } from "../helpers";
import { cn, data, progressbarData, textCenter } from "../utils";
import { Tooltip } from "../components/tooltip";
// import { SentimentAnalysisBtn } from "../components/sentiment-analysis-btn/sentiment-analysis-btn";
// import { Loader2 } from "../components/loader2/loader2";

ChartJS.register(ArcElement, ToolT, Legend, ChartDataLabels);
ChartJS.defaults.plugins.legend.position = "right";

const Dashboard = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("sort");
  const max = searchParams.get("max");
  const options = getSessionStorage("options");
  const comments_and_sentiments = getSessionStorage("comments_and_sentiments");

  const checkCondition =
    !options || options?.max !== max || options?.sort !== sort;

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

  const [hoverIndex, setHoverIndex] = useState(null);

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

  return (
    <div className="scrollbar-hide flex h-full w-full flex-1 flex-col space-y-6 overflow-y-scroll text-white">
      <div className="flex min-h-[240px] w-full flex-col items-center justify-center rounded-2xl border border-[#252C36] bg-[#0E1420]">
        <h3 className="pt-2 text-lg font-semibold tracking-wider">
          Comment Sentiment
        </h3>
        <div className="flex h-[200px] w-full items-center justify-evenly space-x-4 p-5">
          {progressbarData({ comments, sentiments }).map((item) => (
            <Link
              to={`/${item.label.toLowerCase()}s/${videoId}`}
              key={item.label}
            >
              <CircularProgressbarWithChildren
                className="h-[10rem] w-[10rem]"
                value={item.percentage}
                styles={buildStyles({
                  textColor: "white",
                  pathColor: item.color,
                  trailColor: "#27272a",
                })}
              >
                <div className="flex h-fit w-fit flex-col space-y-1 text-center text-xl tracking-wider">
                  <div>{item.label}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <item.icon style={{ color: item.color }} />
                    <strong>{item.percentage}%</strong>
                  </div>
                </div>
              </CircularProgressbarWithChildren>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex h-fit w-full items-center space-x-6">
        <div className="flex h-full max-h-fit w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]">
          <h3 className="w-full border-b border-[#252C36] py-2 text-center text-lg font-semibold tracking-wider">
            Comment Categories
          </h3>
          <div className="flex h-[380px] w-[380px] flex-col items-center justify-center overflow-hidden p-5">
            <Doughnut
              className="doughnut"
              data={data([
                sentiments?.positives?.length,
                sentiments?.negatives?.length,
                sentiments?.questions?.length,
                sentiments?.neutrals?.length,
              ])}
              plugins={[textCenter(comments)]}
              options={{
                plugins: {
                  datalabels: {
                    formatter: function (value) {
                      let val = Math.round(value);
                      return new Intl.NumberFormat("tr-TR").format(val); //for number format
                    },
                    color: "white",
                    font: {
                      size: 16,
                    },
                  },
                  responsive: true,
                },
                // cutout: new Array(4).map((item) => item.cutout),
                onClick: (evt, item) => {
                  if (item[0]?.index === undefined || null) return;
                  const { index } = item[0];
                  if (index === 0) {
                    navigate(`/positives/${videoId}`);
                  } else if (index === 1) {
                    navigate(`/negatives/${videoId}`);
                  } else if (index === 2) {
                    navigate(`/questions/${videoId}`);
                  } else {
                    navigate(`/neutrals/${videoId}`);
                  }
                },
              }}
            />
          </div>
          {/* <div className="flex w-full items-center justify-evenly py-2">
            {[
              { label: "Positive", path: "positives", color: "#22c55e" },
              { label: "Negative", path: "negatives", color: "#ef4444" },
              { label: "Question", path: "questions", color: "#3b82f6" },
              { label: "Neutral", path: "neutrals", color: "#6b7280" },
            ].map((item, index) => (
              <Link
                to={`/${item.path}/${videoId}`}
                key={index}
                className="group flex flex-col items-center space-y-2"
              >
                <div
                  style={{ background: item.color }}
                  className="h-5 w-10 border-2 border-zinc-300 transition-colors group-hover:border-blue-600"
                />
                <p className="text-xs transition-colors group-hover:text-blue-600">
                  {item.label}
                </p>
              </Link>
            ))}
          </div> */}
        </div>
        <div className="flex h-full max-h-fit w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#252C36] bg-[#0E1420]">
          <h3 className="w-full border-b border-[#252C36] py-2 text-center text-lg font-semibold tracking-wider">
            Top 10 Comments
          </h3>
          <div className="scrollbar-hide flex h-full max-h-[380px] w-full flex-col divide-y divide-[#252C36] overflow-scroll overflow-x-hidden">
            {comments
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 10)
              .map((question, index) => (
                <div
                  key={index}
                  className="flex h-fit w-full items-center space-x-4 px-4 py-2"
                >
                  <div className="flex w-full items-center space-x-4 overflow-hidden">
                    <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#252C36] text-[#7D828F]">
                      <FaRegUser className="text-lg" />
                    </div>
                    <div className="flex flex-col space-y-1 overflow-hidden">
                      <div className="scrollbar-hide w-full overflow-scroll whitespace-nowrap text-sm font-medium text-[#7D828F]">
                        {question.author}
                      </div>
                      <div
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        className={cn(
                          hoverIndex !== index && "truncate",
                          "text w-full cursor-pointer",
                        )}
                      >
                        {question.text}
                      </div>
                    </div>
                  </div>
                  <div className="flex min-w-fit items-center justify-start space-x-2">
                    <Tooltip content="Like Count">
                      <div className="flex min-w-fit items-center justify-start space-x-2">
                        <span>{question.votes}</span>
                        <div>
                          <FiThumbsUp className="text-green-500" />
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
