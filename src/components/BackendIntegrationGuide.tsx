import React, { useState } from 'react';
import { X, Code2, Copy, Check, ExternalLink, Terminal, Server } from 'lucide-react';

interface BackendIntegrationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendIntegrationGuide: React.FC<BackendIntegrationGuideProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sampleExpressRoute = `// server.ts or express backend router
import express from 'express';

const app = express();
app.use(express.json());

// Singapore Home-School Distance API endpoint
app.post('/api/calculate-distances', async (req, res) => {
  const { homeCoordinates, schoolIds } = req.body;
  // homeCoordinates: { lat: 1.3526, lng: 103.8490 }
  // Optional: Query SLA OneMap API for School Land Boundary (SLB)
  
  // Or query your database / PostgreSQL with PostGIS:
  // SELECT id, name, ST_DistanceSphere(geom, ST_MakePoint($lng, $lat)) as distance_meters FROM primary_schools;

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    results: [
      /* Return array of SchoolDistanceResult objects matching types.ts */
    ]
  });
});`;

  const sampleOneMapCode = `// SLA OneMap Geocoding API Integration
async function geocodeSingaporePostal(postalCode: string) {
  const url = \`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=\${postalCode}&returnGeom=Y&getAddrDetails=Y\`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    const first = data.results[0];
    return {
      lat: parseFloat(first.LATITUDE),
      lng: parseFloat(first.LONGITUDE),
      address: first.ADDRESS,
      building: first.BUILDING
    };
  }
  return null;
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Backend Connection & API Contract</h2>
              <p className="text-xs text-slate-500">
                Ready-to-wire specifications for integrating your Node.js, Express, PostgreSQL, or OneMap backend.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Architecture Overview */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
            <h3 className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Decoupled Frontend Architecture
            </h3>
            <p className="text-indigo-900 leading-relaxed">
              The front end is currently operating with a client-side high-precision Singapore geodesic calculation engine in{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-800">
                src/utils/distanceUtils.ts
              </code>
              . It includes the service hook <code className="font-mono text-indigo-800">fetchDistancesFromBackend()</code> ready to point to your live backend endpoint.
            </p>
          </div>

          {/* SLA OneMap Documentation Reference */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
              <span>Official Singapore Land Authority (SLA) APIs</span>
              <a
                href="https://www.onemap.gov.sg/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-normal"
              >
                SLA OneMap API Docs <ExternalLink className="w-3 h-3" />
              </a>
            </h4>
            <p className="text-slate-600 mb-2">
              In Singapore, the Ministry of Education calculates Home-School Distance using SLA OneMap’s School Land Boundary (SLB) algorithms. You can query the SLA OneMap Elastic Search API to resolve 6-digit postal codes to precise SVY21 or WGS84 coordinates:
            </p>

            <div className="relative rounded-lg bg-slate-900 p-3 text-slate-200 font-mono text-[11px] overflow-x-auto">
              <button
                onClick={() => handleCopy('onemap', sampleOneMapCode)}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 text-[10px]"
              >
                {copiedCode === 'onemap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'onemap' ? 'Copied' : 'Copy'}
              </button>
              <pre>{sampleOneMapCode}</pre>
            </div>
          </div>

          {/* Express / Custom Endpoint Recipe */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              Sample Backend Endpoint Contract (<code className="font-mono">POST /api/calculate-distances</code>)
            </h4>
            <div className="relative rounded-lg bg-slate-900 p-3 text-slate-200 font-mono text-[11px] overflow-x-auto">
              <button
                onClick={() => handleCopy('express', sampleExpressRoute)}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 text-[10px]"
              >
                {copiedCode === 'express' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'express' ? 'Copied' : 'Copy'}
              </button>
              <pre>{sampleExpressRoute}</pre>
            </div>
          </div>

          {/* Connecting the URL */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-semibold text-slate-900">How to Connect When Your Backend is Ready:</h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>
                In your root <code className="font-mono text-slate-800">.env</code> file, set{' '}
                <code className="font-mono text-slate-800">VITE_BACKEND_API_URL=https://your-backend-api.com</code>
              </li>
              <li>
                In <code className="font-mono text-slate-800">src/App.tsx</code> or{' '}
                <code className="font-mono text-slate-800">src/utils/distanceUtils.ts</code>, pass that URL to{' '}
                <code className="font-mono text-slate-800">fetchDistancesFromBackend()</code>.
              </li>
              <li>The frontend will seamlessly pipe the backend results into all UI tables, cards, and map markers.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
