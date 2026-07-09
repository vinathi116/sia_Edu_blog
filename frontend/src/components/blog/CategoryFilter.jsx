export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  categories = ["All", "Quantum Computing", "Deep Learning", "Prompt Engineering", "Machine Learning", "Data Science", "Career"],
}) {
  return (
    <div className="category-filter-container">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-chip ${activeCategory === category ? "active" : ""}`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
