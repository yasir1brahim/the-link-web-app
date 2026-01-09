import React, { useState, useEffect } from "react";

const DrawingsFilters = ({ filters, onFilterChange, allFilterVals }) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleDrawingFileChange = (e) => {
    onFilterChange({ ...filters, drawingFileId: e.target.value });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFilterChange({
      category: "",
      drawingFileId: "",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.category || filters.drawingFileId || filters.search;

  return (
    <div className="drawings-filters">
      <div className="drawings-filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {allFilterVals.category?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="drawings-filter-group">
        <label htmlFor="drawing-file-filter">Drawing File</label>
        <select
          id="drawing-file-filter"
          value={filters.drawingFileId}
          onChange={handleDrawingFileChange}
        >
          <option value="">All Files</option>
          {allFilterVals.drawing_files?.map((file) => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      <div className="drawings-filter-group">
        <label htmlFor="search-filter">Search</label>
        <input
          id="search-filter"
          type="text"
          placeholder="Search note content..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <button className="drawings-clear-filters" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default DrawingsFilters;
