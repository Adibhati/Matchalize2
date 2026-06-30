import express from 'express';
import {
  PROMPT_BANK,
  BRANCHES,
  YEARS,
  GENDERS,
  INTENTS,
  INTEREST_TAGS,
  PRONOUNS_OPTIONS,
  INTEREST_ICONS,
  INTEREST_ICON_FALLBACKS,
  COLLEGE_MAP,
  APP_CONSTANTS,
} from '../config/appData.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    prompts: PROMPT_BANK,
    branches: BRANCHES,
    years: YEARS,
    genders: GENDERS,
    intents: INTENTS,
    interests: INTEREST_TAGS,
    pronouns: PRONOUNS_OPTIONS,
    interestIcons: INTEREST_ICONS,
    interestIconFallbacks: INTEREST_ICON_FALLBACKS,
    colleges: COLLEGE_MAP,
    constants: APP_CONSTANTS,
  });
});

export default router;
