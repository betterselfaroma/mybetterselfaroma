import SkeletonCard from "./SkeletonCard";

export default function LoadingState({ text = "正在加载..." }: { text?: string }) {
  return (
    <div className="loading-state">
      <SkeletonCard />
      <SkeletonCard compact />
      <p>{text}</p>
    </div>
  );
}
