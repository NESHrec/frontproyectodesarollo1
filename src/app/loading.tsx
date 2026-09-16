import { Card } from "@/shared/components/Card";

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#FBFCFA] px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-[#DDF3F1] border-t-[#62727B]" />
        <p className="text-sm font-semibold text-[#62727B]">
          Preparando una experiencia serena...
        </p>
      </Card>
    </main>
  );
}
