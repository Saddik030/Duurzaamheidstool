import React from 'react';

interface ExplanationProps {
  formData: any;
  results: any;
}

const deviceInfo: any = {
  smartphone: { power: 1, embeddedCO2: 86.6, lifetime: 3 },
  laptop: { power: 75, embeddedCO2: 522.6, lifetime: 4 },
  desktop: { power: 175, embeddedCO2: 1273.4, lifetime: 5 },
  tablet: { power: 7.5, embeddedCO2: 110.1, lifetime: 4 },
};

const Uitleg: React.FC<ExplanationProps> = ({ formData, results }) => {
  const { training, inference, devices, network, hosting } = formData;
  const { total, breakdown } = results;

  const infPerYear = parseFloat(inference?.inferencesPerYear || 0);
  const dataAmount = parseFloat(network?.dataAmount || 0);
  const dataUnit = network?.dataUnit || 'MB';
  const gbData = dataUnit === 'GB' ? dataAmount : dataAmount / 1000;
  const netEnergy = gbData * 0.27 * infPerYear;
  const visits = parseFloat(hosting?.annualVisits || 0);
  const lifetimeVisits = visits * 6;
  const serverProdCO2 =
    hosting?.isOnline && hosting?.hostingType === 'cloud'
      ? ((2500000 / lifetimeVisits) * visits) / 1000
      : 0;

  const deviceDetails = devices?.devices
    ? Object.entries(devices.devices)
        .map(([type, d]: any) => {
          const count = parseFloat(d?.count || 0);
          const duration = parseFloat(d?.duration || 0);
          const info = deviceInfo[type];
          if (!info) return null;
          const hours = duration / 60;
          const embedded = ((info.embeddedCO2 / info.lifetime) * (duration / (8 * 60))) * count;
          const operational = (count * info.power * hours * 268) / 1000;
          return `${count} ${type}(s) werden gemiddeld ${duration} minuten per sessie gebruikt, wat leidde tot ~${Math.round(
            operational
          )} kg CO₂ voor operationeel gebruik en ~${Math.round(embedded)} kg CO₂ aan productie-uitstoot.`;
        })
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <h3 className="text-lg font-medium">Toelichting bij de berekende CO₂-uitstoot</h3>
      <p className="text-sm text-gray-700">
        Voor deze toepassing is de totale CO₂-uitstoot geschat op <strong>~{Math.round(total.co2)} kg CO₂e</strong>, gebaseerd op vijf verschillende fasen.
        Tijdens de <strong>trainingsfase</strong> is gekozen voor het model "{training.selectedModel}", waarvan geschat is dat de training
        een uitstoot veroorzaakte van ~{Math.round(training.selectedModelEmission)} kg CO₂e.
        Voor <strong>inferentie</strong> werd rekening gehouden met ~{infPerYear} jaarlijkse modeluitvoeringen,
        goed voor ~{Math.round(inference.totalCO2)} kg CO₂e aan operationeel energieverbruik, plus  
         ~{Math.round(inference.embeddedServerCO2)} kg CO₂e aan productie-uitstoot van de gebruikte serverhardware.
        Samen komt dit neer op ~{Math.round(breakdown.inference.co2)} kg CO₂e in deze fase.
      </p>
      <p className="text-sm text-gray-700">
        Bij de <strong>gebruikte apparaten</strong> werd het volgende opgegeven: {deviceDetails}
        Samen leidt dit tot een totale uitstoot van ~{Math.round(breakdown.devices.co2)} kg CO₂e.
      </p>
      <p className="text-sm text-gray-700">
        Voor de <strong>netwerkfase</strong> werd gerekend met ~{dataAmount} {dataUnit} aan dataverkeer per inferentie.
        Dat komt neer op ~{gbData.toFixed(2)} GB over een jaar, wat ongeveer ~{Math.round(netEnergy)} kWh aan energie verbruikt.
        Omgerekend naar uitstoot is dit ~{Math.round(breakdown.network.co2)} kg CO₂e.
      </p>
      <p className="text-sm text-gray-700">
        Wat betreft <strong>hosting</strong> werd opgegeven dat het model jaarlijks ~{visits} keer benaderd wordt.
        Op basis van het wereldwijde gemiddelde van 0,8 gram CO₂ per pageview betekent dit ~{Math.round((visits * 0.8) / 1000)} kg CO₂e aan operationele uitstoot.
        De productie van de server zelf draagt hier ~{Math.round(serverProdCO2)} kg CO₂e aan bij.
        De totale uitstoot voor hosting komt hiermee op ~{Math.round(breakdown.hosting.co2)} kg CO₂e.
      </p>
      <p className="text-sm text-gray-700">
        Samenvattend komt de totale geschatte klimaatimpact van deze toepassing jaarlijks uit op <strong>~{Math.round(total.co2)} kg CO₂e</strong>.
        En een gemiddelde van <strong>{(results.total.co2 / infPerYear).toFixed(2)}</strong> kg CO₂e per inferentie.
      </p>
    </div>
  );
};

export default Uitleg;
