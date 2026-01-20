import React, { useState } from 'react';
import LoginPanel from "./components/LoginPanel";
import Background from "./components/Background";

export default function Login() {
  return (
    <>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <LoginPanel />
        </div>
        <Background />
      </div>
    </>
  );
}