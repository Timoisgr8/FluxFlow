const axios = require('axios');

// For Unique Dashboarad Title
const { v4: uuidv4 } = require("uuid");

const GRAFANA_URL = 'http://grafana:3000'; 

// Any routes that communicate with the Grafana API sohuld be inside the grafanaController


// Ping Grafana health endpoint
const pingGrafana = async (req, res) => {
	try {
		const response = await axios.get(`${GRAFANA_URL}/api/health`);
		res.json({ status: response.data });
	} catch (error) {
		res.status(500).json({ error: 'Grafana ping failed', details: error.message });
	}
};

// Login to Grafana and store cookie in session
const loginGrafana = async (req, res) => {
	const { username, password } = req.body;
	console.log('Login attempt:', username);
	try {
		const grafanaRes = await axios.post(`${GRAFANA_URL}/login`, { user: username, password }, {
			headers: { 'Content-Type': 'application/json' },
			withCredentials: true,
			validateStatus: () => true
		});

		console.log('Grafana login status:', grafanaRes.status);
		console.log('Response data:', grafanaRes.data);

		if (grafanaRes.status !== 200) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const setCookie = grafanaRes.headers['set-cookie'];
		if (!setCookie) {
			return res.status(500).json({ error: 'No session cookie received from Grafana' });
		}

		req.session.grafanaCookie = setCookie.join('; ');
		req.session.username = username;

		res.json({ message: 'Logged in to Grafana successfully' });
	} catch (error) {
		console.error('Grafana login failed:', error);
		res.status(500).json({ error: 'Grafana login failed', details: error.message });
	}
};

const logoutGrafana = (req, res) => {
	req.session.destroy(err => {
		if (err) {
			return res.status(500).json({ error: 'Logout failed' });
		}
		// Optionally clear cookie on client by setting a Set-Cookie header:
		res.clearCookie('connect.sid'); // default cookie name for express-session
		res.json({ message: 'Logged out successfully' });
	});
};

const checkSession = (req, res) => {
	if (req.session && req.session.grafanaCookie && req.session.username) {
		// Session exists, user is logged in
		res.json({ loggedIn: true, username: req.session.username });
	} else {
		// No session, user not logged in
		res.status(401).json({ loggedIn: false, error: 'Not authenticated' });
	}
};


const getUserDataGrafana = async (req, res) => {
	try {
		const grafanaCookie = req.session?.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'User not authenticated with Grafana' });
		}

		// Forward the request to Grafana API to get current user info
		const response = await axios.get(`${GRAFANA_URL}/api/user`, {
			headers: { Cookie: grafanaCookie },
		});

		res.json(response.data);
	} catch (error) {
		console.error('Error fetching Grafana user data:', error.message);

		if (error.response) {
			const status = error.response.status;
			if (status === 401) {
				return res.status(401).json({ error: 'Invalid or expired Grafana session' });
			}
			if (status === 403) {
				return res.status(403).json({ error: 'Access to Grafana user info forbidden' });
			}
		}

		res.status(500).json({ error: 'Failed to fetch user data from Grafana' });
	}
};

const getUserFoldersGrafana = async (req, res) => {
	try {
		// Extract Grafana session cookie or API token from your session
		// Adjust depending on your auth method
		const grafanaCookie = req.session.grafanaCookie;  // e.g. "grafana_sess=abcdefg..."

		if (!grafanaCookie) {
			return res.status(401).json({ error: 'User not authenticated with Grafana' });
		}

		// Make request to Grafana's folders API
		const response = await axios.get(`${GRAFANA_URL}/api/folders`, {
			headers: {
				Cookie: grafanaCookie,
			},
		});

		// Send Grafana's response data back to client
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching Grafana folders:', error.message);
		res.status(500).json({ error: 'Failed to fetch folders from Grafana' });
	}
};

