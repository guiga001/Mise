/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { runAllDomainTests } from '../tests/domain.test';
import { runWave1Tests } from '../tests/wave1.test';
import { runWave2Tests } from '../tests/wave2.test';
import { runWave3Tests } from '../tests/wave3.test';
import { runAuthTests } from '../tests/auth.test';
import { runIntelligenceEngineTests } from '../tests/intelligence.test';

try {
  runAuthTests();
  runAllDomainTests();
  runWave1Tests();
  runWave2Tests();
  runWave3Tests();
  runIntelligenceEngineTests();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
