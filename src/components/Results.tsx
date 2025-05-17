import React, { useState } from 'react';
import { Download, Info } from 'lucide-react';
import Uitleg from './Uitleg';

interface ResultsProps {
  formData: any;
}

const determineEnergyLabel = (co2: number): string => {
  if (co2 <= 10000) return 'A';
  if (co2 <= 20000) return 'B';
  if (co2 <= 40000) return 'C';
  if (co2 <= 80000) return 'D';
  if (co2 <= 160000) return 'E';
  if (co2 <= 320000) return 'F';
  return 'G';
};

const getLabelColor = (label: string) => {
  switch (label) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-lime-400';
    case 'C': return 'bg-yellow-400';
    case 'D': return 'bg-orange-400';
    case 'E': return 'bg-orange-500';
    case 'F': return 'bg-red-500';
    case 'G': return 'bg-red-700';
    default: return 'bg-gray-300';
  }
};

const phaseExplanations: { [key: string]: string } = {
  training: 'De uitstoot bij training is gebaseerd op het opgegeven model.',
  inference: 'De uitstoot bij inferentie omvat operationeel verbruik en productie van de gebruikte GPU.',
  devices: 'De uitstoot van apparaten is gebaseerd op sessieduur, apparaattype en productie-impact.',
  network: 'Netwerkverkeer veroorzaakt uitstoot door energiegebruik per GB en CO₂-intensiteit van stroom.',
  hosting: 'Bij hosting is ook de productie-uitstoot van servers meegerekend over hun levensduur.'
};

const deviceInfo = {
  smartphone: { power: 1, embeddedCO2: 86.6, lifetime: 3 },
  laptop: { power: 75, embeddedCO2: 522.6, lifetime: 4 },
  desktop: { power: 175, embeddedCO2: 1273.4, lifetime: 5 },
  tablet: { power: 7.5, embeddedCO2: 110.1, lifetime: 4 }
};

const calculateTrainingCO2 = (trainingData: any) => {
  if (trainingData?.selectedModelEmission !== undefined) {
    return parseFloat(trainingData.selectedModelEmission);
  }
  return trainingData?.gpuHours ? trainingData.gpuHours * 0.2 : 0;
};

const calculateInferenceCO2 = (inferenceData: any) => {
  const embeddedServerCO2 = parseFloat(inferenceData?.embeddedServerCO2 || 0);
  const inferenceCO2 = parseFloat(inferenceData?.totalCO2 || 0) + embeddedServerCO2;
  return {
    co2: inferenceCO2,
    inferencesPerYear: parseFloat(inferenceData?.inferencesPerYear || 0),
  };
};

const calculateDeviceCO2 = (devicesData: any) => {
  let deviceCO2 = 0;
  let embeddedDeviceCO2 = 0;
  const carbonIntensity = 268;

  if (devicesData?.devices) {
    for (const type in devicesData.devices) {
      const d = devicesData.devices[type];
      const count = parseFloat(d?.count || 0);
      const duration = parseFloat(d?.duration || 0);
      const info = deviceInfo[type];
      if (!info) continue;
      const hours = duration / 60;
      const embedded = (info.embeddedCO2 / info.lifetime) * (duration / (8 * 60));
      deviceCO2 += (count * info.power * hours * carbonIntensity) / 1000;
      embeddedDeviceCO2 += count * embedded;
    }
  }
  return {
    operational: deviceCO2,
    embodied: embeddedDeviceCO2,
    total: deviceCO2 + embeddedDeviceCO2
  };
};

const calculateNetworkCO2 = (networkData: any, inferencesPerYear: number) => {
  const carbonIntensity = 268;
  const netData = parseFloat(networkData?.dataAmount || 0);
  const netUnit = networkData?.dataUnit || 'MB';
  const dataInGB = netUnit === 'GB' ? netData : netData / 1000;
  const netEnergy = dataInGB * 0.27 * inferencesPerYear;
  return (netEnergy * carbonIntensity) / 1000;
};

const calculateHostingCO2 = (hostingData: any) => {
  const visits = parseFloat(hostingData?.annualVisits || 0);

  // 0.8 gram CO2 per bezoek → omrekenen naar kg
  const hostingCO2 = (visits * 0.8) / 1000;

  const lifetimeVisits = visits * 6;
  const serverProdCO2 =
    hostingData?.isOnline && hostingData?.hostingType === 'cloud'
      ? (2500000 / lifetimeVisits) * visits / 1000
      : 0;

  return {
    operational: hostingCO2,
    embodied: serverProdCO2,
    total: hostingCO2 + serverProdCO2
  };
};

