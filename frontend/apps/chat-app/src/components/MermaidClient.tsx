"use client";

import { useEffect } from "react";
import mermaid from "mermaid";

export default function MermaidClient() {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
  }, []);

  return null;
}
