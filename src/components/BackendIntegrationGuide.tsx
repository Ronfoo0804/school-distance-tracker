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

  const sampleOneMapRoutingCode = `// /api/schooldistance.ts live OneMap routing query
// SLA OneMap Routing Endpoint:
// https://www.onemap.gov.sg/api/public/routingsvc/route?start={start}&end={end}&routeType={walk|drive|cycle|pt}
// Header: AccountKey: <your_key>

const oneMapUrl = \`https://www.onemap.gov.sg/api/public/routingsvc/route?start=\${start}&end=\${end}&routeType=\${routeType}\`;

const response = await fetch(oneMapUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'AccountKey': process.env.ONEMAP_ACCOUNT_KEY || '',
  },
});

const data = await response.json();
// Returns route_summary with total_distance (m), total_time (s), route_geometry, etc.`;


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

          {/* Live OneMap Routing Endpoint */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              OneMap Serverless Route Handler (<code className="font-mono">GET/POST /api/schooldistance</code>)
            </h4>
            <p className="text-slate-600 mb-2">
              Handles routing for <code className="font-mono text-slate-800">walk</code>, <code className="font-mono text-slate-800">drive</code>, <code className="font-mono text-slate-800">cycle</code>, and <code className="font-mono text-slate-800">pt</code> (public transit) with the required <code className="font-mono text-slate-800">AccountKey:</code> header:
            </p>
            <div className="relative rounded-lg bg-slate-900 p-3 text-slate-200 font-mono text-[11px] overflow-x-auto">
              <button
                onClick={() => handleCopy('routing', sampleOneMapRoutingCode)}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 text-[10px]"
              >
                {copiedCode === 'routing' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'routing' ? 'Copied' : 'Copy'}
              </button>
              <pre>{sampleOneMapRoutingCode}</pre>
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
