import * as core from '@actions/core';
import * as github from '@actions/github';
import { HttpClient } from '@actions/http-client';
import { context } from '@actions/github';
import { stopCollector, dumpCollectorLogs } from './utils';

const apiKey = core.getInput('metis-api-key');
const githubToken = core.getInput('github-token');
const targetUrl = core.getInput('target-url');
const dumpLogs = core.getInput('dump-logs') === 'true';

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

if (dumpLogs) {
  console.log('**************************************************************');
  console.log('***                  Metis Otel Collector                  ***');
  console.log('**************************************************************');
  dumpCollectorLogs(collectorId);
}

stopCollector(collectorId);

(async () => {
  try {
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
            `${targetUrl}/projects/${apiKey}/test/${prName}`,
          )}`,
        }),
    ]);
  } catch (e: any) {
    console.error(e);
    core.setFailed(e);
  }
})();
