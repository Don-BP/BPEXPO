// This function takes a path and prepends the correct base URL.
// It is now smart enough to ignore full external URLs.
export const getAssetUrl = (path) => {
    // If the path is null, undefined, or empty, return an empty string to avoid errors.
    if (!path) {
      return '';
    }
  
    // Check if the path is already an absolute URL.
    if (path.startsWith('http') || path.startsWith('//')) {
      return path; // If it is, return it as is.
    }
  
    // Otherwise, it's a local asset, so prepend the Vite base URL.
    return `${import.meta.env.BASE_URL}${path}`;
  };