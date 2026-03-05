import { createLazyResource, parsedInput } from "~/util/signals";

import { faviconURL } from "../Entry";
import { Command } from "./general";

const traverse = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes
    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
    .flatMap(({ children, url, title, dateAdded }) => {
      const path = breadcrumb ? breadcrumb + "/" + title : title;
      if (children) {
        return traverse(children, path);
      }
      url ||= "";
      return {
        title: `${title} > ${breadcrumb}`,
        icon: faviconURL(url),
        lastVisitTime: dateAdded,
        url,
      };
    });
};
const commands = createLazyResource([], async () => {
  ("fetching bookmarks");
  const root = await chrome.bookmarks.getTree();
  return traverse(root);
});

export default function bookmarkSuggestions(): Command[] {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return commands();
}
