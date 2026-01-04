import React from "react";

const DrawingsTable = ({
  drawingNotes,
  selectedNote,
  onRowSelect,
  isLoading,
  page,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (isLoading) {
    return (
      <div className="drawings-loading">
        <span>Loading drawing notes...</span>
      </div>
    );
  }

  if (drawingNotes.length === 0) {
    return (
      <div className="drawings-empty">
        <h3>No drawing notes found</h3>
        <p>Upload drawing PDFs to extract notes, or adjust your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="drawings-table-container">
        <table className="drawings-table">
          <thead>
            <tr>
              <th style={{ width: "200px" }}>Drawing File</th>
              <th style={{ width: "150px" }}>Category</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {drawingNotes.map((note) => (
              <tr
                key={note.id}
                className={selectedNote?.id === note.id ? "selected" : ""}
                onClick={() => onRowSelect(note)}
              >
                <td>{note.drawing_file_name}</td>
                <td>{note.category}</td>
                <td className="drawings-text-cell">
                  <div className="drawings-text-full">{note.text}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="drawings-pagination">
        <span className="drawings-pagination-info">
          Showing {startItem}-{endItem} of {totalCount} notes
        </span>
        <div className="drawings-pagination-controls">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawingsTable;
