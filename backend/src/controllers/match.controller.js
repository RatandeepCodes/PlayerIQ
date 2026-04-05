import {
  getMatchAnalysisData,
  getMatchDirectoryData,
  getMatchMomentumData,
  getUpcomingFixtureDirectoryData,
  getMatchTurningPointsData,
} from "../services/match-analysis.service.js";
import { getHomeLiveMatchFeed } from "../services/live-match-feed.service.js";
import {
  controlSimulationSession,
  getSimulationSessionState,
  initializeSimulationSession,
} from "../services/simulation-session.service.js";

export const getMatchAnalysis = async (req, res, next) => {
  try {
    const analysis = await getMatchAnalysisData(req.params.id);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

export const listMatches = async (req, res, next) => {
  try {
    const directory = await getMatchDirectoryData(req.query);
    res.json(directory);
  } catch (error) {
    next(error);
  }
};

export const getHomeMatchFeed = async (_req, res, next) => {
  try {
    const feed = await getHomeLiveMatchFeed();
    res.json(feed);
  } catch (error) {
    next(error);
  }
};

export const listUpcomingFixtures = async (req, res, next) => {
  try {
    const fixtures = await getUpcomingFixtureDirectoryData(req.query);
    res.json(fixtures);
  } catch (error) {
    next(error);
  }
};

export const getMatchMomentum = async (req, res, next) => {
  try {
    const momentum = await getMatchMomentumData(req.params.id);
    res.json(momentum);
  } catch (error) {
    next(error);
  }
};

export const getMatchTurningPoints = async (req, res, next) => {
  try {
    const turningPoints = await getMatchTurningPointsData(req.params.id);
    res.json(turningPoints);
  } catch (error) {
    next(error);
  }
};

export const startMatchSimulation = async (req, res, next) => {
  try {
    const simulation = await initializeSimulationSession(req.params.id);
    res.status(201).json(simulation);
  } catch (error) {
    next(error);
  }
};

export const getMatchSimulation = async (req, res, next) => {
  try {
    const simulation = getSimulationSessionState(req.params.id);
    res.json(simulation);
  } catch (error) {
    next(error);
  }
};

export const controlMatchSimulation = async (req, res, next) => {
  try {
    const simulation = controlSimulationSession(req.params.id, req.body.action, req.body.speed);
    res.json(simulation);
  } catch (error) {
    next(error);
  }
};
