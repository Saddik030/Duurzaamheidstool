import React from 'react';
import { ChevronRight } from 'lucide-react';
import InfoButton from './InfoButton';


interface EndUserDevicesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const CO2_PER_KWH = 268; // g CO₂/kWh, gebaseerd op de gemiddelde CO₂-uitstoot van elektriciteit in Nederland
// Bron: https://ourworldindata.org/grapher/carbon-intensity-electricity

const deviceInfo: {
  [key: string]: { label: string; power: number; embeddedCO2: number; lifetime: number };
} = {
  smartphone: { label: 'Smartphone', power: 1, embeddedCO2: 86.6, lifetime: 3 },
  laptop: { label: 'Laptop', power: 75, embeddedCO2: 522.6, lifetime: 4 },
  desktop: { label: 'Desktop Computer', power: 175, embeddedCO2: 1273.4, lifetime: 5 },
  tablet: { label: 'Tablet', power: 7.5, embeddedCO2: 110.1, lifetime: 4 }
};

const EndUserDevices: React.FC<EndUserDevicesProps> = ({ data, onUpdate, onNext }) => {
  const handleDeviceChange = (type: string, field: string, value: string) => {
    onUpdate({
      ...data,
      devices: {
        ...data.devices,
        [type]: {
          ...(data.devices?.[type] || {}),
          [field]: value
        }
      }
    });
  };

  let grandTotalEmbedded = 0;
  let grandTotalOperational = 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Beoordeel het energie- en materiaalgebruik van eindgebruikersapparaten
      </h2>

      <div className="space-y-8">
        {Object.keys(deviceInfo).map((type) => {
          const info = deviceInfo[type];
          const count = parseFloat(data.devices?.[type]?.count || '0'); // gebruikers per jaar
          const durationMin = parseFloat(data.devices?.[type]?.duration || '0');
          const sessionsPerYear = parseFloat(data.devices?.[type]?.sessions || '0');
          const usageFraction = durationMin / 480;

          const embeddedPerDevicePerYear = (info.embeddedCO2 / info.lifetime) * usageFraction;
          const totalEmbedded = count * embeddedPerDevicePerYear;

          const energyPerSessionKWh = (info.power * durationMin) / 1000 / 60;
          const operationalCO2PerSessionG = energyPerSessionKWh * CO2_PER_KWH;
          const totalOperationalCO2Kg = (operationalCO2PerSessionG * sessionsPerYear * count) / 1000;

          const totalPerDevice = totalEmbedded + totalOperationalCO2Kg;

          grandTotalEmbedded += totalEmbedded;
          grandTotalOperational += totalOperationalCO2Kg;

          return (
            <div key={type} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">{info.label}</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal gebruikers per jaar
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={data.devices?.[type]?.count || ''}
                  onChange={(e) => handleDeviceChange(type, 'count', e.target.value)}
                  placeholder="bijv. 1000"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duur van een sessie (minuten)
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={data.devices?.[type]?.duration || ''}
                  onChange={(e) => handleDeviceChange(type, 'duration', e.target.value)}
                  placeholder="bijv. 5"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal sessies per gebruiker per jaar
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={data.devices?.[type]?.sessions || ''}
                  onChange={(e) => handleDeviceChange(type, 'sessions', e.target.value)}
                  placeholder="bijv. 300"
                />
              </div>

              <p className="text-sm text-gray-600">
                <strong>Gemiddeld stroomverbruik:</strong> {info.power} W
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Embedded CO₂-uitstoot:</strong> {totalEmbedded.toFixed(2)} kg CO₂e/jaar
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Operationele CO₂-uitstoot (stroom):</strong> {totalOperationalCO2Kg.toFixed(2)} kg CO₂e/jaar
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>CO₂ per sessie:</strong> {(operationalCO2PerSessionG / 1000).toFixed(4)} kg CO₂e
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Totale CO₂ per gebruiker per jaar:</strong> {((operationalCO2PerSessionG * sessionsPerYear) / 1000).toFixed(2)} kg CO₂e
              </p>
              <p className="text-sm text-gray-800 mt-1 font-medium">
                Totaal per apparaattype: {totalPerDevice.toFixed(2)} kg CO₂e/jaar
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-lg text-green-800 text-sm">
        <p><strong>Totale embedded CO₂-uitstoot:</strong> {grandTotalEmbedded.toFixed(2)} kg CO₂e/jaar</p>
        <p><strong>Totale operationele CO₂-uitstoot:</strong> {grandTotalOperational.toFixed(2)} kg CO₂e/jaar</p>
        <p><strong>Totaal (alles samen):</strong> {(grandTotalEmbedded + grandTotalOperational).toFixed(2)} kg CO₂e/jaar</p>
      </div>

      <div className="text-xs text-gray-500 mt-8">
        *Gemiddeld stroomverbruik is gebaseerd op <a href="https://datavizta.boavizta.org" className="underline" target="_blank" rel="noopener noreferrer">datavizta.boavizta.org</a> en inzichten uit Malmodin & Lundén (2018) en Berthelot et al. (2024).<br />
        *Uitgangspunt: 8 uur actief gebruik per dag (480 minuten).
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <InfoButton
        text={`Bij het gebruik van AI-toepassingen op apparaten zoals laptops, smartphones of tablets ontstaat CO₂-uitstoot op twee manieren:

              Uitstoot door productie van het apparaat (embedded uitstoot)
              Voor elk apparaat is bij de productie CO₂ uitgestoten, bijvoorbeeld door grondstofwinning en fabricage. Deze uitstoot wordt verdeeld over de verwachte levensduur van het apparaat. In deze tool rekenen we een evenredig deel toe op basis van hoe lang het apparaat gemiddeld per dag voor de AI-toepassing wordt gebruikt.

              Uitstoot door stroomverbruik tijdens gebruik (operationele uitstoot)
              Wanneer het apparaat gebruikt wordt, verbruikt het elektriciteit. Hoeveel dat is, hangt af van het type apparaat, hoe lang een sessie duurt en hoe vaak het per jaar wordt gebruikt. De CO₂-uitstoot hangt daarnaast af van hoe ‘schoon’ de elektriciteitsmix is (bijvoorbeeld windenergie of kolencentrales). In dit model gebruiken we een gemiddelde waarde van 475 gram CO₂ per kilowattuur.

              Door het aantal gebruikers per jaar, het aantal sessies en de gebruiksduur per sessie in te voeren, ontstaat een realistische inschatting van de milieu-impact van apparaten die eindgebruikers inzetten om AI-diensten te gebruiken.`}
      />
    </div>
  );
};

export default EndUserDevices;
