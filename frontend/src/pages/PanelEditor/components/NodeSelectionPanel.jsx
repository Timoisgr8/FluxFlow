import React, { useEffect, useState } from "react";
import { useNodeEditorStore } from "../../../_stores/nodeEditor.store";
import { useBuckets, useBucketMetadata } from "../../../_queries/datasources.query";
import { ChevronDown, ChevronRight, Plus, Send, Copy } from "lucide-react";

import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { GoDownload } from "react-icons/go";


export default function NodeSelection() {


  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      select::-ms-expand {
        display: none;
      }
      select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E6E6F2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.5rem center;
        background-size: 1em;
        padding-right: 2rem;
      }
      select option {
        background-color: #1B1C22;
        color: #E6E6F2;
      }
      select option:hover,
      select option:checked {
        background-color: #1b1c22;
        color: white;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const setNodeSelectionPanelEvent = useNodeEditorStore((s) => s.setNodeSelectionPanelEvent);

  // Global time range state (both source + aggregation)
  const setAggregateTimeRange = useNodeEditorStore((s) => s.setAggregateTimeRange);
  const aggregateTimeRange = useNodeEditorStore((s) => s.aggregateTimeRange);

  const setSourceTimeRange = useNodeEditorStore((s) => s.setSourceTimeRange);
  const sourceTimeRange = useNodeEditorStore((s) => s.sourceTimeRange);

  // ensure default values are populated
  useEffect(() => {
    if (!aggregateTimeRange) setAggregateTimeRange("5m");
    if (!sourceTimeRange) setSourceTimeRange("1h");
  }, [aggregateTimeRange, sourceTimeRange, setAggregateTimeRange, setSourceTimeRange]);

  const bucket = "mybucket";
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const { data: metadata, isLoading: metadataLoading } = useBucketMetadata(bucket);

  const [newPresetLabel, setNewPresetLabel] = useState("");

  const AGGREGATION_FUNCTIONS = [
    { id: "count", label: "Count" },
    { id: "mean", label: "Mean" },
    { id: "sum", label: "Sum" },
    { id: "max", label: "Max" },
    { id: "min", label: "Min" },
  ];

  const OTHER_SECTIONS = [
    {
      id: "aggregations",
      label: "Aggregation Nodes",
      types: AGGREGATION_FUNCTIONS,
    },
  ];

  const FILTERS_SECTIONS =
    !metadataLoading && metadata
      ? [
        {
          id: "filters",
          label: "Add Filters",
          subsections: [
            {
              id: "_measurement",
              label: "Measurement Filters",
              items: metadata.tags._measurement || [],
            },
            {
              id: "_field",
              label: "Field Filters",
              items: metadata.tags._field || [],
            },
            {
              id: "tags",
              label: "Tag Filters",
              subsections: Object.entries(metadata.tags)
                .filter(([key]) => !["_field", "_measurement", "_start", "_stop"].includes(key))
                .map(([key, values]) => ({
                  id: key,
                  label: key.charAt(0).toUpperCase() + key.slice(1),
                  items: values,
                })),
            },
          ],
        },
      ]
      : [];

  const [expandedSections, setExpandedSections] = useState({
    filters: false,
    source: false,
    aggregations: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };



  const handleAggregationClick = (functionName) => {
    setNodeSelectionPanelEvent({
      type: "ADD_NODE",
      payload: {
        nodeType: "aggregationNode",
        function: functionName,
      },
    });
  };

  const handleMeasurementSelect = (measurement) => {
    setNodeSelectionPanelEvent({
      type: "ADD_NODE",
      payload: {
        nodeType: "filterNode",
        key: "_measurement",
        value: measurement,
      },
    });
  };

  const handleFieldSelect = (field) => {
    setNodeSelectionPanelEvent({
      type: "ADD_NODE",
      payload: {
        nodeType: "filterNode",
        key: "_field",
        value: field,
      },
    });
  };

  const handleTagSelect = (tagKey, tagValue) => {
    setNodeSelectionPanelEvent({
      type: "ADD_NODE",
      payload: {
        nodeType: "filterNode",
        key: tagKey,
        value: tagValue,
      },
    });
  };

  const [savedPresets, setSavedPresets] = useState(() => {
    return JSON.parse(localStorage.getItem("presets") || "[]");
  });

  // Save preset
  const handlePresetSave = (presetId, presetLabel) => {

    if (!presetLabel || presetLabel.trim() === "") {
      alert("Preset label cannot be empty!");
      return;
    }

    const savedPresets = JSON.parse(localStorage.getItem("presets") || "[]");
    const updatedPresets = [...savedPresets];


    // Check if preset already exists (overwrite)
    const existingIndex = updatedPresets.findIndex(p => p.id === presetId);
    if (existingIndex !== -1) {
      updatedPresets[existingIndex] = {
        id: presetId,
        label: presetLabel,
      };
    } else {
      updatedPresets.push({
        id: presetId,
        label: presetLabel,
      });
    }

    localStorage.setItem("presets", JSON.stringify(updatedPresets));
    setSavedPresets(updatedPresets); // refresh divs
    setNodeSelectionPanelEvent({
      type: "SAVE_PRESET",
      payload: { presetId, presetLabel },
    });
  };

  // Load preset
  const handlePresetAdd = (presetId) => {
    const preset = savedPresets.find(p => p.id === presetId);
    if (!preset) return;
    setNodeSelectionPanelEvent({
      type: "ADD_EXISTING_PRESET",
      payload: { presetId },
    });
  };


  // Delete preset
  const handlePresetDelete = (presetId) => {

    let currentPresets = JSON.parse(localStorage.getItem('presets') || '[]');
    const updatedPresets = currentPresets.filter(p => p.id !== presetId);

    localStorage.setItem("presets", JSON.stringify(updatedPresets));
    setSavedPresets(updatedPresets); // refresh divs

    setNodeSelectionPanelEvent({
      type: "DELETE_PRESET",
      payload: { presetId },
    });
  };

  // Load preset
  const handlePresetLoad = (presetId) => {
    const preset = savedPresets.find(p => p.id === presetId);
    if (!preset) return;
    setNodeSelectionPanelEvent({
      type: "LOAD_PRESET",
      payload: { presetId },
    });
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#12131A",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
      className="scroll-container flex flex-col box-border overflow-hidden transition-all duration-300 bg-[#12131A] "
    >
      <div className="w-full bg-[#12131A] text-white font-sans select-none">
        {/* PRESET SECTION */}
        <div className="border-b border-[#404350] hover:bg-[#1a1c22] transition-colors">
          <div className="flex px-3 py-2 items-center gap-2 cursor-pointer " onClick={() => toggleSection('presets')}>
            {expandedSections['presets'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span className="text-sm font-medium">Preset Collection</span>
          </div>

          {expandedSections['presets'] && (
            <div className="px-3 py-2 space-y-3">
              {/* Input to create a new preset */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Preset label..."
                  value={newPresetLabel}
                  onChange={(e) => setNewPresetLabel(e.target.value)}
                  className="bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9] w-full"
                />
                <button
                  className="flex items-center gap-1 whitespace-nowrap px-2 py-1 h-8 text-sm text-center cursor-pointer text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200"
                  onClick={() => {

                    const newId = Date.now().toString();
                    handlePresetSave(newId, newPresetLabel);
                    setNewPresetLabel("");
                  }}
                  title={"Create New Preset"}
                >
                  New <Plus size={14} />
                </button>
              </div>

              {/* Existing presets */}
              {(() => {
                const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]');
                if (savedPresets.length === 0) return <div className="text-gray-400 text-sm">No presets saved.</div>;

                return savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between bg-[#222531] border border-[#404350] px-3 py-2"
                  >
                    <span className="text-gray-200 text-sm">{preset.label}</span>

                    <div className="flex gap-2">
                      {/* Load preset */}
                      <button
                        className="px-2 py-1 bg-transparent border border-transparent hover:border-[#2d3548] hover:bg-green-600/30 text-[#a8b2c1] hover:text-white transition-color duration-200 cursor-pointer text-xs flex items-center gap-1"
                        onClick={() => handlePresetAdd(preset.id)}
                        title={"Add Preset to Existing Canvas"}
                      >
                        <Plus size={14} />
                      </button>

                      {/* Load preset */}
                      <button
                        className="px-2 py-1 bg-transparent border border-transparent hover:border-[#2d3548] hover:bg-blue-600/30 text-[#a8b2c1] hover:text-white transition-color duration-200 cursor-pointer text-xs flex items-center gap-1"
                        onClick={() => handlePresetLoad(preset.id)}
                        title={"Load Saved Preset"}
                      >
                        <GoDownload size={14} />
                      </button>

                      {/* Delete preset */}
                      <button
                        className="px-2 py-1 bg-transparent border border-transparent hover:border-[#2d3548] hover:bg-red-600/30 text-[#a8b2c1] hover:text-white transition-color duration-200 cursor-pointer text-xs flex items-center gap-1"
                        onClick={() => handlePresetDelete(preset.id, preset.label)}
                        title={"Delete Saved Preset"}
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

        </div>


        {/* SOURCE NODE SECTION */}
        <div className="border-b border-[#404350] hover:bg-[#1a1c22] transition-colors">
          <div className="flex px-3 py-2 items-center gap-2 cursor-pointer " onClick={() => toggleSection('source')}>
            {expandedSections['presets'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span className="text-sm font-medium">Source Node</span>
          </div>

          {expandedSections["source"] && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-gray-400">Bucket</label>
                <input
                  type="text"
                  value={bucket}
                  readOnly
                  className="w-full bg-[#1B1C22] text-[#E6E6F2]/30 placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:border-[#5C6BE9] cursor-not-allowed"
                />
              </div>

              {/* Time Range Selector */}
              <div>
                <label className="text-xs text-gray-400">Time Range</label>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={sourceTimeRange}
                    onChange={(e) => setSourceTimeRange(e.target.value)}
                    className="scroll-container bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9] cursor-pointer w-full"
                  >
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="3h">3 hours</option>
                    <option value="6h">6 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                  </select>


                </div>
              </div>
            </div>
          )}
        </div>

        {/* AGGREGATION NODES SECTION */}
        {OTHER_SECTIONS.map((section) => (
          <div key={section.id} className="border-b border-[#404350] hover:bg-[#1a1c22] transition-colors">
            <div
              className="flex px-3 py-2 items-center gap-2 cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                {expandedSections[section.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="text-sm font-medium">{section.label}</span>
              </div>
            </div>

            {expandedSections[section.id] && (
              <div className="px-3 pb-2 space-y-2">
                <div className="flex flex-col gap-1 mb-2 mt-1">
                  <label className="text-xs text-gray-400">Aggregation Time Range</label>
                  <select
                    value={aggregateTimeRange}
                    onChange={(e) => setAggregateTimeRange(e.target.value)}
                    className="scroll-container bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9] cursor-pointer w-full"
                  >
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="6h">6 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="24h">24 hours</option>
                  </select>
                </div>

                {section.types.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between bg-[#222531] border border-[#404350] px-3 py-2"
                  >
                    <span className="text-sm text-gray-200">{type.label}</span>
                    <button
                      className="px-2 py-1 cursor-pointer text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#2d3548] hover:text-white hover:border-[#2d3548] transition-colors duration-200 text-xs flex items-center gap-1"
                      onClick={() => handleAggregationClick(type.id)}
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {/* FILTER NODES SECTION */}
        {FILTERS_SECTIONS.map(section => (
          <div key={section.id} className="border-b border-gray-700">
            <div
              className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1c22] cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                {expandedSections[section.id] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="text-sm font-medium">{section.label}</span>
              </div>
            </div>

            {expandedSections[section.id] && (
              <div className="pl-2">
                {section.subsections.map(subsection => (
                  <div key={subsection.id}>
                    <div
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1c22] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(subsection.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {expandedSections[subsection.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <span className="text-sm text-gray-300">{subsection.label}</span>
                      </div>
                    </div>

                    {/* Handle nested subsections (for Tag Filters) */}
                    {expandedSections[subsection.id] && subsection.subsections && (
                      <div className="ml-4">
                        {subsection.subsections.map(nestedSub => (
                          <div key={nestedSub.id}>
                            <div
                              className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1c22] cursor-pointer mb-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(nestedSub.id);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {expandedSections[nestedSub.id] ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                                <span className="text-sm text-gray-400">{nestedSub.label}</span>
                              </div>
                            </div>

                            {expandedSections[nestedSub.id] && nestedSub.items && (
                              <div className="ml-4 pb-2 px-3">
                                <select
                                  className="scroll-container bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9] cursor-pointer w-full"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleTagSelect(nestedSub.id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select {nestedSub.label}</option>
                                  {nestedSub.items.map(item => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Handle direct items (for Measurement/Field Filters) */}
                    {expandedSections[subsection.id] && subsection.items && !subsection.subsections && (
                      <div className="ml-4 pb-2 px-3">
                        <select
                          className="scroll-container bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9] cursor-pointer w-full"
                          onChange={(e) => {
                            if (e.target.value) {
                              if (subsection.id === '_measurement') {
                                handleMeasurementSelect(e.target.value);
                              } else if (subsection.id === '_field') {
                                handleFieldSelect(e.target.value);
                              } else {
                                handleTagSelect(subsection.id, e.target.value);
                              }
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select {subsection.label}</option>
                          {subsection.items.map(item => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        { }

      </div>
    </div>
  );
}