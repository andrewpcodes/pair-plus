"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RotatePairsButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [isRotating, setIsRotating] = useState(false);

  const handleRotate = async () => {
    setIsRotating(true);

    // TODO: Implement pair rotation logic
    // This will create new pairs from available team members

    setTimeout(() => {
      setIsRotating(false);
      router.refresh();
    }, 1000);
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleRotate}
      disabled={isRotating}
    >
      {isRotating ? "Rotating..." : "Rotate Pairs"}
    </Button>
  );
}
