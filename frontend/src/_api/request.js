// src/_api/request.js

// This is a defualt requests wrapper that other API files use, minimising duplicate code.

export async function request(url, options = {}, errorMessage = "Request failed") {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = data?.error || errorMessage;
    throw new Error(errMsg);
  }

  return data ?? true;
}