const getUserDashboardsGrafana = async (req, res) => {
	try {
		const folderUid = req.query.folderUid;

		if (!folderUid) {
			return res.status(400).json({ error: 'folderUid query parameter is required' });
		}

		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'User not authenticated with Grafana' });
		}

		// 1. Get folder info to find folder ID
		const folderResp = await axios.get(`${GRAFANA_URL}/api/folders/${folderUid}`, {
			headers: { Cookie: grafanaCookie }
		});
		const folderId = folderResp.data.id;

		// 2. Search dashboards in this folder
		const searchResp = await axios.get(`${GRAFANA_URL}/api/search`, {
			headers: { Cookie: grafanaCookie },
			params: {
				folderIds: folderId,
				type: 'dash-db'
			}
		});

		res.json(searchResp.data);
	} catch (error) {
		console.error('Error fetching dashboards:', error.message);

		// If folder not found, handle gracefully
		if (error.response && error.response.status === 404) {
			return res.status(404).json({ error: 'Folder not found' });
		}

		res.status(500).json({ error: 'Failed to fetch dashboards from Grafana' });
	}
};



const getDashboardJsonGrafana = async (req, res) => {
	try {
		const { uid } = req.params;

		if (!uid) {
			return res.status(400).json({ error: 'Dashboard UID is required' });
		}

		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'User not authenticated with Grafana' });
		}

		// Forward the request to Grafana API for the dashboard JSON by UID
		const response = await axios.get(`${GRAFANA_URL}/api/dashboards/uid/${encodeURIComponent(uid)}`, {
			headers: { Cookie: grafanaCookie }
		});

		res.json(response.data);
	} catch (error) {
		console.error('Error fetching dashboard JSON:', error.message);

		if (error.response && error.response.status === 404) {
			return res.status(404).json({ error: 'Dashboard not found' });
		}

		res.status(500).json({ error: 'Failed to fetch dashboard JSON from Grafana' });
	}
};

// Querying InfluxDB via Grafana

// Helper to run Flux query via Grafana proxy API
async function runFluxQuery(cookie, influxDS, fluxQuery) {
	const response = await axios.post(
		`${GRAFANA_URL}/api/ds/query`,
		{
			queries: [{
				refId: 'A',
				datasource: { type: influxDS.type, uid: influxDS.uid },
				query: fluxQuery,
				resultFormat: 'table'
			}]
		},
		{ headers: { Cookie: cookie } }
	);

	// Extract values from the first column of all frames (if any)
	const frames = response.data.results?.A?.frames || [];
	const values = [];
	for (const frame of frames) {
		if (frame.data && frame.data.values && frame.data.values.length > 0) {
			values.push(...frame.data.values[0]);
		}
	}
	return values;
}

// Helper to get the InfluxDB datasource from Grafana
async function getInfluxDatasource(cookie) {
	const dsResp = await axios.get(`${GRAFANA_URL}/api/datasources`, {
		headers: { Cookie: cookie }
	});
	const influxDS = dsResp.data.find(ds => ds.type === 'influxdb');
	if (!influxDS) {
		throw new Error('No InfluxDB datasource found in Grafana');
	}
	return influxDS;
}

// ---- New lazy-load metadata routes ----

// 1. Get all bucket names
const getInfluxBuckets = async (req, res) => {
	try {
		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		// Get datasource
		const influxDS = await getInfluxDatasource(grafanaCookie);

		// Flux query to list bucket names
		const fluxQuery = `
      buckets()
      |> keep(columns: ["name"])
    `;

		const buckets = await runFluxQuery(grafanaCookie, influxDS, fluxQuery);

		res.json(buckets);
	} catch (error) {
		console.error(
			'Error fetching buckets via Flux:',
			error.response?.data || error.message
		);
		res.status(error.response?.status || 500).json({
			error: error.response?.data || error.message
		});
	}
}

