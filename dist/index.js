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
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const utils_1 = require("./utils");
const apiKey = core.getInput('metis-api-key');
const connectionString = core.getInput('connection-string');
const logLevel = core.getInput('metis-log-level');
const exporterTargetUrl = core.getInput('exporter-target-url');
const network = core.getInput('job-network');
const setupMetis = core.getInput('setup-collector') === 'true';
const shell = core.getInput('shell');
if (setupMetis) {
    const { pull_request: pr } = github_1.context.payload;
    const prId = pr === null || pr === void 0 ? void 0 : pr.number;
    const appTagPr = pr
        ? pr.title
            ? `pr:${prId}:${pr.title}`
            : `pr:${prId}:${github_1.context.sha}`
        : `commit:${github_1.context.sha}`;
    const collectorId = (0, utils_1.setupCollector)(network, connectionString, apiKey, exporterTargetUrl, appTagPr, logLevel, { shell });
    core.saveState('collector-id', collectorId);
    console.log('Metis otel collector is up and running...');
}
