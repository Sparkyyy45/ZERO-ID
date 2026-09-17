import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HowItWorksPage from '../pages/HowItWorksPage';
import DashboardPage from '../pages/DashboardPage';
import AddProofPage from '../pages/AddProofPage';
import ShareProofPage from '../pages/ShareProofPage';
import BankSimulatorPage from '../pages/BankSimulatorPage';
import VerifierPage from '../pages/VerifierPage';
import TransactionDetailPage from '../pages/TransactionDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/add-proof" element={<AddProofPage />} />
      <Route path="/share/:txId" element={<ShareProofPage />} />
      <Route path="/tx/:txId" element={<TransactionDetailPage />} />
      <Route path="/verifier" element={<VerifierPage />} />
      <Route path="/bank-simulator" element={<VerifierPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
