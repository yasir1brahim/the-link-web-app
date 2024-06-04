import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';

// Example items, to simulate fetching from another resources.
// function Items({ currentItems }) {
//   return (
//     <>
//       {currentItems &&
//         currentItems.map((item) => (
//           <div>
//             <h3>Item #{item}</h3>
//           </div>
//         ))}
//     </>
//   );
// }

function PaginatedItems({
  items,
  setCurrentItems,
  itemsPerPage,
  setItemsPerPage
}) {
  // We start with an empty list of items.
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setCurrentItems(items?.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items?.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items, setCurrentItems]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items?.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  return (
    <div className="pagination-content">
      {/* <Items currentItems={currentItems} /> */}
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />
      <label className="showing-content d-flex align-items-center justify-content-center">
        <span> Show</span>
        <select
          className="pagination-select"
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>
    </div>
  );
}

export default PaginatedItems;