const Results: React.FC<ResultsProps> = ({ formData }) => {
  const { training, inference, devices, network, hosting } = formData;
  const [visibleInfo, setVisibleInfo] = useState<string | null>(null);

  const trainingCO2 = calculateTrainingCO2(training);
  const { co2: inferenceCO2, inferencesPerYear } = calculateInferenceCO2(inference);
  const { total: deviceCO2 } = calculateDeviceCO2(devices);
  const networkCO2 = calculateNetworkCO2(network, inferencesPerYear);
  const { total: hostingCO2 } = calculateHostingCO2(hosting);

  const totalCO2 = trainingCO2 + inferenceCO2 + deviceCO2 + networkCO2 + hostingCO2;

  const results = {
    total: { co2: totalCO2 },
    breakdown: {
      training: { co2: trainingCO2 },
      inference: { co2: inferenceCO2 },
      devices: { co2: deviceCO2 },
      network: { co2: networkCO2 },
      hosting: { co2: hostingCO2 }
    }
  };

  const label = determineEnergyLabel(results.total.co2);

  const downloadResults = () => {
    const data = JSON.stringify({ formData, results }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-duurzaamheidsrapport.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">Resultaten van duurzaamheidsanalyse</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Totale CO₂-uitstoot</h3>
        <p className="text-2xl font-bold text-green-600">
          {results.total.co2.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e
        </p>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2 text-gray-700">Inschatting energielabel (indicatief)</h4>
          <div className="flex items-center space-x-1">
            {['G', 'F', 'E', 'D', 'C', 'B', 'A'].map((lbl) => (
              <div
                key={lbl}
                className={`w-8 h-8 text-xs text-white font-bold flex items-center justify-center rounded ${getLabelColor(lbl)} ${
                  lbl === label ? 'scale-110 ring-2 ring-black' : ''
                }`}
              >
                {lbl}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Gebaseerd op totale CO₂-uitstoot van deze toepassing
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Vergelijkbaar met de uitstoot van</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>🚗 {Math.round(results.total.co2 / 0.12).toLocaleString()} autokilometers (120 g/km)</p>
          <p>🌳 De hoeveelheid koolstof die {Math.round(results.total.co2 / 25).toLocaleString()} bomen in een jaar opnemen</p>
          <p>🏠 {Math.round(results.total.co2 / 18500 * 100) / 100} Nederlandse huishoudens (jaarlijks)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-6">Uitsplitsing per fase</h3>
        {Object.entries(results.breakdown).map(([phase, data]: [string, any]) => {
          const label = phase[0].toUpperCase() + phase.slice(1);
          return (
            <div key={phase} className="flex items-center space-x-4 mb-3">
              <div className="w-24 flex items-center text-sm font-medium">
                {label}
                <button
                  onClick={() => setVisibleInfo(visibleInfo === phase ? null : phase)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${(data.co2 / results.total.co2) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-32 text-sm text-gray-600">
                {data.co2.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e
              </div>
            </div>
          );
        })}
        {visibleInfo && (
          <div className="mt-4 text-sm text-gray-700 bg-gray-50 border p-4 rounded">
            <strong>Toelichting:</strong> {phaseExplanations[visibleInfo]}
          </div>
        )}
      </div>

      {inferencesPerYear > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Impact per inferentie</h3>
          <p className="text-sm text-gray-600">
            🌍 <strong>{(results.total.co2 * 1000 / inferencesPerYear).toFixed(2)}</strong> g CO₂e
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>* Embedded CO₂ van GPU’s: 150 kg CO₂e / 6 jaar (Luccioni et al 2022).</p>
        <p>* Embedded CO₂ server: 2500 kg CO₂e / 6 jaar (Luccioni et al 2022).</p>
        <p>* Apparaten: gebaseerd op Malmodin & Lundén (2018), geschaald per sessieduur.</p>
        <p>* Netwerk: 0.27 kWh/GB; CO₂-intensiteit: 268 g/kWh (2023).</p>
      </div>

<Uitleg formData={formData} results={results} />

      <div className="flex justify-end">
        <button
          onClick={downloadResults}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Download Rapport
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


export default Results;