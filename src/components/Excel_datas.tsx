// Upload and fetch component with loading + alerts
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgimg from "./bg2.jpg";

function Excel_datas() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();


  const fetchFiles = () => {
    setLoading(true);
    axios
      .get("https://excel-tabel-b.onrender.com/db-files")
      .then((res) => setUploadedFiles(res.data))
      .catch((err) => {
        console.error("Fetch files error:", err);
        alert("Failed to fetch files!");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, []);


  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Only Excel files (.xlsx, .xls) are allowed!");
      e.target.value = "";
      return;
    }

    setPendingFile(file);
  };


  const handleUpload = async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append("file", pendingFile);

    setLoading(true);
    try {
      await axios.post("https://excel-tabel-b.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setPendingFile(null);
      fetchFiles();
    } 
    catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    } 
    finally {
      setLoading(false);
    }
  };


  const handleCancel = () => setPendingFile(null);


  const handleDelete = async (tableName: string) => {
    if (!window.confirm(`Delete table "${tableName}"?`)) return;

    setLoading(true);
    try {
      await axios.delete(`https://excel-tabel-b.onrender.com/db-files/${tableName}`);
      alert(`able "${tableName}" deleted successfully!`);
      fetchFiles();
    } 
    catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete table!");
    } 
    finally {
      setLoading(false);
    }
  };


  const handleView = (tableName: string) => navigate(`/tableview/${tableName}`);

  return (
    <div style={{ backgroundImage: `url(${bgimg})` }} className="min-h-screen">
      <div className="inset-0 bg-black backdrop-blur-sm bg-black/30 p-5 min-h-screen">
        <div className="justify-center">
          <center className="pt-24">

            {/* Upload Box */}
            <div className="inset-0 backdrop-blur-sm border-2 border-dashed border-white/60 w-1/2 h-52 flex flex-col items-center justify-center rounded-2xl hover:bg-white/10 transition">
              {!pendingFile ? (
                <>
                  <input
                    type="file"
                    id="ufile"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="ufile" className="flex flex-col items-center cursor-pointer">
                    <i className="fa-solid fa-cloud-arrow-up fa-bounce text-violet-700 text-6xl mb-4"></i>
                    <span className="text-white font-semibold font-mono">
                      <span className="text-violet-700 text-lg font-bold">Upload</span>{" "}
                      Excel File
                    </span>
                    <span className="text-gray-400 text-sm mt-1 font-mono">
                      or drag and drop Excel file
                    </span>
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-white font-mono mb-4">{pendingFile.name}</p>
                  <div className="flex space-x-4">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
                      Cancel
                    </button>
                    <button onClick={handleUpload} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center justify-center"
                      disabled={loading}>{loading ? (<><i className="fa-solid fa-spinner fa-spin mr-2"></i> Uploading...</>) : ("Upload")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="flex justify-center items-center mt-12">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-violet-500"></i>
              </div>
            ) : (
              <div className="inset-0 backdrop-blur-sm border-2 border-dashed border-white/60 w-full min-h-full mt-12 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-white font-mono mb-6">
                  <i className="fa-solid fa-folder text-yellow-400 pr-5"></i>
                  File Lists
                </h2>
                {uploadedFiles.length === 0 ? (
                  <p className="text-gray-400">No files uploaded yet.</p>
                ) : (
                  <table className="border-collapse w-full text-left">
                    <thead className="border-b pb-2">
                      <tr className="font-semibold font-mono text-lg text-white">
                        <th>S.No</th>
                        <th>
                          <i className="fa-solid fa-file-excel text-green-600"></i>{" "}
                          Excel Files
                        </th>
                        <th className="text-blue-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="border-white/30">
                      {uploadedFiles.map((f, index) => (
                        <tr key={index} className="pb-4 font-mono text-md text-white hover:bg-white/10 transition">
                          <td className="pl-2">{index + 1}</td>
                          <td className="p-4">
                            <p className="font-semibold text-green-600">{f.table_name}</p>
                          </td>
                          <td>
                            <button onClick={() => handleDelete(f.table_name)} className="mr-4">
                              <i className="fa-solid fa-trash text-red-500 hover:text-red-600"></i>
                            </button>
                            <button onClick={() => handleView(f.table_name)} className="mr-4">
                              <i className="fa-solid fa-eye text-green-500 hover:text-green-600"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

          </center>
        </div>
      </div>
    </div>
  );
}

export default Excel_datas;
