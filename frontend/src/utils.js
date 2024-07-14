import { clsx } from "clsx";
import { BsQuestionDiamond } from "react-icons/bs";
import { FiFlag, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

export const customStyles = {
  content: {
    width: "fit-content",
    height: "fit-content",
    padding: "0",
    backgroundColor: "transparent",
    border: "none",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    "--tw-shadow":
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "--tw-shadow-colored":
      "0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)",
    boxShadow:
      "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
  },
};

export const commentHeaders = [
  "cid",
  "text",
  "time",
  "author",
  "channel",
  "votes",
  "replies",
  "photo",
  "heart",
  "reply",
  "publishedAt"
]

export const fileTypes = [
  "txt",
  "html",
  "json",
  "csv",
  "xls"
]

export const data = (data) => {
  return {
    labels: ["Positive", "Negative", "Question", "Neutral"],
    datasets: [
      {
        label: "Poll",
        data,
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6", "#6b7280"],
        borderColor: ["#0E1420", "#0E1420", "#0E1420", "#0E1420"],
        hoverOffset: 5,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };
  
}

export const textCenter = (comments) => {
  return {
    id: "textCenter",
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;
      ctx.save();
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `Total: ${comments?.length}`,
        chart.getDatasetMeta(0).data[0].x,
        chart.getDatasetMeta(0).data[0].y,
      );
    },
  };
}

export const progressbarData = ({comments, sentiments}) => {
  return [
    {
      count: sentiments?.positives?.length,
      label: "Positive",
      color: "#22c55e",
      percentage: Math.floor(
        (sentiments?.positives?.length / comments?.length) * 100,
      ),
      icon: FiThumbsUp,
    },
    {
      count: sentiments?.negatives?.length,
      label: "Negative",
      color: "#ef4444",
      percentage: Math.floor(
        (sentiments?.negatives?.length / comments?.length) * 100,
      ),
      icon: FiThumbsDown,
    },
    {
      count: sentiments?.questions?.length,
      label: "Question",
      color: "#3b82f6",
      percentage: Math.floor(
        (sentiments?.questions?.length / comments?.length) * 100,
      ),
      icon: BsQuestionDiamond,
    },
    {
      count: sentiments?.neutrals?.length,
      label: "Neutral",
      color: "#6b7280",
      percentage: Math.floor(
        (sentiments?.neutrals?.length / comments?.length) * 100,
      ),
      icon: FiFlag,
    },
  ];
};