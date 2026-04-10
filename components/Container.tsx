import { cn } from "@/lib/utils";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "max-w-[666px] w-full mx-auto flex flex-col gap-6 min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;