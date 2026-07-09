import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function SearchBar({ value, onChange, placeholder = "Search articles..." }) {
  return (
    <div className="search-bar">
      <HiOutlineMagnifyingGlass className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
      />
    </div>
  );
}
