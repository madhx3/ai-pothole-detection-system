import { useState, useEffect } from 'react';

import {
  BrowserRouter,
  Routes,
 Route
} from 'react-router-dom';

import Hero from './components/Hero';
import About from './components/About';
import Demo from './components/Demo';
import Features from './components/Features';
import MapVisualization from './components/MapVisualization';
import Reports from './components/Reports';
import Footer from './components/Footer';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import ProtectedRoute from './components/ProtectedRoute';

export type PotholeMarker = {
  id: number;
  lat: number;
  lng: number;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: string;
  report_id?: string;
  image_name?: string;
};

const API_BASE = 'http://localhost:5000';

/* ───────────────────────────────────────────────────────────── */
/* MAIN WEBSITE */
/* ───────────────────────────────────────────────────────────── */

function MainWebsite() {

  const [markers, setMarkers] = useState<PotholeMarker[]>([]);

  const [latestReportId, setLatestReportId] =
    useState<string | null>(null);

  /* LOAD MARKERS */
  useEffect(() => {

    fetch(`${API_BASE}/markers`)
      .then((res) => res.json())
      .then((data: PotholeMarker[]) =>
        setMarkers(data)
      )
      .catch((err) =>
        console.error(
          'Failed to load markers:',
          err
        )
      );

  }, []);

  /* ADD MARKER */
  const addMarker = async (
    confidence: number,
    lat: number,
    lng: number,
    imageName?: string
  ) => {

    const severity =
      confidence >= 80
        ? 'high'
        : confidence >= 50
        ? 'medium'
        : 'low';

    const timestamp = new Date().toISOString();

    const payload = {
      lat,
      lng,
      severity,
      confidence,
      timestamp
    };

    /* CREATE REPORT */
    let reportId = '';

    try {

      const res = await fetch(
        `${API_BASE}/reports`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            ...payload,
            image_name: imageName ?? '',

            notes:
              `Auto-generated report. ` +
              `Confidence: ${confidence}%. ` +
              `Severity: ${severity}.`
          })
        }
      );

      const report = await res.json();

      reportId = report.report_id;

      setLatestReportId(reportId);

    } catch (err) {

      console.error(
        'Failed to create report:',
        err
      );
    }

    /* SAVE MARKER */
    try {

      const res = await fetch(
        `${API_BASE}/markers`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            ...payload,
            report_id: reportId,
            image_name: imageName ?? ''
          })
        }
      );

      const saved: PotholeMarker =
        await res.json();

      setMarkers((prev) => [
        ...prev,
        saved
      ]);

    } catch (err) {

      console.error(
        'Failed to save marker:',
        err
      );

      setMarkers((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...payload,
          report_id: reportId,
          image_name: imageName
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">

      <Hero />

      <About />

      <Demo
        onPotholeDetected={addMarker}
      />

      <Features />

      <MapVisualization
        markers={markers}
      />

      <Reports
        recentReportId={latestReportId}
      />

      <Footer />

    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* APP ROUTER */
/* ───────────────────────────────────────────────────────────── */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* MAIN WEBSITE */}
        <Route
          path="/"
          element={<MainWebsite />}
        />

        {/* ADMIN LOGIN */}
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        {/* PROTECTED DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;