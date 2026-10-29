/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { runAllDomainTests } from '../tests/domain.test';
import { runWave1Tests } from '../tests/wave1.test';

try {
  runAllDomainTests();
  runWave1Tests();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
