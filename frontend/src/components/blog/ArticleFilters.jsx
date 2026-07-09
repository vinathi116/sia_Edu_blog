import { useState } from "react";
import { HiOutlineAdjustmentsHorizontal, HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";

export default function ArticleFilters({
  search,
  setSearch,
  category,
  setCategory,
  tag,
  setTag,
  courseId,
  setCourseId,
  ordering,
  setOrdering,
  categories = [],
  tags = [],
  courses = [],
  onClearAll,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = search || category || tag || courseId || ordering !== "-publish_date";

  return (
    <section className="article-filters-panel" aria-label="Search and filter articles">
      {/* Search and Primary controls */}
      <div className="filters-main-row">
        <div className="search-input-wrap">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, content, tags, course..."
            aria-label="Search articles"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search text"
            >
              <HiOutlineXMark />
            </button>
          )}
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className={`btn btn-muted toggle-advanced-btn ${showAdvanced || hasActiveFilters ? "active" : ""}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <HiOutlineAdjustmentsHorizontal />
            <span>Filters</span>
            {hasActiveFilters && <span className="active-filters-dot" />}
          </button>

          <label className="sort-select-wrap">
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              aria-label="Sort articles"
            >
              <option value="-publish_date">Newest</option>
              <option value="publish_date">Oldest</option>
              <option value="-updated_at">Recently Updated</option>
              <option value="title">A-Z</option>
              <option value="-title">Z-A</option>
              <option value="-views">Most Viewed</option>
              <option value="-is_featured">Editor's Picks</option>
            </select>
          </label>
        </div>
      </div>

      {/* Advanced Filters Expandable Panel */}
      {(showAdvanced || hasActiveFilters) && (
        <div className="filters-expanded-panel">
          <div className="expanded-filters-grid">
            {/* Category Select */}
            <div className="filter-group">
              <label htmlFor="filter-category">Category</label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Select */}
            <div className="filter-group">
              <label htmlFor="filter-course">Course</label>
              <select
                id="filter-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Tags Row */}
          {tags.length > 0 && (
            <div className="tags-filter-section">
              <label>Filter by Tag</label>
              <div className="tags-pills-container">
                {tags.map((t) => {
                  const tagValue = t.slug || t.name;
                  const isActive = tag === tagValue;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`tag-pill ${isActive ? "active" : ""}`}
                      onClick={() => setTag(isActive ? "" : tagValue)}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="active-filters-summary-row">
              <div className="active-badges-list">
                {search && (
                  <span className="filter-badge">
                    Search: "{search}"
                    <button type="button" onClick={() => setSearch("")}>
                      <HiOutlineXMark />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="filter-badge">
                    Category: {category}
                    <button type="button" onClick={() => setCategory("")}>
                      <HiOutlineXMark />
                    </button>
                  </span>
                )}
                {tag && (
                  <span className="filter-badge">
                    Tag: {tags.find((t) => (t.slug || t.name) === tag)?.name || tag}
                    <button type="button" onClick={() => setTag("")}>
                      <HiOutlineXMark />
                    </button>
                  </span>
                )}
                {courseId && (
                  <span className="filter-badge">
                    Course: {courses.find((c) => String(c.id) === String(courseId))?.title || "Selected"}
                    <button type="button" onClick={() => setCourseId("")}>
                      <HiOutlineXMark />
                    </button>
                  </span>
                )}
                {ordering !== "-publish_date" && (
                  <span className="filter-badge">
                    Sort: {ordering === "publish_date" ? "Oldest" : ordering === "-updated_at" ? "Recently Updated" : ordering === "title" ? "A-Z" : ordering === "-title" ? "Z-A" : ordering === "-views" ? "Most Viewed" : "Editor's Picks"}
                    <button type="button" onClick={() => setOrdering("-publish_date")}>
                      <HiOutlineXMark />
                    </button>
                  </span>
                )}
              </div>
              <button type="button" className="clear-all-filters-btn" onClick={onClearAll}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
