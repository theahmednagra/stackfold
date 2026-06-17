const generateSlug = (text: string) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")        // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, "")   // Remove all non-word chars
        .replace(/\-\-+/g, "-");    // Replace multiple hyphens with a single one

export default generateSlug;