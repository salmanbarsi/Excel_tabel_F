import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import dark from "./green_natural.jpg";

const Tableview = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRecord, setselectedRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch data from API
  const fetchData = () => {
    if (!tableName) return;
    setLoading(true);
    axios
      .get(`https://excel-tabel-b.onrender.com/data/${tableName}?page=${page}&limit=${limit}`)
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
  if (!tableName) return;

  axios
    .get(`https://excel-tabel-b.onrender.com/data/${tableName}?page=1&limit=1000000`)
    .then((res) => {
      const allData = res.data.data;
      if (!allData.length) return;

      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName || "Table");
      XLSX.writeFile(workbook, `${tableName}_all.xlsx`);
    })
    .catch((err) => console.error("Error exporting table:", err));
};


  const openEditModal = (row: any) => {
    setselectedRecord(row);
    setEditRecord({ ...row });
  };

  const handleSave = () => {
  if (!editRecord || !tableName) return;

  const objkey = Object.keys(editRecord).find(key => key.toLowerCase().includes("id")); 
  const recordId = objkey ? editRecord[objkey] : undefined;
  axios
    .put(`https://excel-tabel-b.onrender.com/data/${tableName}/${recordId}`, editRecord)
    .then(() => {
      alert("Record updated successfully!");
      setselectedRecord(null);
      setEditRecord(null);
      fetchData();
    })
    .catch((err) => {
      console.error("Error updating record:", err);
      alert("Failed to update record");
    });
};


  return (
    <div
      style={{ backgroundImage: `url(${dark})` }}
      className="min-h-screen text-white min-w-full"
    >
      <div className="p-10 inset-0 backdrop-blur-sm bg-black/60 min-h-screen min-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold font-mono">
            <i className="fa-solid fa-table-list text-violet-600"></i> Table: {tableName}
          </h1>
          <div>
            <button
              onClick={handleExport}
              className="px-4 py-2 mr-3 rounded-lg border-2 border-yellow-500 hover:bg-yellow-600"
            >
              Export
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg border-2 border-green-600 hover:bg-green-700"
            >
              Back
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-300 mb-3">
          Showing page {page} of {totalPages} ({totalRecords} records)
        </p>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-violet-500"></i>
          </div>
        ) : (
          <div
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
            className="overflow-x-auto overflow-y-auto max-h-[80vh] inset-0 backdrop-blur-sm border-2 border-dashed border-white/60 min-w-full mt-6 p-6 rounded-lg"
          >
            {tableData.length === 0 ? (
              <p className="text-gray-400">No data found.</p>
            ) : (
              <>
                <table className="border-collapse text-left min-w-max w-full">
                  <thead className="top-0 bg-black/90 backdrop-blur-sm z-10">
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
                      <tr
                        onClick={() => openEditModal(row)}
                        key={i}
                        className="pb-4 font-mono text-md text-white/50 hover:bg-white/10 transition select-none cursor-pointer"
                      >
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 whitespace-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 rounded-lg border-2 border-violet-500 hover:bg-violet-600 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 rounded-lg border-2 border-violet-500 hover:bg-violet-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Edit Record Modal */}
        {selectedRecord && editRecord && (
          <div className="fixed inset-0 bg-black backdrop-blur-sm bg-black/30 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-2/5 transform scale-95 transition-all duration-300 ease-out">
              <h2 className="font-mono font-bold mb-6 text-white text-xl">Edit Record</h2>
              <table className="w-full text-sm text-gray-300 border-separate border-spacing-y-2">
                <tbody className="text-left font-mono">
                  {Object.entries(editRecord).map(([key, value]) => {
                    const isIdField = key.toLowerCase().includes("id");
                    const isDateField = key.toLowerCase().includes("date") || key.toLowerCase().includes("dob") || key.toLowerCase().includes("joining");
                    const isGender = key.toLowerCase().includes("gender");

                    return (
                      <tr key={key}>
                        <td className="font-semibold pr-4 text-white text-lg">{key}</td>
                        <td>
                          {isIdField ? (
                            <input disabled value={String(value)} className="bg-gray-800 text-gray-400 block w-full border rounded-md py-2 px-2"/>
                          ) : isGender ? (
                            <select value={String(editRecord[key])} onChange={(e) => setEditRecord({ ...editRecord, [key]: e.target.value })}
                              className="bg-transparent block w-full border rounded-md py-2 px-2">
                              <option className="bg-transparent text-black font-mono font-bold" value="">Select Gender</option>
                              <option className="bg-transparent text-black font-mono font-bold" value="Male">Male</option>
                              <option className="bg-transparent text-black font-mono font-bold" value="Female">Female</option>
                              <option className="bg-transparent text-black font-mono font-bold" value="Other">Other</option>
                            </select>
                          ) : (
                            <input type={isDateField ? "date" : "text"} value={isDateField ? String(value) : String(editRecord[key])}
                              onChange={(e) => setEditRecord({ ...editRecord, [key]: e.target.value })} className="bg-transparent block w-full border rounded-md py-2 px-2"/>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setselectedRecord(null);
                    setEditRecord(null);
                  }}
                  className="border-2 font-mono border-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="border-2 border-violet-500 font-mono hover:bg-violet-600 text-white px-4 ml-4 py-2 rounded transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tableview;
