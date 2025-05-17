import React from 'react';
import { ChevronRight } from 'lucide-react';
import InfoButton from './InfoButton';


interface NetworkUsageProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const DEFAULT_KWH_PER_GB = 0.27;
const DEFAULT_CARBON_INTENSITY = 268; // gCO₂ per kWh – Nederland (bron: 2023)

const NetworkUsage: React.FC<NetworkUsageProps> = ({ data, onUpdate, onNext }) => {
  const dataAmount = parseFloat(data.dataAmount) || 0;
  const dataUnit = data.dataUnit || 'kB';

  let dataInGB = 0;
  if (dataUnit === 'kB') dataInGB = dataAmount / 1_000_000;
  else if (dataUnit === 'MB') dataInGB = dataAmount / 1_000;
  else dataInGB = dataAmount;

  const estimatedKWh = dataInGB * DEFAULT_KWH_PER_GB;
  const estimatedCO2g = estimatedKWh * DEFAULT_CARBON_INTENSITY;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Schat de uitstoot door datatransmissie
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemiddelde data per inferentie
          </label>
          <div className="flex space-x-4">
            <input
              type="number"
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              placeholder="bijv. 150"
              value={data.dataAmount || ''}
              onChange={(e) => onUpdate({ dataAmount: e.target.value })}
            />
            <select
              className="w-24 p-3 border border-gray-300 rounded-lg"
              value={data.dataUnit || 'kB'}
              onChange={(e) => onUpdate({ dataUnit: e.target.value })}
            >
              <option value="kB">kB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Kleine AI-uitvoeringen (zoals chat of classificatie) hebben vaak slechts tientallen tot honderden kB aan dataverkeer.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Geschatte impact
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Verbruik per inferentie:</strong> {estimatedKWh.toFixed(6)} kWh
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>CO₂-uitstoot per inferentie:</strong> {estimatedCO2g.toFixed(2)} gram CO₂
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Gebaseerd op gemiddeld stroomverbruik van 0.27 kWh/GB (Farfan & Lohrmann, 2023) en een CO₂-intensiteit van 268 gCO₂/kWh (Nederland, 2023).<br />
            De eenheden zijn afgestemd op veelvoorkomende AI-gebruikstoepassingen.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <InfoButton
        text={`Wanneer een gebruiker een AI-toepassing gebruikt, wordt er data verstuurd via het internet: bijvoorbeeld tekst die naar een server gaat, of resultaten die terugkomen. Dit dataverkeer (bijvoorbeeld via wifi of mobiel netwerk) verbruikt elektriciteit in datacenters, netwerkapparatuur, zendmasten en routers.

              In deze tool berekenen we de uitstoot op basis van:

              - De hoeveelheid data die per actie (inferentie) wordt verzonden;
              - De gemiddelde hoeveelheid elektriciteit die nodig is voor 1 gigabyte data (0,27 kWh/GB);
              - De CO₂-uitstoot per kilowattuur in Nederland (268 gram CO₂/kWh).

              Zo krijg je een inschatting van de CO₂-impact per AI-inferentie die veroorzaakt wordt door het netwerkgebruik.`}
      />
    </div>
  );
};

export default NetworkUsage;