const getBucketMetadata = async (req, res) => {
	try {
		const bucket = req.query.bucket;
		if (!bucket) {
			return res.status(400).json({ error: 'bucket query parameter is required' });
		}

		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		const influxDS = await getInfluxDatasource(grafanaCookie);

		// Fetch all measurements
		const measurementsQuery = `
      import "influxdata/influxdb/schema"
      schema.measurements(bucket: "${bucket}")
    `;
		const measurements = await runFluxQuery(grafanaCookie, influxDS, measurementsQuery);

		// Fetch all fields
		const fieldsQuery = `
      import "influxdata/influxdb/schema"
      schema.fieldKeys(bucket: "${bucket}")
    `;
		const fields = await runFluxQuery(grafanaCookie, influxDS, fieldsQuery);

		// Fetch all tag keys
		const tagKeysQuery = `
      import "influxdata/influxdb/schema"
      schema.tagKeys(bucket: "${bucket}")
    `;
		const tagKeys = await runFluxQuery(grafanaCookie, influxDS, tagKeysQuery);

		// Fetch tag values concurrently
		const tagValuesResults = await Promise.all(
			tagKeys.map(tag => {
				const q = `
          import "influxdata/influxdb/schema"
          schema.tagValues(bucket: "${bucket}", tag: "${tag}")
        `;
				return runFluxQuery(grafanaCookie, influxDS, q).then(values => ({ tag, values }));
			})
		);

		const tags = {};
		tagValuesResults.forEach(r => {
			tags[r.tag] = r.values;
		});

		res.json({
			bucket,
			tags
		});
	} catch (err) {
		console.error(`Error fetching metadata for bucket "${req.query.bucket}":`, err.message);
		res.status(500).json({ error: err.message });
	}
};

// update dashboard route , that can be connected to grafana.js front end file
// POST http://grafana:3000/api/dashboards/db
// Updates an existing flux query of a panel provided folderUid, dashboardUid, panelID and newQuery
async function proxyPanelUpdate(req, res) {
	try {
		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		const { folderUid, dashboardUid, panelId, newQuery } = req.body;
		if (!folderUid || !dashboardUid || !panelId || !newQuery) {
			return res.status(400).json({ error: 'Missing required parameters' });
		}

		const dashRes = await axios.get(
			`${GRAFANA_URL}/api/dashboards/uid/${encodeURIComponent(dashboardUid)}`,
			{ headers: { Cookie: grafanaCookie } }
		);

		const dashboard = dashRes.data.dashboard;

		const panel = dashboard.panels.find(p => p.id === panelId);
		if (!panel) {
			return res.status(404).json({ error: `Panel ${panelId} not found` });
		}

		if (panel.targets && panel.targets.length > 0) {
			panel.targets[0].query = newQuery;
		} else {
			return res.status(400).json({ error: 'Panel has no targets to update' });
		}

		const payload = {
			dashboard,
			folderUid,
			overwrite: true
		};

		const updateRes = await axios.post(
			`${GRAFANA_URL}/api/dashboards/db`,
			payload,
			{
				headers: {
					'Content-Type': 'application/json',
					Cookie: grafanaCookie
				}
			}
		);

		res.status(updateRes.status).json(updateRes.data);

	} catch (err) {
		console.error(
			'Error proxying dashboard update:',
			err.response?.data || err.message
		);
		res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
	}
}

// Updates an existing dashboard
async function proxyDashboardUpdate(req, res) {
	try {
		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		// The frontend should POST the full Grafana payload
		const { dashboard, folderUid } = req.body;

		if (!dashboard || !folderUid) {
			return res.status(400).json({ error: 'Missing required parameters' });
		}

		const payload = {
			dashboard,
			folderUid,
			overwrite: true
		};

		const updateRes = await axios.post(
			`${GRAFANA_URL}/api/dashboards/db`,
			payload,
			{
				headers: {
					'Content-Type': 'application/json',
					Cookie: grafanaCookie
				}
			}
		);

		res.status(updateRes.status).json(updateRes.data);

	} catch (err) {
		console.error(
			'Error proxying dashboard update:',
			err.response?.data || err.message
		);
		res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
	}
}


