import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import modelData from '../data/Foundation-modellen.json';
import InfoButton from './InfoButton';

interface TrainingPhaseProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const TrainingPhase: React.FC<TrainingPhaseProps> = ({ onUpdate, onNext }) => {
  const [modelType, setModelType] = useState('preloaded');
  const [selectedModel, setSelectedModel] = useState('');
  const [gpuHours, setGpuHours] = useState(0);

  const handleModelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setModelType(type);
    onUpdate({ modelType: type });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    const match = modelData.find(
      (m) => m["LLM Model"].toLowerCase() === model.toLowerCase()
    );
    const emission = match ? parseFloat(match["Totale CO₂-uitstoot (in kg)"]) : 0;

    setSelectedModel(model);
    onUpdate({
      selectedModel: model,
      selectedModelEmission: emission.toString()
    });
  };

  const handleGpuHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value);
    setGpuHours(hours);

    const estimatedEmission = hours * 0.2; // Simplified estimate
    onUpdate({
      gpuHours: hours,
      selectedModelEmission: estimatedEmission.toString()
    });
  };

  const getEmission = () => {
    if (modelType === 'preloaded') {
      const match = modelData.find(
        (m) => m["LLM Model"].toLowerCase() === selectedModel.toLowerCase()
      );
      return match ? parseFloat(match["Totale CO₂-uitstoot (in kg)"]) : 0;
    } else {
      return gpuHours * 0.2;
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Bereken de milieu-impact van het trainen en/of gebruik van je AI-model
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelkeuze
            </label>
            <select
              value={modelType}
              onChange={handleModelTypeChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="preloaded">Foundation model (bijv. GPT-3, LLaMA)</option>
              <option value="finetuned">Fine-tuned model</option>
              <option value="custom">Eigen model (vanaf nul getraind)</option>
            </select>
          </div>

          {modelType === 'preloaded' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer bestaand model
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={handleModelChange}
              >
                <option value="">Selecteer een model</option>
                {modelData.map((model, index) => (
                  <option key={index} value={model["LLM Model"]}>
                    {model["LLM Model"]} ({model["Aantal Parameters (in miljarden)"]}B)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPU-type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => onUpdate({ gpuType: e.target.value })}
                >
                  <option value="v100">NVIDIA V100</option>
                  <option value="a100">NVIDIA A100</option>
                  <option value="h100">NVIDIA H100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPU-uren
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={gpuHours}
                  className="w-full"
                  onChange={handleGpuHoursChange}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 uur</span>
                  <span>1000 uur</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              Geschatte CO₂-uitstoot: {getEmission()} kg CO₂e
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <InfoButton
        text={`De CO₂-uitstoot tijdens de trainingsfase wordt.......`}
      />
    </div>
  );
};

export default TrainingPhase;