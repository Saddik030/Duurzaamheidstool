import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import datacenters from '../data/datacenters.json';
import InfoButton from './InfoButton';

interface InferencePhaseProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const providerMap: { [key: string]: string } = {
  azure: 'Microsoft',
  gcp: 'Google',
  aws: 'AWS',
  ibm: 'IBM',
  irm: 'Iron Mountain',
  meta: 'Meta',
  oracle: 'Oracle',
  sap: 'SAP',
  equ: 'Equinix',
  dgr: 'Digital Realty'
};

const aiTasks = [
  { name: 'Tekstgeneratie', value: 'text-generation', energy: 0.047 / 1000 },
  { name: 'Tekstclassificatie', value: 'text-classification', energy: 0.002 / 1000 },
  { name: 'Vraag beantwoording (extractief)', value: 'extractive-qa', energy: 0.003 / 1000 },
  { name: 'Masked language modeling', value: 'masked-lm', energy: 0.003 / 1000 },
  { name: 'Tokenclassificatie', value: 'token-classification', energy: 0.004 / 1000 },
  { name: 'Beeldclassificatie', value: 'image-classification', energy: 0.007 / 1000 },
  { name: 'Objectdetectie', value: 'object-detection', energy: 0.038 / 1000 },
  { name: 'Samenvatting maken', value: 'summarization', energy: 0.049 / 1000 },
  { name: 'Beeldonderschrift genereren', value: 'image-captioning', energy: 0.063 / 1000 },
  { name: 'Beeldgeneratie', value: 'image-generation', energy: 2.907 / 1000 }
];

