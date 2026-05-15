import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Loader,
  Camera
} from 'lucide-react';

import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import GlassCard from './GlassCard';

interface DemoProps {
  onPotholeDetected: (
    confidence: number,
    lat: number,
    lng: number,
    imageName?: string
  ) => void;
}

export default function Demo({ onPotholeDetected }: DemoProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'getting' | 'granted' | 'denied'
  >('idle');

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [showCamera, setShowCamera] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setLocationStatus('getting');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          setUserLocation(loc);
          setLocationStatus('granted');

          resolve(loc);
        },
        () => {
          setLocationStatus('denied');
          reject(new Error('Location denied'));
        }
      );
    });
  };

  const processFile = async (file: File) => {
    setImage(URL.createObjectURL(file));
    setLoading(true);
    setIsDetected(null);

    let location = userLocation;

    if (!location) {
      try {
        location = await getLocation();
      } catch {
        setLocationStatus('denied');
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      setIsDetected(data.detected);
      setConfidence(data.confidence);

      if (data.detected && location) {
        onPotholeDetected(
          data.confidence,
          location.lat,
          location.lng,
          data.image_name
        );
      }
    } catch (error) {
      console.error(error);
      setIsDetected(false);
    }

    setLoading(false);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    processFile(file);
  };

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then((res) => res.blob());

    const file = new File([blob], 'capture.jpg', {
      type: 'image/jpeg'
    });

    processFile(file);

    setShowCamera(false);
  };

  return (
    <section
      id="demo"
      className="py-20 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-4xl mx-auto">

        {/* FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          id="fileInput"
          className="hidden"
        />

        {/* TITLE */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Take a Picture of Pothole
          </h2>

          <p className="text-sm sm:text-base text-gray-400">
            Upload image or capture from camera
          </p>
        </div>

        {/* LOCATION */}
        <div className="mb-4 sm:mb-6 px-2">
          {locationStatus === 'idle' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-500/20 border border-blue-400/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-400 w-5 h-5 shrink-0" />

                <span className="text-blue-300 text-xs sm:text-sm">
                  Location needed to mark potholes on map
                </span>
              </div>

              <button
                onClick={getLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition whitespace-nowrap"
              >
                Enable GPS
              </button>
            </div>
          )}

          {locationStatus === 'getting' && (
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-3">
              <Loader className="text-yellow-400 w-5 h-5 animate-spin shrink-0" />

              <span className="text-yellow-300 text-xs sm:text-sm">
                Getting your location...
              </span>
            </div>
          )}

          {locationStatus === 'granted' && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3">
              <MapPin className="text-green-400 w-5 h-5 shrink-0" />

              <span className="text-green-300 text-xs sm:text-sm">
                ✅ Location enabled
              </span>
            </div>
          )}
        </div>

        <GlassCard className="p-4 sm:p-6 md:p-8">

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">

            <button
              onClick={() =>
                document.getElementById('fileInput')?.click()
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Upload Image
            </button>

            <button
              onClick={() => setShowCamera(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Open Camera
            </button>
          </div>

          {/* CAMERA */}
          {showCamera && (
            <div className="mb-6">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-2xl w-full"
              />

              <button
                onClick={capture}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition"
              >
                Capture Photo
              </button>
            </div>
          )}

          {/* RESULTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

            {/* IMAGE */}
            <GlassCard className="p-4 sm:p-6 h-48 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  className="h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto text-gray-500" />

                  <p className="text-gray-500 text-sm">
                    No image
                  </p>
                </div>
              )}
            </GlassCard>

            {/* STATUS */}
            <GlassCard className="p-4 sm:p-6 h-48 flex items-center justify-center">

              {loading ? (
                <div className="text-center">
                  <Loader className="mx-auto text-blue-400 mb-2 animate-spin" />

                  <p className="text-gray-400 text-sm">
                    Processing...
                  </p>
                </div>

              ) : isDetected === null ? (

                <div className="text-center">
                  <CheckCircle2 className="mx-auto text-gray-500" />

                  <p className="text-gray-500 text-sm">
                    Awaiting upload
                  </p>
                </div>

              ) : isDetected ? (

                <div className="text-center">
                  <AlertCircle
                    className="mx-auto text-red-400 mb-2"
                    size={32}
                  />

                  <p className="text-white font-bold text-sm">
                    Pothole Detected
                  </p>

                  <p className="text-gray-400 text-xs sm:text-sm">
                    Confidence: {confidence}%
                  </p>

                  {userLocation && (
                    <p className="text-green-400 text-xs mt-1">
                      📍 Marked on map!
                    </p>
                  )}
                </div>

              ) : (

                <div className="text-center">
                  <CheckCircle2
                    className="mx-auto text-green-400 mb-2"
                    size={32}
                  />

                  <p className="text-white text-sm">
                    No pothole detected
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}