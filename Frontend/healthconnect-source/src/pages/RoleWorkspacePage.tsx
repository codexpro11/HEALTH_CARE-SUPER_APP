import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { isDemoMode } from '../lib/demo';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function RoleWorkspacePage() {
  const { role, switchRole, logout } = useAuth();
  return <div className="max-w-xl mx-auto p-6">
    <Card className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{role.replaceAll('_', ' ')} workspace</h1>
      <p>This role's workspace is planned. Patient records are available only to the patient persona; NFC access requires a provider persona.</p>
      {isDemoMode && <Button onClick={() => switchRole('PATIENT')}>Return to Patient Demo</Button>}
      <Button variant="outline" onClick={() => logout()}>Sign out</Button>
    </Card>
  </div>;
}