//HARD CODED TEST FUNCTION
//usage in frontend\src\api\grafana.js
// export async function createNewDashboard() {
//   // POST request to backend route
//   const res = await fetch('/grafana/dashboard/create', {
//     method: 'POST',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//   });


//   if (!res.ok) {
//     const { error } = await res.json().catch(() => ({}));
//     throw new Error(error || 'Failed to create dashboard.');
//   }

//   const data = await res.json();
//   console.log('Dashboard create result:', data);
//   return data;
// }
// Creates a new dashboard

async function proxyDashboardCreate(req, res) {
	try {
		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		const {
			dashboard: incomingDash,
			overwrite,
			folderUid,
			folderId,
			message
		} = req.body || {};

		if (!incomingDash) {
			return res.status(400).json({ error: 'Missing dashboard payload' });
		}

		// Minimal defaults (only if client forgot something)
		const dashboard = {
			schemaVersion: 39,
			timezone: 'browser',
			title: 'New Dashboard',
			panels: [],
			...incomingDash,
		};

		// Choose ONE folder reference: prefer UID, else ID (fallback to General=0)
		const folderRef = folderUid
			? { folderUid }
			: { folderId: Number.isInteger(folderId) ? folderId : 0 };

		const body = {
			dashboard,
			overwrite: Boolean(overwrite),
			...(message ? { message } : {}),
			...folderRef,
		};

		const createRes = await axios.post(
			`${GRAFANA_URL}/api/dashboards/db`,
			body,
			{
				headers: {
					'Content-Type': 'application/json',
					Cookie: grafanaCookie,
				},
			}
		);

		res.status(createRes.status).json(createRes.data);

	} catch (err) {
		console.error(
			'Error proxying dashboard creation:',
			err.response?.data || err.message
		);
		res
			.status(err.response?.status || 500)
			.json(err.response?.data || { error: err.message });
	}
}

async function proxyDashboardDelete(req, res) {
	try {
		const grafanaCookie = req.session.grafanaCookie;
		if (!grafanaCookie) {
			return res.status(401).json({ error: 'Not authenticated with Grafana' });
		}

		const { uid } = req.params;
		if (!uid) {
			return res.status(400).json({ error: 'Missing dashboard UID' });
		}

		const deleteRes = await axios.delete(
			`${GRAFANA_URL}/api/dashboards/uid/${uid}`,
			{
				headers: {
					'Content-Type': 'application/json',
					Cookie: grafanaCookie,
				},
			}
		);

		res.status(deleteRes.status).json(deleteRes.data);

	} catch (err) {
		console.error(
			'Error proxying dashboard deletion:',
			err.response?.data || err.message
		);
		res
			.status(err.response?.status || 500)
			.json(err.response?.data || { error: err.message });
	}
}

