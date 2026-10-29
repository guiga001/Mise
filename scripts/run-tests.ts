/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { runAllDomainTests } from '../tests/domain.test';

try {
  runAllDomainTests();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
