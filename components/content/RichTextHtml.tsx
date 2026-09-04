export function RichTextHtml({ html }: { readonly html: string }) {
  return (
    <div
      className="[&_a]:underline [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
