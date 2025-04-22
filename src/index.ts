import LinkifyIt from "linkify-it";
import { visit } from "unist-util-visit";
import type { Root, Text, Link } from "mdast";
import type { Parent } from "unist";
import type { Transformer } from 'unified';

const linkify = new LinkifyIt();

export function remarkLinkify(): Transformer<Root, Root> {
  return (tree: Root) => {
    visit(
      tree,
      "text",
      (node: Text, index: number | undefined, parent: Parent | undefined) => {
        if (
          !parent ||
          index === undefined ||
          parent.type === "link" ||
          parent.type === "linkReference" ||
          !node.value
        ) {
          return;
        }

        const text = node.value;
        const matches = linkify.match(text);

        if (!matches || matches.length === 0) {
          return;
        }

        const newNodes: (Text | Link)[] = [];
        let lastIndex = 0;

        for (const match of matches) {
          if (match.index > lastIndex) {
            newNodes.push({
              type: "text",
              value: text.slice(lastIndex, match.index),
            });
          }

          newNodes.push({
            type: "link",
            url: match.url,
            children: [{ type: "text", value: match.text }],
          });

          lastIndex = match.lastIndex;
        }

        if (lastIndex < text.length) {
          newNodes.push({ type: "text", value: text.slice(lastIndex) });
        }

        parent.children.splice(index, 1, ...newNodes);

        return index + newNodes.length;
      },
    );
  };
}