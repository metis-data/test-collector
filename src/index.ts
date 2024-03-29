import * as core from '@actions/core';
import { context } from '@actions/github';
import { setupCollector } from './utils';

const apiKey = core.getInput('metis-api-key');
const connectionString = core.getInput('connection-string');
const logLevel = core.getInput('metis-log-level');
const exporterTargetUrl = core.getInput('exporter-target-url');
const network = core.getInput('job-network');
const setupMetis = core.getInput('setup-collector') === 'true';
const shell = core.getInput('shell');

if (setupMetis) {
  const { pull_request: pr } = context.payload;

  const prId = pr?.number;
  const appTagPr = pr
    ? pr.title
      ? `pr:${prId}:${pr.title}`
      : `pr:${prId}:${context.sha}`
    : `commit:${context.sha}`;

  const collectorId = setupCollector(
    network,
    connectionString,
    apiKey,
    exporterTargetUrl,
    appTagPr,
    logLevel,
    { shell },
  );

  core.saveState('collector-id', collectorId);
  console.log('Metis otel collector is up and running...');
}
