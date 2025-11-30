export interface wType {
    id: string;
    type: "terminal" | "safari" | "blog" | "projects" | "resume" | "books" | "github" | "contact" | "games";
    minimized: boolean;
    maximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
  }