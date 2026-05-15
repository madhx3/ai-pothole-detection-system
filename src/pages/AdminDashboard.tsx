import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Search } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function AdminDashboard() {

  const [reports, setReports] = useState<any[]>([]);

  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  /* LOGOUT */
  const logout = () => {

    localStorage.removeItem('admin_token');

    navigate('/admin');
  };

  /* FETCH REPORTS */
  const fetchReports = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/reports`
      );

      const data = await res.json();

      setReports(data);

    } catch (err) {

      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* DELETE REPORT */
  const deleteReport = async (
    reportId: string
  ) => {

    const token =
      localStorage.getItem('admin_token');

    try {

      await fetch(
        `${API_BASE}/reports/${reportId}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchReports();

    } catch (err) {

      console.error(err);
    }
  };

  /* SEARCH FILTER */
  const filteredReports = reports.filter(
    (report) =>
      report.report_id
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-white">
          Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl text-white"
        >
          Logout
        </button>

      </div>

      {/* SEARCH */}
      <div className="relative mb-8 max-w-xl">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          type="text"
          placeholder="Search Report ID..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-blue-500"
        />

      </div>

      {/* REPORT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {filteredReports.length === 0 ? (

          <div className="text-gray-400">
            No reports found
          </div>

        ) : (

          filteredReports.map((report) => (

            <div
              key={report.report_id}
              className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-xl"
            >

              {/* IMAGE */}
              {report.image_name && (

                <img
                  src={`${API_BASE}/uploads/${report.image_name}`}
                  alt="Pothole"
                  className="w-full h-56 object-cover"
                />
              )}

              {/* CONTENT */}
              <div className="p-6">

                {/* REPORT ID */}
                <p className="text-blue-400 font-mono text-sm mb-3">
                  {report.report_id}
                </p>

                {/* DETAILS */}
                <div className="space-y-2">

                  <p className="text-white">
                    Severity:
                    <span className="ml-2 font-semibold capitalize">
                      {report.severity}
                    </span>
                  </p>

                  <p className="text-gray-300">
                    Confidence:
                    <span className="ml-2">
                      {report.confidence}%
                    </span>
                  </p>

                  <p className="text-gray-400 text-sm">
                    {new Date(
                      report.timestamp
                    ).toLocaleString()}
                  </p>

                </div>

                {/* DELETE BUTTON */}
                <button
                  onClick={() =>
                    deleteReport(
                      report.report_id
                    )
                  }
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 transition text-white py-3 rounded-xl"
                >
                  Delete Report
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}