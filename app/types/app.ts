export type Section = "chat" | "documents" | "queries";

export const sectionRoutes: Record<Section, string> = {
    chat: "/chat",
    documents: "/documents",
    queries: "/queries",
};