import { remark } from "remark";
import { describe, it, expect } from "vitest";
import { remarkLinkify } from "./index";
import type { Root, Paragraph, Link, Text as MdastText } from "mdast";

const processMd = (md: string): Root => {
  const processor = remark().use(remarkLinkify);
  const tree = processor.parse(md);
  return processor.runSync(tree);
};

describe("remarkSimpleBareLinks Plugin", () => {
  it("should linkify a simple bare domain", () => {
    const markdown = "Check example.com for details.";
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const paragraph = ast.children[0] as Paragraph;
    expect(paragraph?.type).toBe("paragraph");

    expect(paragraph.children).toHaveLength(3);
    const children = paragraph.children;

    const textBefore = children[0] as MdastText;
    expect(textBefore?.type).toBe("text");
    expect(textBefore?.value).toBe("Check ");

    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com");
    expect(linkNode.children).toHaveLength(1);
    const linkText = linkNode.children[0] as MdastText;
    expect(linkText?.type).toBe("text");
    expect(linkText?.value).toBe("example.com");

    const textAfter = children[2] as MdastText;
    expect(textAfter?.type).toBe("text");
    expect(textAfter?.value).toBe(" for details.");
  });

  it("should linkify a bare domain with path", () => {
    const markdown = "Go to example.com/path/page.";
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");

    expect(p.children).toHaveLength(3);
    const children = p.children;

    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com/path/page");
    expect(linkNode.children).toHaveLength(1);
    const linkText = linkNode.children[0] as MdastText;
    expect(linkText?.value).toBe("example.com/path/page");

    const textAfter = children[2] as MdastText;
    expect(textAfter?.value).toBe(".");
  });

  it("should linkify a bare domain with query params", () => {
    const markdown = "Visit example.com?q=test&v=1.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com?q=test&v=1");
    expect((linkNode.children[0] as MdastText)?.value).toBe(
      "example.com?q=test&v=1",
    );
    expect((children[2] as MdastText)?.value).toBe(".");
  });

  it("should linkify subdomains", () => {
    const markdown = "See sub.example.com for info.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://sub.example.com");
    expect((linkNode.children[0] as MdastText)?.value).toBe("sub.example.com");
  });

  it("should linkify domains with hyphens", () => {
    const markdown = "Try my-cool-site.com sometime.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://my-cool-site.com");
    expect((linkNode.children[0] as MdastText)?.value).toBe("my-cool-site.com");
  });

  it("should handle multiple bare domains in one paragraph", () => {
    const markdown = "Use example.com or test.org.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    // Expect 5 nodes: text, link(example.com), text, link(test.org), text(.)
    expect(p.children).toHaveLength(5);
    const children = p.children;

    expect(children[0]?.type).toBe("text");
    expect((children[0] as MdastText)?.value).toBe("Use ");

    const linkNode1 = children[1] as Link;
    expect(linkNode1?.type).toBe("link");
    expect(linkNode1?.url).toBe("http://example.com");
    expect((linkNode1.children[0] as MdastText)?.value).toBe("example.com");

    expect(children[2]?.type).toBe("text");
    expect((children[2] as MdastText)?.value).toBe(" or "); // Space before and after

    const linkNode2 = children[3] as Link;
    expect(linkNode2?.type).toBe("link");
    expect(linkNode2?.url).toBe("http://test.org");
    expect((linkNode2.children[0] as MdastText)?.value).toBe("test.org");

    expect(children[4]?.type).toBe("text");
    expect((children[4] as MdastText)?.value).toBe("."); // Trailing dot is separate
  });

  it("should NOT linkify domains already in markdown links", () => {
    const markdown =
      "This is [already a link](example.com) and should not change.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("example.com"); // Should preserve original URL
    expect((linkNode.children[0] as MdastText)?.value).toBe("already a link");
    expect((children[2] as MdastText)?.value).toBe(" and should not change.");
  });

  it("should linkify email addresses", () => {
    const markdown = "Contact test@example.com for help.";
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");

    // Expect 3 nodes: text, link, text
    expect(p.children).toHaveLength(3);
    const children = p.children;

    expect((children[0] as MdastText)?.type).toBe("text");
    expect((children[0] as MdastText)?.value).toBe("Contact ");

    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("mailto:test@example.com"); // linkify-it uses mailto:
    expect((linkNode.children[0] as MdastText)?.value).toBe("test@example.com");

    expect((children[2] as MdastText)?.type).toBe("text");
    expect((children[2] as MdastText)?.value).toBe(" for help.");
  });

  it("should NOT linkify file paths", () => {
    // This test should still pass as linkify-it doesn't usually link these paths
    const markdown = "Look in /path/to/example.com or ./local/file.js.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(1);
    const textNode = p.children[0] as MdastText;
    expect(textNode?.type).toBe("text");
    expect(textNode?.value).toBe(markdown);
  });

  it("should NOT linkify common file extensions", () => {
    const markdown =
      "Download image.png or report.pdf but not script.js and link to some-other-script.io";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    // Expect 2 nodes: Text, Link(io)
    expect(p.children).toHaveLength(2);
    const children = p.children;

    expect((children[0] as MdastText)?.type).toBe("text");
    expect((children[0] as MdastText)?.value).toBe(
      "Download image.png or report.pdf but not script.js and link to ",
    );
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://some-other-script.io");
    expect((linkNode.children[0] as MdastText)?.value).toBe(
      "some-other-script.io",
    );
  });

  it("should linkify domains ending with a dot", () => {
    const markdown = "Check example.com.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    // Expect 3 nodes: text, link, text(.)
    expect(p.children).toHaveLength(3);
    const children = p.children;

    expect((children[0] as MdastText)?.value).toBe("Check ");

    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com");
    expect((linkNode.children[0] as MdastText)?.value).toBe("example.com");

    expect((children[2] as MdastText)?.value).toBe("."); // Trailing dot is separate
  });

  it("should handle domains adjacent to punctuation", () => {
    const markdown = "(example.com)";
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    expect((children[0] as MdastText)?.value).toBe("(");
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com"); // Ensure URL is clean
    expect((linkNode.children[0] as MdastText)?.value).toBe("example.com");
    expect((children[2] as MdastText)?.value).toBe(")");
  });

  it("should handle domains adjacent to punctuation quotes", () => {
    const markdown = `"example.com"`;
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(3);
    const children = p.children;
    expect((children[0] as MdastText)?.value).toBe('"'); // Expect double quote using single quotes
    const linkNode = children[1] as Link;
    expect(linkNode?.type).toBe("link");
    expect(linkNode?.url).toBe("http://example.com"); // Ensure URL is clean
    expect((linkNode.children[0] as MdastText)?.value).toBe("example.com");
    expect((children[2] as MdastText)?.value).toBe('"'); // Expect double quote using single quotes
  });

  it("should handle text nodes without potential links", () => {
    const markdown = "Just plain text.";
    const ast = processMd(markdown);
    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");
    expect(p.children).toHaveLength(1);
    const textNode = p.children[0] as MdastText;
    expect(textNode?.type).toBe("text");
    expect(textNode?.value).toBe(markdown);
  });

  it("should handle complex cases with multiple types", () => {
    const markdown =
      "Visit example.com, contact test@example.com, or see [link](other.net) and image.png.";
    const ast = processMd(markdown);

    expect(ast.children).toHaveLength(1);
    const p = ast.children[0] as Paragraph;
    expect(p?.type).toBe("paragraph");

    // Expect 7 nodes: T, L, T, L(mailto), T, L(existing), T(rest)
    expect(p.children).toHaveLength(7);
    const children = p.children;

    expect(children[0]?.type).toBe("text");
    expect((children[0] as MdastText)?.value).toBe("Visit ");

    const linkNode1 = children[1] as Link;
    expect(linkNode1?.type).toBe("link");
    expect(linkNode1?.url).toBe("http://example.com");
    expect((linkNode1.children[0] as MdastText)?.value).toBe("example.com");

    expect(children[2]?.type).toBe("text");
    expect((children[2] as MdastText)?.value).toBe(", contact "); // Comma and space

    const linkNodeMail = children[3] as Link;
    expect(linkNodeMail?.type).toBe("link");
    expect(linkNodeMail?.url).toBe("mailto:test@example.com");
    expect((linkNodeMail.children[0] as MdastText)?.value).toBe(
      "test@example.com",
    );

    expect(children[4]?.type).toBe("text");
    expect((children[4] as MdastText)?.value).toBe(", or see "); // Comma and space

    const linkNode2 = children[5] as Link; // Existing link shifted index
    expect(linkNode2?.type).toBe("link");
    expect(linkNode2?.url).toBe("other.net");
    expect((linkNode2.children[0] as MdastText)?.value).toBe("link");

    // Final text node includes the non-linked image.png part
    expect(children[6]?.type).toBe("text");
    expect((children[6] as MdastText)?.value).toBe(" and image.png.");
  });
});
