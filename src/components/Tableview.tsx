import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import dark from "./green_natural.jpg";

const Tableview = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 

  const fetchData = () => {
    if (!tableName) return;
    setLoading(true);
    axios
      .get(`http://localhost:2000/data/${tableName}?page=${page}&limit=${limit}`)
      .then((res) => {
        setTableData(res.data.data);
        setTotalRecords(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error("Error fetching table:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [tableName, page]);

  const handleExport = () => {
    if (!tableData.length) return;
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName || "Table");
    XLSX.writeFile(workbook, `${tableName}_page${page}.xlsx`);
  };

  return (
    <div style={{ backgroundImage: `url(${dark})` }} className="min-h-screen text-white min-w-full">
      <div className="p-10 inset-0 backdrop-blur-sm bg-black/60 min-h-screen min-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold font-mono">
            <i className="fa-solid fa-table-list text-violet-600"></i>{" "}
            Table: {tableName}
          </h1>
          <div>
            <button onClick={handleExport} className="px-4 py-2 mr-3 rounded-lg border-2 border-yellow-500 hover:bg-yellow-600">
              Export
            </button>
            <button onClick={() => navigate("/")}className="px-4 py-2 rounded-lg border-2 border-green-600 hover:bg-green-700">
              Back
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-3">
          Showing page {page} of {totalPages} ({totalRecords} records)
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-violet-500"></i>
          </div>
        ) : (
          <div
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y",
            }}
            className="overflow-x-auto overflow-y-auto max-h-[80vh] inset-0 backdrop-blur-sm border-2 border-dashed border-white/60 min-w-full mt-6 p-6 rounded-lg"
          >
            {tableData.length === 0 ? (
              <p className="text-gray-400">No data found.</p>
            ) : (
              <>
                <table className="border-collapse text-left min-w-max w-full">
                  <thead className="sticky top-0 bg-black/90 backdrop-blur-sm z-10">
                    <tr className="font-semibold font-serif text-lg text-white/80">
                      {Object.keys(tableData[0]).map((col, i) => (
                        <th key={i} className="p-2 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="border-white/30">
                    {tableData.map((row, i) => (
                      <tr key={i}
                        className="pb-4 font-mono text-md text-white/50 hover:bg-white/10 transition select-none">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 rounded-lg border-2 border-violet-500 hover:bg-violet-600 disabled:opacity-40">
                    Prev
                  </button>
                  <span className="text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 rounded-lg border-2 border-violet-500 hover:bg-violet-600 disabled:opacity-40">
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tableview;
