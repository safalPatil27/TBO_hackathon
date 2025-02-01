export const parseHtmlError = (htmlResponse: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlResponse, "text/html");
    const errorMessage = doc.body.textContent?.trim() || "Unknown error"; // Extract text from the HTML body
    return errorMessage;
  };