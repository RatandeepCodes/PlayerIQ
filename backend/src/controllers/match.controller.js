import { getMatchAnalysisData, getMatchSimulationData } from "../services/match-analysis.service.js";

export const getMatchAnalysis = async (req, res, next) => {
  try {
    const analysis = await getMatchAnalysisData(req.params.id);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

export const simulateMatch = async (req, res, next) => {
  try {
    const simulation = await getMatchSimulationData(req.params.id);
    res.json(simulation);
  } catch (error) {
    next(error);
  }
};