const InferencePhase: React.FC<InferencePhaseProps> = ({ data, onUpdate, onNext }) => {
  const providerLabel = providerMap[data.provider];
  const availableDatacenters = datacenters.filter(
    (dc) => dc['Bedrijf'] === providerLabel
  );

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selected = availableDatacenters.find(
      (dc) => dc['Datacenter / regio'] === selectedName
    );

    onUpdate({
      region: selectedName,
      pue: selected ? parseFloat(selected['PUE']) : undefined,
      carbonIntensity: selected ? parseFloat(selected['Carbon Intensity (gCO2/kWh)']) : undefined
    });
  };

  const duration = parseFloat(data.inferenceDuration || 0);
  const inferences = parseFloat(data.inferencesPerYear || 0);
  const energyPerInference = parseFloat(data.energyPerInference || 0);
  const pue = parseFloat(data.pue || 1);
  const ci = parseFloat(data.carbonIntensity || 0);

  const embeddedGPUgCO2 = (150000 / (6 * 365 * 24 * 3600)) * duration * inferences;
  const operationalCO2 = (energyPerInference * pue * inferences * ci) / 1000;


  const embeddedServergCO2 = (2500000 / (6 * 365 * 24 * 3600)) * duration * inferences * 0.4;

  const totalCO2 = operationalCO2 + embeddedGPUgCO2 / 1000 + embeddedServergCO2 / 1000;

  useEffect(() => {
    if (!isNaN(totalCO2) && isFinite(totalCO2)) {
      onUpdate({
        totalCO2,
        embeddedServerCO2: embeddedServergCO2 / 1000
      });
    }
  }, [duration, inferences, energyPerInference, pue, ci]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Beoordeel de duurzaamheid van jouw AI-toepassing tijdens gebruik (inferentie)
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Waar wordt inferentie uitgevoerd?
          </label>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="radio" name="inferenceLocation" value="cloud" className="h-4 w-4 text-indigo-600" onChange={(e) => onUpdate({ location: e.target.value })} />
              <span>Cloud</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="inferenceLocation" value="local" className="h-4 w-4 text-indigo-600" onChange={(e) => onUpdate({ location: e.target.value })} />
              <span>Lokaal (on-premise)</span>
            </label>
          </div>
        </div>

        {data.location === 'cloud' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cloud provider</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" value={data.provider || ''} onChange={(e) => onUpdate({ provider: e.target.value, region: '', pue: null })}>
                <option value="">Selecteer een provider</option>
                {Object.keys(providerMap).map(key => (
                  <option key={key} value={key}>{providerMap[key]}</option>
                ))}
              </select>
            </div>

            {data.provider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regio/Datacenter</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg" value={data.region || ''} onChange={handleRegionChange}>
                  <option value="">Selecteer een datacenter</option>
                  {availableDatacenters.map((dc, index) => (
                    <option key={index} value={dc['Datacenter / regio']}>
                      {dc['Datacenter / regio']} ({dc.Land})
                    </option>
                  ))}
                </select>
                {data.pue && <p className="mt-2 text-sm text-gray-600"><strong>PUE:</strong> {data.pue}</p>}
                {data.carbonIntensity && <p className="mt-1 text-sm text-gray-600"><strong>Energymix (CO₂-intensiteit):</strong> {data.carbonIntensity} gCO₂/kWh</p>}
              </div>
            )}
          </>
        )}

        {data.location === 'local' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locatie</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Voer locatie in" onChange={(e) => onUpdate({ localLocation: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hardware Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg" onChange={(e) => onUpdate({ hardware: e.target.value })}>
                <option value="cpu">CPU</option>
                <option value="gpu">GPU</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Waar wordt de AI-toepassing voornamelijk voor gebruikt?</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg" value={data.task || ''} onChange={(e) => {
            const selectedTask = aiTasks.find(task => task.value === e.target.value);
            onUpdate({
              task: e.target.value,
              energyPerInference: selectedTask?.energy ?? ''
            });
          }}>
            <option value="">Selecteer een taak</option>
            {aiTasks.map(task => (
              <option key={task.value} value={task.value}>{task.name}</option>
            ))}
          </select>
          {data.energyPerInference && <p className="mt-2 text-sm text-gray-600"><strong>Gemiddelde energieverbruik per inferentie:</strong> {Number(data.energyPerInference).toFixed(6)} kWh/inferentie</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aantal inferenties per jaar</label>
          <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="bijv. 1000000" onChange={(e) => onUpdate({ inferencesPerYear: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Energieverbruik per inferentie (kWh)</label>
          <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Optioneel - wordt geschat indien leeg gelaten" value={data.energyPerInference || ''} onChange={(e) => onUpdate({ energyPerInference: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gemiddelde duur van een inferentie (seconden)</label>
        <input type="number" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="bijv. 5" value={data.inferenceDuration || ''} onChange={(e) => onUpdate({ inferenceDuration: e.target.value })} />
      </div>

      {(data.inferenceDuration && data.inferencesPerYear) && (
        <div className="p-4 mt-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Totale CO₂-uitstoot inferentie</h3>
          <p className="text-sm text-gray-600">
            Operationeel: <strong>{operationalCO2.toFixed(2)} kg CO₂e/jaar</strong><br />
            Embedded GPU: <strong>{(embeddedGPUgCO2 / 1000).toFixed(2)} kg CO₂e/jaar</strong><br />
            Embedded Server: <strong>{(embeddedServergCO2 / 1000).toFixed(2)} kg CO₂e/jaar</strong><br />
            Totaal: <strong>{totalCO2.toFixed(2)} kg CO₂e/jaar</strong>
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Volgende
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <InfoButton
        text={`Tijdens het gebruik van een AI-toepassing (ook wel “inference” genoemd) wordt elektriciteit verbruikt, en daarmee komt CO₂ vrij. Daarnaast moet ook rekening gehouden worden met de milieubelasting van de apparatuur die hiervoor nodig is. Deze tool schat de totale uitstoot per jaar op basis van drie onderdelen:

                Verbruik tijdens het gebruik (operationele uitstoot)
                Elke keer dat een AI-model gebruikt wordt (bijvoorbeeld om een tekst te genereren of een beeld te analyseren), draait er een berekening op een server. Dit kost stroom. De uitstoot die hierbij vrijkomt hangt af van:

                Hoeveel energie één zo’n berekening kost;

                Hoe vaak het model per jaar wordt gebruikt;

                Hoe efficiënt het datacenter werkt (dit drukken we uit in een zogeheten PUE, oftewel hoe goed het datacenter met energie omgaat);

                Hoe ‘schoon’ de stroom is op die locatie (CO₂-uitstoot per kWh elektriciteit).

                Milieu-impact van de grafische rekenchip (GPU)
                AI-toepassingen draaien vaak op speciale chips, zogenaamde GPU’s. Het maken van zo’n chip kost veel grondstoffen en energie. De CO₂-uitstoot die hierbij vrijkomt wordt in deze berekening verdeeld over 6 jaar (de geschatte levensduur), en vervolgens omgerekend naar het daadwerkelijke gebruik van het model.

                Milieu-impact van de server
                De chip zit in een grotere server, en ook de productie van die server veroorzaakt CO₂-uitstoot. Omdat een server vaak ook andere taken uitvoert (zoals opslag of andere software), nemen we aan dat ongeveer 40% van de uitstoot aan AI-toepassingen toe te rekenen is. Ook deze uitstoot wordt over 6 jaar verdeeld en aangepast op het gebruik.

                Totale uitstoot
                De drie onderdelen samen vormen de totale, jaarlijkse geschatte CO₂-uitstoot van het gebruik van de AI-toepassing.`}
      />
    </div>
  );
};

export default InferencePhase;
