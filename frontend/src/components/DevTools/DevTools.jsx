import { useState } from "react";
import { createNewDashboard, updateDashboard } from "../../_api/grafana";

export default function DevTools() {
  if (process.env.NODE_ENV !== "development") return null; // only in dev

  const [open, setOpen] = useState(false);

  const resetTour = (key) => {
    localStorage.removeItem(key);
    window.location.reload();
  };

  const resetAllTours = () => {
    localStorage.removeItem("loginTourCompleted");
    localStorage.removeItem("dashboardTourCompleted");
    localStorage.removeItem("panelTourCompleted");
    window.location.reload();
  };

  const logAndCreateNewDashboard = async () => {
    try {
      const result = await createNewDashboard();
      console.log("Dashboard created:", result);
      alert("Dashboard created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create dashboard");
    }
  };

  const updateDashboardTest = async () => {
    try {
      // Hardcoded test body
      const folderUid = "a243bc38-0d29-4b69-bca7-86070c93a96f";
      const dashboard = {
        "annotations": {
          "list": [
            {
              "builtIn": 1,
              "datasource": {
                "type": "grafana",
                "uid": "-- Grafana --"
              },
              "enable": true,
              "hide": true,
              "iconColor": "rgba(0, 211, 255, 1)",
              "name": "Annotations & Alerts",
              "type": "dashboard"
            }
          ]
        },
        "editable": true,
        "fiscalYearStartMonth": 0,
        "graphTooltip": 0,
        "id": 2,
        "links": [],
        "liveNow": false,
        "panels": [
          {
            "fieldConfig": {
              "defaults": {
                "color": {
                  "mode": "palette-classic"
                },
                "custom": {
                  "axisCenteredZero": false,
                  "axisColorMode": "text",
                  "axisLabel": "",
                  "axisPlacement": "auto",
                  "barAlignment": 0,
                  "drawStyle": "line",
                  "fillOpacity": 0,
                  "gradientMode": "none",
                  "hideFrom": {
                    "legend": false,
                    "tooltip": false,
                    "viz": false
                  },
                  "lineInterpolation": "linear",
                  "lineWidth": 1,
                  "pointSize": 5,
                  "scaleDistribution": {
                    "type": "linear"
                  },
                  "showPoints": "auto",
                  "spanNulls": false,
                  "stacking": {
                    "group": "A",
                    "mode": "none"
                  },
                  "thresholdsStyle": {
                    "mode": "off"
                  }
                },
                "mappings": [],
                "thresholds": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green"
                    },
                    {
                      "color": "red",
                      "value": 80
                    }
                  ]
                }
              },
              "overrides": []
            },
            "gridPos": {
              "h": 8,
              "w": 12,
              "x": 0,
              "y": 0
            },
            "id": 4,
            "options": {
              "legend": {
                "calcs": [],
                "displayMode": "list",
                "placement": "bottom",
                "showLegend": true
              },
              "tooltip": {
                "mode": "single",
                "sort": "none"
              }
            },
            "targets": [
              {
                "query": "123",
                "refId": "A"
              }
            ],
            "title": "Panel Title",
            "type": "timeseries"
          },
          {
            "datasource": {
              "type": "influxdb",
              "uid": "P951FEA4DE68E13C5"
            },
            "fieldConfig": {
              "defaults": {
                "color": {
                  "mode": "palette-classic"
                },
                "custom": {
                  "axisCenteredZero": false,
                  "axisColorMode": "text",
                  "axisLabel": "",
                  "axisPlacement": "auto",
                  "barAlignment": 0,
                  "drawStyle": "line",
                  "fillOpacity": 0,
                  "gradientMode": "none",
                  "hideFrom": {
                    "legend": false,
                    "tooltip": false,
                    "viz": false
                  },
                  "lineInterpolation": "linear",
                  "lineWidth": 1,
                  "pointSize": 5,
                  "scaleDistribution": {
                    "type": "linear"
                  },
                  "showPoints": "auto",
                  "spanNulls": false,
                  "stacking": {
                    "group": "A",
                    "mode": "none"
                  },
                  "thresholdsStyle": {
                    "mode": "off"
                  }
                },
                "mappings": [],
                "thresholds": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green"
                    },
                    {
                      "color": "red",
                      "value": 80
                    }
                  ]
                }
              },
              "overrides": []
            },
            "gridPos": {
              "h": 16,
              "w": 12,
              "x": 12,
              "y": 0
            },
            "id": 1,
            "options": {
              "legend": {
                "calcs": [],
                "displayMode": "list",
                "placement": "bottom",
                "showLegend": true
              },
              "tooltip": {
                "mode": "single",
                "sort": "none"
              }
            },
            "targets": [
              {
                "datasource": {
                  "type": "influxdb",
                  "uid": "P951FEA4DE68E13C5"
                },
                "query": "from(bucket: \"mybucket\")\r\n  |> range(start: -1h)\r\n  |> filter(fn: (r) => r._measurement == \"cpu\" and r._field == \"usage_user\")\r\n  |> group(columns: [\"cpu\"])\r\n  |> aggregateWindow(every: 1m, fn: mean)\r\n  |> yield(name: \"cpu_usage_per_core\")",
                "refId": "A"
              }
            ],
            "title": "Panel Title",
            "type": "timeseries"
          },
          {
            "datasource": {
              "type": "influxdb",
              "uid": "P951FEA4DE68E13C5"
            },
            "fieldConfig": {
              "defaults": {
                "color": {
                  "mode": "palette-classic"
                },
                "custom": {
                  "axisCenteredZero": false,
                  "axisColorMode": "text",
                  "axisLabel": "",
                  "axisPlacement": "auto",
                  "barAlignment": 0,
                  "drawStyle": "line",
                  "fillOpacity": 0,
                  "gradientMode": "none",
                  "hideFrom": {
                    "legend": false,
                    "tooltip": false,
                    "viz": false
                  },
                  "lineInterpolation": "linear",
                  "lineWidth": 1,
                  "pointSize": 5,
                  "scaleDistribution": {
                    "type": "linear"
                  },
                  "showPoints": "auto",
                  "spanNulls": false,
                  "stacking": {
                    "group": "A",
                    "mode": "none"
                  },
                  "thresholdsStyle": {
                    "mode": "off"
                  }
                },
                "mappings": [],
                "thresholds": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green"
                    },
                    {
                      "color": "red",
                      "value": 80
                    }
                  ]
                }
              },
              "overrides": []
            },
            "gridPos": {
              "h": 8,
              "w": 12,
              "x": 0,
              "y": 8
            },
            "id": 2,
            "options": {
              "legend": {
                "calcs": [],
                "displayMode": "list",
                "placement": "bottom",
                "showLegend": true
              },
              "tooltip": {
                "mode": "single",
                "sort": "none"
              }
            },
            "targets": [
              {
                "datasource": {
                  "type": "influxdb",
                  "uid": "P951FEA4DE68E13C5"
                },
                "query": "from(bucket: \"mybucket\")\r\n  |> range(start: -1h)\r\n  |> filter(fn: (r) => r._measurement == \"cpu\")\r\n  |> filter(fn: (r) => r._field == \"usage_user\" or r._field == \"usage_system\")\r\n  |> filter(fn: (r) => r.cpu == \"cpu-total\")\r\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)\r\n  |> yield(name: \"cpu_usage\")",
                "refId": "A"
              }
            ],
            "title": "Panel Title",
            "type": "timeseries"
          }
        ],
        "refresh": "5s",
        "schemaVersion": 38,
        "style": "dark",
        "tags": [],
        "templating": {
          "list": []
        },
        "time": {
          "from": "now-6h",
          "to": "now"
        },
        "timepicker": {},
        "timezone": "",
        "title": "New dashboard",
        "uid": "d8459f5d-0152-4ae5-8ec5-864fac165699",
        "version": 13,
        "weekStart": ""
      }

      const result = await updateDashboard(folderUid, dashboard);
      console.log("Dashboard updated:", result);
      alert("Dashboard updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update dashboard: " + err.message);
    }
  };

  return (
    <div className="fixed top-2 right-2 z-[9999] flex flex-col items-end">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-zinc-800 text-white p-2 rounded-full shadow-md hover:bg-zinc-700"
      >
        ⚙️
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 bg-zinc-900 text-white p-4 rounded-lg shadow-lg w-64 absolute top-10 right-0">
          <h3 className="text-lg font-bold mb-2">Dev Tools</h3>
          <button
            onClick={() => resetTour("loginTourCompleted")}
            className="block w-full bg-zinc-700 hover:bg-zinc-600 text-sm py-1 px-2 rounded mb-2"
          >
            Reset Login Tour
          </button>
          <button
            onClick={() => resetTour("dashboardTourCompleted")}
            className="block w-full bg-zinc-700 hover:bg-zinc-600 text-sm py-1 px-2 rounded mb-2"
          >
            Reset Dashboard Tour
          </button>
          <button
            onClick={() => resetTour("panelTourCompleted")}
            className="block w-full bg-zinc-700 hover:bg-zinc-600 text-sm py-1 px-2 rounded mb-2"
          >
            Reset Panel Tour
          </button>

          <button
            onClick={resetAllTours}
            className="block w-full bg-red-600 hover:bg-red-500 text-sm py-1 px-2 rounded mb-10"
          >
            Reset All Tours
          </button>



          <button
            onClick={() => logAndCreateNewDashboard()}
            className="block w-full bg-zinc-700 hover:bg-zinc-600 text-sm py-1 px-2 rounded mb-2"
          >
            sda
          </button>



          <button
            onClick={() => updateDashboardTest()}
            className="block w-full bg-zinc-700 hover:bg-zinc-600 text-sm py-1 px-2 rounded mb-2"
          >
            Test update dashboard (hardcoded for Tim)
          </button>


        </div>
      )}
    </div>
  );
}