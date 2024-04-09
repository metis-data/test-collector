import * as core from '@actions/core';
import * as github from '@actions/github';
import { context } from '@actions/github';
import { HttpClient } from '@actions/http-client';
import { dumpCollectorLogs, stopCollector } from './utils';

const apiKey = core.getInput('metis-api-key');
const githubToken = core.getInput('github-token');
const targetUrl = core.getInput('target-url');
const dumpLogs = core.getInput('dump-logs') === 'true';
const setupMetis = core.getInput('setup-collector') === 'true';

const octokit = github.getOctokit(githubToken);
const { pull_request: pr, issue } = github.context.payload;

const { number: prId, html_url: prUrl } = pr || {};
const prName = pr
  ? pr.title
    ? `pr:${prId}:${pr.title}`
    : `pr:${prId}:${github.context.sha}`
  : `commit:${github.context.sha}`;

const http = new HttpClient();

const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };
const collectorId = core.getState('collector-id');

if (setupMetis && dumpLogs) {
  console.log('**************************************************************');
  console.log('***                  Metis Otel Collector                  ***');
  console.log('**************************************************************');
  dumpCollectorLogs(collectorId);
}

if (setupMetis) {
  stopCollector(collectorId);
}

(async () => {
  try {
    const apiKeyIdResponse = await http.get(
      `${targetUrl}/api/api-key/id`,
      { headers: { 'x-api-key': apiKey } },
  );
  const { id: apiKeyId } = apiKeyIdResponse.data;

    await Promise.all([
      http.post(
        `${targetUrl}/api/tests/create`,
        JSON.stringify({ prName, prId: `${prId}`, prUrl }),
        headers,
      ),

      pr?.title &&
        octokit.rest.issues.createComment({
          ...context.repo,
          issue_number: prId || issue?.number || 0,
          body: `Metis test results are available in the link: ${encodeURI(
            `${targetUrl}/projects/${apiKeyId}/test/${prName}`,
          )}`,
        }),
    ]);
  } catch (e: any) {
    console.error(e);
    core.setFailed(e);
  }
})();
