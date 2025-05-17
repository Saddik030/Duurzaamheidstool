import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
import TrainingPhase from './components/TrainingPhase';
import InferencePhase from './components/InferencePhase';
import EndUserDevices from './components/EndUserDevices';
import NetworkUsage from './components/NetworkUsage';
import WebHosting from './components/WebHosting';
import Results from './components/Results';
import { Brain, Cpu, Smartphone, Wifi, Globe, BarChart3 } from 'lucide-react';
import HULogo from './Logos/HU-logo.png';
import HCAIMLogo from './Logos/HCAIM_Logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('training');
  const [formData, setFormData] = useState({
    training: {},
    inference: {},
    devices: {},
    network: {},
    hosting: {}
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 relative">
          <div className="flex justify-between items-center mb-4 gap-2">
            <img src={HCAIMLogo} alt="HCAIM Logo" className="w-20 sm:w-32 md:w-48 h-auto" />
            <img src={HULogo} alt="HU Logo" className="w-20 sm:w-32 md:w-48 h-auto" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-indigo-900 mb-2 text-center break-words">
              Gemeentelijke AI duurzaamheidscalculator
            </h1>
            <p className="text-lg text-gray-600">
              Meet de milieu-impact van uw gemeentelijke generatieve AI-toepassing
            </p>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              <TabsTrigger value="training" currentValue={activeTab} onClick={() => setActiveTab('training')} className="flex flex-col items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>Training</span>
              </TabsTrigger>
              <TabsTrigger value="inference" currentValue={activeTab} onClick={() => setActiveTab('inference')} className="flex flex-col items-center gap-2">
                <Cpu className="h-5 w-5" />
                <span>Inferentie</span>
              </TabsTrigger>
              <TabsTrigger value="devices" currentValue={activeTab} onClick={() => setActiveTab('devices')} className="flex flex-col items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span>Apparaten</span>
              </TabsTrigger>
              <TabsTrigger value="network" currentValue={activeTab} onClick={() => setActiveTab('network')} className="flex flex-col items-center gap-2">
                <Wifi className="h-5 w-5" />
                <span>Netwerk</span>
              </TabsTrigger>
              <TabsTrigger value="hosting" currentValue={activeTab} onClick={() => setActiveTab('hosting')} className="flex flex-col items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Hosting</span>
              </TabsTrigger>
              <TabsTrigger value="results" currentValue={activeTab} onClick={() => setActiveTab('results')} className="flex flex-col items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Resultaten</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="training" currentValue={activeTab}>
              <TrainingPhase 
                data={formData.training} 
                onUpdate={(data) => updateFormData('training', data)}
                onNext={() => setActiveTab('inference')}
              />
            </TabsContent>

            <TabsContent value="inference" currentValue={activeTab}>
              <InferencePhase 
                data={formData.inference}
                onUpdate={(data) => updateFormData('inference', data)}
                onNext={() => setActiveTab('devices')}
              />
            </TabsContent>

            <TabsContent value="devices" currentValue={activeTab}>
              <EndUserDevices 
                data={formData.devices}
                onUpdate={(data) => updateFormData('devices', data)}
                onNext={() => setActiveTab('network')}
              />
            </TabsContent>

            <TabsContent value="network" currentValue={activeTab}>
              <NetworkUsage 
                data={formData.network}
                onUpdate={(data) => updateFormData('network', data)}
                onNext={() => setActiveTab('hosting')}
              />
            </TabsContent>

            <TabsContent value="hosting" currentValue={activeTab}>
              <WebHosting 
                data={formData.hosting}
                onUpdate={(data) => updateFormData('hosting', data)}
                onNext={() => setActiveTab('results')}
              />
            </TabsContent>

            <TabsContent value="results" currentValue={activeTab}>
              <Results formData={formData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default App;