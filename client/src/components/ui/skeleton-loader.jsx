import { Skeleton } from "./skeleton";
export const CardSkeleton = () => {
  return <div className="flex flex-col space-y-3 p-4 border rounded-xl bg-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>;
};
export const ChatSkeleton = () => {
  return <div className="space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-3 w-[70%]" />
        </div>
      </div>
      <div className="flex items-center space-x-4 justify-end">
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-3 w-[50%]" />
        </div>
      </div>
    </div>;
};
export const ListSkeleton = ({
  count = 3
}) => {
  return <div className="space-y-4">
      {Array.from({
      length: count
    }).map((_, i) => <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-[80px] rounded" />
        </div>)}
    </div>;
};