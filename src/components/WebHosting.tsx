import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import datacenters from '../data/datacenters.json';
import InfoButton from './InfoButton';

interface WebHostingProps {
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

const WebHosting: React.FC<WebHostingProps> = ({ data, onUpdate, onNext }) => {
  const [url, setUrl] = useState('');
  const [greenCheck, setGreenCheck] = useState<null | { green: boolean, hostedBy: string }>(null);

  const providerLabel = providerMap[data.cloudProvider];
  const availableDatacenters = datacenters.filter(dc => dc['Bedrijf'] === providerLabel);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRegion = e.target.value;
    const selected = availableDatacenters.find(dc => dc['Datacenter / regio'] === selectedRegion);
    onUpdate({
      region: selectedRegion,
      pue: selected ? parseFloat(selected['PUE']) : null,
      carbonIntensity: selected ? parseFloat(selected['Carbon Intensity (gCO2/kWh)']) : null
    });
  };

  const checkGreenHosting = async () => {
    if (!url) return;
    try {
      const response = await fetch(`https://api.thegreenwebfoundation.org/api/v3/greencheck/${encodeURIComponent(url)}`);
      const result = await response.json();
      setGreenCheck({ green: result.green, hostedBy: result.hosted_by || 'onbekend' });
    } catch (error) {
      console.error('Fout bij ophalen van groene hosting data:', error);
      setGreenCheck(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Neem de impact van online beschikbaarheid mee
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Wordt dit model online aangeboden (bijv. via chatbot, API)?
          </label>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="isOnline"
                value="yes"
                className="h-4 w-4 text-indigo-600"
                onChange={() => onUpdate({ isOnline: true })}
              />
              <span>Ja</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="isOnline"
                value="no"
                className="h-4 w-4 text-indigo-600"
                onChange={() => onUpdate({ isOnline: false })}
              />
              <span>Nee</span>
            </label>
          </div>
        </div>

        {data.isOnline && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL van de AI-toepassing (optioneel)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://voorbeeld.nl"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button
                  onClick={checkGreenHosting}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Check
                </button>
              </div>
              {greenCheck && (
                <p className="text-sm mt-2 text-gray-700">
                  Hostingstatus: <strong className={greenCheck.green ? 'text-green-600' : 'text-red-600'}>
                    {greenCheck.green ? 'Groen (duurzaam)' : 'Niet groen'}
                  </strong> – Provider: {greenCheck.hostedBy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jaarlijkse bezoeken
              </label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="bijv. 100000"
                onChange={(e) => onUpdate({ annualVisits: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type hosting
              </label>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="hostingType"
                    value="cloud"
                    className="h-4 w-4 text-indigo-600"
                    onChange={(e) => onUpdate({ hostingType: e.target.value })}
                  />
                  <span>Cloud</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="hostingType"
                    value="local"
                    className="h-4 w-4 text-indigo-600"
                    onChange={(e) => onUpdate({ hostingType: e.target.value })}
                  />
                  <span>Lokaal</span>
                </label>
              </div>
            </div>

            {data.hostingType === 'cloud' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Provider
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={data.cloudProvider || ''}
                  onChange={(e) => onUpdate({ cloudProvider: e.target.value, region: '', pue: null, carbonIntensity: null })}
                >
                  <option value="">Selecteer een provider</option>
                  {Object.entries(providerMap).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {data.cloudProvider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regio/Datacenter
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={data.region || ''}
                  onChange={handleRegionChange}
                >
                  <option value="">Selecteer een datacenter</option>
                  {availableDatacenters.map((dc, index) => (
                    <option key={index} value={dc['Datacenter / regio']}>
                      {dc['Datacenter / regio']} ({dc.Land})
                    </option>
                  ))}
                </select>

                {(data.pue || data.carbonIntensity) && (
                  <div className="p-4 bg-gray-50 rounded-lg mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Automatisch opgehaalde gegevens
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {data.pue && <p><strong>PUE:</strong> {data.pue}</p>}
                      {data.carbonIntensity && <p><strong>Energymix (CO₂-intensiteit):</strong> {data.carbonIntensity} gCO₂/kWh</p>}
                      {data.annualVisits && (
                        <>
                          <p><strong>CO₂-uitstoot per bezoek (operationeel):</strong> 0.8 g CO₂ (gemiddeld)</p>
                          <p><strong>Totale jaarlijkse uitstoot (operationeel):</strong> {(() => {
                            const visits = Number(data.annualVisits || 0);
                            const total = visits * 0.8;
                            return `${(total / 1000).toFixed(2)} kg CO₂`;
                          })()}</p>
                          <p><strong>Totale jaarlijkse uitstoot (productie):</strong> {(() => {
                            const visits = Number(data.annualVisits || 0);
                            const AUR = 0.4;
                            const lifetimeYears = 6;
                            const embodiedCO2 = 2500000;
                            const totalVisits = visits * lifetimeYears * AUR;
                            const total = totalVisits ? (embodiedCO2 / totalVisits) * visits : 0;
                            return `${(total / 1000).toFixed(2)} kg CO₂`;
                          })()}</p>
                          <p className="text-xs text-gray-500">
                            Gebaseerd op WebsiteCarbon: 0.8 g CO₂ per pageview.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {data.hostingType === 'local' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serverlocatie
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Voer locatie in"
                    onChange={(e) => onUpdate({ serverLocation: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energieverbruik server (kWh/jaar)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="bijv. 8760"
                    onChange={(e) => onUpdate({ serverEnergy: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Bekijk resultaten
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <InfoButton text="Wanneer een AI-toepassing online wordt aangeboden, bijvoorbeeld via een website of chatbot, kost elk bezoek energie. Deze energie veroorzaakt CO₂-uitstoot. In deze tool kijken we naar twee soorten uitstoot:

- Operationeel: de uitstoot tijdens het draaien van de website.
- Productie: de uitstoot bij het maken van de server waarop de website draait.

Voor het energieverbruik per bezoek gebruiken we het wereldwijde gemiddelde van 0,8 gram CO₂ per pageview. Deze schatting komt van WebsiteCarbon en houdt al rekening met het stroomverbruik van servers en de gemiddelde CO₂-uitstoot van elektriciteit. Daardoor is extra aanpassing niet nodig.

De totale uitstoot per jaar berekenen we door dit gemiddelde te vermenigvuldigen met het aantal bezoeken. Bijvoorbeeld: 100.000 bezoeken per jaar zorgt voor 80 kg CO₂.

Ook houden we rekening met de uitstoot die ontstaat bij het maken van de server. Hiervoor gebruiken we een schatting van 2.500 kg CO₂ per server over 6 jaar, gebaseerd op wetenschappelijk onderzoek (Luccioni et al., 2022). Er wordt aangenomen dat de server gemiddeld 40% van de tijd daadwerkelijk wordt benut (Annual Utilization Rate). Daarmee bepalen we een toerekenbaar deel van de productie-uitstoot per toepassing." />
    </div>
  );
};

export default WebHosting;
