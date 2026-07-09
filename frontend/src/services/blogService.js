import api from "./api";

const pendingGetRequests = new Map();

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function stableParams(params = {}) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join("&");
}

function dedupeGet(key, request) {
  if (pendingGetRequests.has(key)) {
    return pendingGetRequests.get(key);
  }

  const promise = request().finally(() => {
    pendingGetRequests.delete(key);
  });
  pendingGetRequests.set(key, promise);
  return promise;
}

export const blogService = {
  getBlogs(params = {}) {
    return dedupeGet(`blogs:list:${stableParams(params)}`, () => api.get("/blogs/", { params }));
  },
  getAdminBlogs(params = {}) {
    return api.get("/blogs/", { params: { include_unpublished: 1, ...params } });
  },
  getBlog(slug) {
    return dedupeGet(`blogs:detail:${slug}`, () => api.get(`/blogs/${slug}/`));
  },
  createBlog(payload) {
    return api.post("/blogs/", payload, multipartConfig(payload));
  },
  updateBlog(slug, payload) {
    return api.patch(`/blogs/${slug}/`, payload, multipartConfig(payload));
  },
  deleteBlog(slug) {
    return api.delete(`/blogs/${slug}/`);
  },
  getTrending(params = {}) {
    return dedupeGet(`blogs:trending:${stableParams(params)}`, () => api.get("/blogs/trending/", { params }));
  },
  getRecommended(params = {}) {
    return api.get("/blogs/recommended/", { params });
  },
  getTags() {
    return dedupeGet("blogs:tags", () => api.get("/blogs/tags/"));
  },
  getCategories() {
    return dedupeGet("blogs:categories", () => api.get("/blogs/categories/"));
  },
  getCourses() {
    return dedupeGet("blogs:courses", () => api.get("/blogs/courses/"));
  },
  uploadImage(slug, payload) {
    return api.post(`/blogs/${slug}/images/`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

function multipartConfig(payload) {
  if (payload instanceof FormData) {
    return { headers: { "Content-Type": "multipart/form-data" } };
  }
  return {};
}