const createDashboardGrafana = async (req, res) => {
	const grafanaCookie = req.session.grafanaCookie;
	if (!grafanaCookie) {
	  return res.status(401).json({ error: "User not authenticated with Grafana" });
	}

	const { title, folderUid, panels } = req.body;
	const baseTitle = title || "New Dashboard";

	try {
	  // Get folderUid
	  let folderId = null;
	  if (folderUid) {
		const folderResp = await axios.get(`${GRAFANA_URL}/api/folders/${folderUid}`, {
		  headers: { Cookie: grafanaCookie }
		});
		folderId = folderResp.data.id;
	  }

	  // Check if a dashboard with same title exists in this folder
	  const searchResp = await axios.get(`${GRAFANA_URL}/api/search`, {
		headers: { Cookie: grafanaCookie },
		params: {
		  query: baseTitle,
		  folderIds: folderId ? [folderId] : undefined,
		  type: "dash-db"
		}
	  });

	  let finalTitle = baseTitle;
	  if (searchResp.data && searchResp.data.length > 0) {
		// Dashboard already exists → make it unique
		finalTitle = `${baseTitle} - ${uuidv4().slice(0, 8)}`;
		console.log(`Adjusted dashboard title to: ${finalTitle}`);
	  }

	  // Create payload
	  const payload = {
		dashboard: {
		  id: null,
		  uid: null,
		  title: finalTitle,
		  schemaVersion: 36,
		  version: 0,
		  panels: panels || []
		},
		folderUid: folderUid || null,
		overwrite: false
	  };

	  // 4. Send request to Grafana
	  const resp = await axios.post(`${GRAFANA_URL}/api/dashboards/db`, payload, {
		headers: { Cookie: grafanaCookie }
	  });

	  res.json(resp.data);
	} catch (err) {
	  console.error("Create dashboard failed:", err.response?.data || err.message);
	  res.status(500).json({ error: "Failed to create dashboard" });
	}
  };


  // Create a new panel in an existing dashboard given the dashboardid and folderid
  /*
  Example Input :- 
{
  "dashboardUid": "c1797330-9690-487e-9c3c-e3d18ec74cde",
  "folderUid": "a2ff1b86-8aab-450a-8cc6-78bb1de92470",
  "panelTitle": "Panel title"
}
 Example Output :- 
 {
    "id": 10,
    "slug": "long-time-no-see",
    "status": "success",
    "uid": "c1797330-9690-487e-9c3c-e3d18ec74cde",
    "url": "/d/c1797330-9690-487e-9c3c-e3d18ec74cde/long-time-no-see",
    "version": 4
}
  */
  const createPanelInDashboard = async (req, res) => {
	try {
	  const { dashboardUid, folderUid, panelTitle } = req.body;
	  const grafanaCookie = req.session.grafanaCookie;
	  if (!grafanaCookie) {
		return res.status(401).json({ error: "User not authenticated with Grafana" });
	  }

	  // Fetch dashboard JSON
	  const dashResp = await axios.get(`${GRAFANA_URL}/api/dashboards/uid/${dashboardUid}`, {
		headers: { Cookie: grafanaCookie }
	  });
	  const dashboard = dashResp.data.dashboard;

	  // Generate a unique panel id
	  const maxPanelId = dashboard.panels.reduce((maxId, panel) => Math.max(maxId, panel.id), 0);
	  const newPanelId = maxPanelId + 1;

	  // Create new panel
	  const newPanel = {
		id: newPanelId,
		type: "graph",
		title: panelTitle || "New Panel",
		gridPos: { h: 8, w: 12, x: 0, y: dashboard.panels.length * 8 },
		targets: []
	  };

	  // Append panel and update dashboard version
	  dashboard.panels.push(newPanel);
	  dashboard.version = dashResp.data.version + 1;

	  // Post updated dashboard with folderUid and overwrite
	  const saveResp = await axios.post(
		`${GRAFANA_URL}/api/dashboards/db`,
		{
		  dashboard,
		  folderUid,
		  overwrite: true
		},
		{
		  headers: {
			Cookie: grafanaCookie,
			"Content-Type": "application/json"
		  }
		}
	  );

	  res.json(saveResp.data);
	} catch (error) {
	  console.error("Create panel failed:", error.response?.data || error.message);
	  res.status(500).json({ error: "Failed to create panel" });
	}
  };

// http://localhost:3001/api/live/publish
// requirements needs to be able to create an empty panel
async function proxyPanelCreate() {

}

module.exports = {
	loginGrafana,
	pingGrafana,
	logoutGrafana,
	checkSession,

	getUserDataGrafana,
	getUserFoldersGrafana,
	getUserDashboardsGrafana,
	getDashboardJsonGrafana,

	getInfluxBuckets,
	getBucketMetadata,

	proxyPanelUpdate,
	proxyDashboardUpdate,
	proxyDashboardCreate,
	proxyDashboardDelete,
	createDashboardGrafana,
	createPanelInDashboard,

};