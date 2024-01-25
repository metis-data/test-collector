import * as core from '@actions/core';
import { context } from '@actions/github';
import { setupCollector } from './utils';

const apiKey = core.getInput('metis-api-key');
const connectionString = core.getInput('connection-string');
const logLevel = core.getInput('metis-log-level');
const exporterTargetUrl = core.getInput('exporter-target-url');
const network = core.getInput('job-network');
const shell = core.getInput('shell');

const { pull_request: pr } = context.payload;

const appTagPr = pr
  ? pr.title
    ? `pr:${pr.title}`
    : `pr:${context.sha}`
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
