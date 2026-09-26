import { Card } from "@/shared/components/Card";

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <Card aria-live="polite" className="text-center" role="status">
      <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-[#DDF3F1] border-t-[#62727B] motion-reduce:animate-none" />
      <p className="text-sm font-semibold text-[#62727B]">{message}</p>
    </Card>
  );
}
