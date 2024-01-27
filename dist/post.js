"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const http_client_1 = require("@actions/http-client");
const github_1 = require("@actions/github");
const utils_1 = require("./utils");
const apiKey = core.getInput('metis-api-key');
const githubToken = core.getInput('github-token');
const targetUrl = core.getInput('target-url');
const dumpLogs = core.getInput('dump-logs') === 'true';
const octokit = github.getOctokit(githubToken);
const { pull_request: pr, issue } = github.context.payload;
const prName = pr
    ? pr.title
        ? `pr:${pr.title}`
        : `pr:${github.context.sha}`
    : `commit:${github.context.sha}`;
const http = new http_client_1.HttpClient();
const { number: prId, html_url: prUrl } = pr || {};
const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };
const collectorId = core.getState('collector-id');
if (dumpLogs) {
    console.log('**************************************************************');
    console.log('***                  Metis Otel Collector                  ***');
    console.log('**************************************************************');
    (0, utils_1.dumpCollectorLogs)(collectorId);
}
(0, utils_1.stopCollector)(collectorId);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all([
            http.post(`${targetUrl}/api/tests/create`, JSON.stringify({ prName, prId: `${prId}`, prUrl }), headers),
            octokit.rest.issues.createComment(Object.assign(Object.assign({}, github_1.context.repo), { issue_number: prId || (issue === null || issue === void 0 ? void 0 : issue.number) || 0, body: `Metis test results are available in the link: ${encodeURI(`${targetUrl}/projects/${apiKey}/test/${prName}`)}` })),
        ]);
    }
    catch (e) {
        console.error(e);
        core.setFailed(e);
    }
}))();
