/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { downloadFile, readXml, transformReportResponseToCoverage, unzip } from './fileReader';
import path from 'path';
import * as fs from 'fs';

const XML_PATH = path.resolve(`${__dirname}/tmp/testReport.xml`);
const ZIP_PATH = path.resolve(`${__dirname}/target.zip`);
const TEMP_DIR_PATH = path.resolve(`${__dirname}/tmp`);

export interface RouterOptions {
  logger: Logger;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'ok' });
  });

  router.post('/report', async (request, response) => {
    const zipUrl = request.body.url;
    await downloadFile(zipUrl, ZIP_PATH);
    await unzip(ZIP_PATH, TEMP_DIR_PATH);
    const xmlData = await readXml(XML_PATH);
    console.log({xmlData});
    const transformedData = transformReportResponseToCoverage(
      xmlData.report.counter,
    );
    fs.unlinkSync(XML_PATH);
    fs.unlinkSync(ZIP_PATH);
    response.send(transformedData);
  });

  router.use(errorHandler());
  return router;
}
