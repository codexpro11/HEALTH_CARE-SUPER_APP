import React from 'react';
import { Badge } from '../common/Badge';

export function InsuranceStatus({ status }: { status: string }) {
  const variant = ['ACTIVE', 'APPROVED', 'SETTLED'].includes(status) ? 'emerald' :
    ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(status) ? 'amber' :
    status === 'PARTIALLY_APPROVED' ? 'indigo' : ['REJECTED', 'CANCELLED'].includes(status) ? 'rose' : 'slate';
  return <Badge variant={variant} size="sm">{status.replaceAll('_', ' ')}</Badge>;
}

