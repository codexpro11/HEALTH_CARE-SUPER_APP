import { getDemoSession, getDemoScenario, isDemoMode, readStored, writeStored } from './demo';
import { insuranceFixtures } from '../data/insuranceFixtures';
import { currentNfcAccess } from './nfcDemo';
import { validateRecordAttachment, saveDemoRecordAttachment, readDemoRecordAttachment, deleteDemoRecordAttachment } from './recordAttachments';
import { validatePolicy, validateClaim, claimDecision, effectivePolicyStatus, maskIdentifier } from './insuranceRules';
import type { InsurancePolicy, InsuranceClaim, PolicyInput, ClaimInput, ClaimStatus, InsuranceDocument } from './insuranceRules';
export * from './insuranceRules';

export const INSURANCE_CHANGED = 'hc:insurance-changed';
interface InsuranceState { version: 1; policies: InsurancePolicy[]; claims: InsuranceClaim[]; }

function session() {
  if (!isDemoMode) throw new Error('Insurance demo is unavailable outside demo mode. Connect the insurance API for live use.');
  const user = getDemoSession();
  if (!user) throw new Error('Sign in to access insurance.');
  return user;
}
function patient() {
  const user = session();
  if (user.role !== 'PATIENT') throw new Error('Only the patient persona can manage insurance policies, claims and documents.');
  return user;
}
function load(ownerId: string): InsuranceState {
  const key = 'hc_insurance:' + ownerId;
  const saved = readStored<InsuranceState | null>(key, null);
  if (saved?.version === 1 && Array.isArray(saved.policies) && Array.isArray(saved.claims)) {
    return { ...saved, policies: saved.policies.filter(item => item.ownerId === ownerId), claims: saved.claims.filter(item => item.ownerId === ownerId) };
  }
  const state = insuranceFixtures(ownerId);
  writeStored(key, state);
  return state;
}
function save(state: InsuranceState, ownerId: string) {
  if (patient().id !== ownerId) throw new Error('The demo account changed. Sign in again before saving.');
  if (getDemoScenario() === 'error') throw new Error('Demo failure: insurance changes were not saved. Choose the Success preview scenario and retry.');
  writeStored('hc_insurance:' + ownerId, state);
  window.dispatchEvent(new Event(INSURANCE_CHANGED));
}
export function getInsuranceState(): InsuranceState {
  const user = patient();
  if (getDemoScenario() === 'error') throw new Error('Failed to load insurance. Choose the Success preview scenario and retry.');
  const state = load(user.id);
  if (getDemoScenario() === 'empty') return { version: 1, policies: [], claims: [] };
  return state;
}
function policyFor(state: InsuranceState, id: string) {
  const policy = state.policies.find(item => item.id === id);
  if (!policy) throw new Error('Policy not found in this demo account.');
  return policy;
}
function claimFor(state: InsuranceState, id: string) {
  const claim = state.claims.find(item => item.id === id);
  if (!claim) throw new Error('Claim not found in this demo account.');
  return claim;
}
export function savePolicy(input: PolicyInput, id?: string): InsurancePolicy {
  const user = patient(); validatePolicy(input);
  const state = load(user.id);
  const previous = id ? policyFor(state, id) : undefined;
  const normalize = (value: string) => value.trim().toUpperCase().replace(/\s+/g, '');
  if (state.policies.some(item => item.id !== id && normalize(item.provider) === normalize(input.provider) && normalize(item.policyNumber) === normalize(input.policyNumber))) {
    throw new Error('This provider and policy number already exist in your account.');
  }
  if (previous && previous.currency !== input.currency && state.claims.some(claim => claim.policyId === id)) throw new Error('Currency cannot be changed after claims have been created for this policy.');
  if (id && state.claims.some(claim => claim.policyId === id && (claim.amount > input.coverage || claim.date < input.startDate || claim.date > input.endDate))) {
    throw new Error('Keep policy dates and sum insured consistent with its existing claims.');
  }
  const policy: InsurancePolicy = {
    ...input, id: id ?? 'pol-' + crypto.randomUUID(), ownerId: user.id,
    provider: input.provider.trim(), plan: input.plan.trim(), policyNumber: input.policyNumber.trim(), memberId: input.memberId.trim(),
    documents: previous?.documents ?? [], createdAt: previous?.createdAt ?? new Date().toISOString(),
    coverages: input.coverageNotes === undefined ? previous?.coverages ?? [] : input.coverageNotes.trim() ?
      [{ name: 'Patient-entered coverage notes', limit: 'Refer to policy document', description: input.coverageNotes.trim() }] : [],
  };
  delete (policy as InsurancePolicy & { coverageNotes?: string }).coverageNotes;
  save({ ...state, policies: previous ? state.policies.map(item => item.id === id ? policy : item) : [policy, ...state.policies] }, user.id);
  return policy;
}
export function deletePolicy(id: string) {
  const user = patient(); const state = load(user.id); const policy = policyFor(state, id);
  if (state.claims.some(claim => claim.policyId === id)) throw new Error('Policies with claims cannot be deleted. You can cancel the policy instead.');
  save({ ...state, policies: state.policies.filter(item => item.id !== id) }, user.id);
  return Promise.all(policy.documents.map(document => deleteDemoRecordAttachment(fileKey(user.id, 'policy', id, document.id))));
}
export function saveClaim(input: ClaimInput, id?: string): InsuranceClaim {
  const user = patient(); const state = load(user.id); const policy = policyFor(state, input.policyId);
  validateClaim(input, policy);
  const previous = id ? claimFor(state, id) : undefined;
  if (previous && previous.status !== 'DRAFT') throw new Error('Only draft claims can be edited.');
  const now = new Date().toISOString();
  const claim: InsuranceClaim = {
    ...input, id: id ?? 'CLM-' + crypto.randomUUID(), ownerId: user.id, hospital: input.hospital.trim(),
    description: input.description.trim(), status: 'DRAFT', approvedAmount: 0, rejectionReason: '',
    createdAt: previous?.createdAt ?? now, documents: previous?.documents ?? [],
    history: previous?.history ?? [{ status: 'DRAFT', at: now, note: 'Draft created in the demo.' }],
  };
  save({ ...state, claims: previous ? state.claims.map(item => item.id === id ? claim : item) : [claim, ...state.claims] }, user.id);
  return claim;
}
export function transitionClaim(id: string, status: ClaimStatus, amount?: number, reason = '') {
  const user = patient(); const state = load(user.id); const claim = claimFor(state, id);
  if (status === 'SUBMITTED') validateClaim(claim, policyFor(state, claim.policyId));
  const decision = claimDecision(claim, status, amount, reason);
  const updated: InsuranceClaim = { ...claim, ...decision, status, history: [...claim.history,
    { status, at: new Date().toISOString(), note: status === 'REJECTED' ? decision.rejectionReason : 'Simulated ' + status.toLowerCase().replaceAll('_', ' ') + '.' }] };
  save({ ...state, claims: state.claims.map(item => item.id === id ? updated : item) }, user.id);
  return updated;
}
export async function deleteDraftClaim(id: string) {
  const user = patient(); const state = load(user.id); const claim = claimFor(state, id);
  if (claim.status !== 'DRAFT') throw new Error('Only draft claims can be deleted.');
  save({ ...state, claims: state.claims.filter(item => item.id !== id) }, user.id);
  await Promise.all(claim.documents.map(document => deleteDemoRecordAttachment(fileKey(user.id, 'claim', id, document.id))));
}
export type DocumentKind = 'policy' | 'claim';
function parentFor(state: InsuranceState, kind: DocumentKind, id: string) {
  return kind === 'policy' ? policyFor(state, id) : claimFor(state, id);
}
function fileKey(ownerId: string, kind: DocumentKind, id: string, documentId: string) {
  return 'insurance:' + ownerId + ':' + kind + ':' + id + ':' + documentId;
}
function requireEditableDocument(kind: DocumentKind, parent: InsurancePolicy | InsuranceClaim) {
  if (kind === 'claim' && (parent as InsuranceClaim).status !== 'DRAFT') throw new Error('Claim documents can be changed only while the claim is a draft.');
}
function updateDocuments(state: InsuranceState, kind: DocumentKind, id: string, documents: InsuranceDocument[]): InsuranceState {
  return kind === 'policy' ? { ...state, policies: state.policies.map(item => item.id === id ? { ...item, documents } : item) } :
    { ...state, claims: state.claims.map(item => item.id === id ? { ...item, documents } : item) };
}
export async function uploadInsuranceDocument(kind: DocumentKind, id: string, file: File) {
  const user = patient(); const state = load(user.id); const parent = parentFor(state, kind, id);
  requireEditableDocument(kind, parent);
  const failure = validateRecordAttachment(file); if (failure) throw new Error(failure);
  if (parent.documents.length >= 10) throw new Error('Keep up to ten documents per policy or claim.');
  const document: InsuranceDocument = { id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString() };
  const key = fileKey(user.id, kind, id, document.id);
  await saveDemoRecordAttachment(key, file);
  try {
    if (patient().id !== user.id) throw new Error('The demo account changed during upload.');
    const latest = load(user.id); const current = parentFor(latest, kind, id);
    requireEditableDocument(kind, current);
    if (current.documents.length >= 10) throw new Error('Keep up to ten documents per policy or claim.');
    save(updateDocuments(latest, kind, id, [...current.documents, document]), user.id);
    return document;
  } catch (failure) {
    await deleteDemoRecordAttachment(key).catch(() => {});
    throw failure;
  }
}
export async function readInsuranceDocument(kind: DocumentKind, id: string, documentId: string) {
  const user = patient(); const parent = parentFor(load(user.id), kind, id);
  const document = parent.documents.find(item => item.id === documentId);
  if (!document) throw new Error('Document not found in this demo account.');
  const blob = await readDemoRecordAttachment(fileKey(user.id, kind, id, documentId));
  if (patient().id !== user.id || !parentFor(load(user.id), kind, id).documents.some(item => item.id === documentId)) throw new Error('Document access changed.');
  if (!blob) throw new Error('The document file is unavailable in this browser. Upload it again.');
  return { document, blob };
}
export async function removeInsuranceDocument(kind: DocumentKind, id: string, documentId: string) {
  const user = patient(); const state = load(user.id); const parent = parentFor(state, kind, id);
  requireEditableDocument(kind, parent);
  if (!parent.documents.some(item => item.id === documentId)) throw new Error('Document not found.');
  save(updateDocuments(state, kind, id, parent.documents.filter(item => item.id !== documentId)), user.id);
  await deleteDemoRecordAttachment(fileKey(user.id, kind, id, documentId));
}
export function getNfcInsuranceSummaries(patientId: string) {
  const grant = currentNfcAccess(patientId);
  if (!grant || !grant.scopes.includes('Insurance')) return [];
  return load(grant.accountId).policies.filter(policy => effectivePolicyStatus(policy) === 'ACTIVE').map(policy => ({
    id: policy.id, provider: policy.provider, plan: policy.plan, policyNumberMasked: maskIdentifier(policy.policyNumber),
    status: effectivePolicyStatus(policy),
  }));
}
