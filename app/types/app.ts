export type Section = "chat" | "documents" | "query";

export const sectionRoutes: Record<Section, string> = {
    chat: "/chat",
    documents: "/documents",
    query: "/query",
};