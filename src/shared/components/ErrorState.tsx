"use client";

import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Card className="text-center">
      <p className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F8E2E8] text-lg font-bold text-[#62727B]">
        !
      </p>
      <h2 className="text-xl font-semibold text-[#62727B]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#62727B]/80">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} variant="accent">
          Intentar nuevamente
        </Button>
      ) : null}
    </Card>
  );
}
