'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useEffect, useState } from 'react';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch API spec', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-pulse text-blue-500 font-medium text-xl">
          Loading Modern API Reference...
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-red-500">
        Error loading API specification.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
        <ApiReferenceReact
          configuration={{
            spec: {
              content: spec,
            },
            theme: 'default',
            showSidebar: true,
            layout: 'modern',
            baseServerURL: typeof window !== 'undefined' ? window.location.origin : '',
          } as any}
        />
        <style jsx global>{`
          /* Hide some default elements to keep it clean */
          .scalar-app {
            --scalar-font: 'Inter', sans-serif !important;
          }
        `}</style>
    </main>
  );
}
