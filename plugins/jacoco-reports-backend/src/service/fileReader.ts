import path from 'path';
import extract from 'extract-zip';
import * as fs from 'fs';
import xml2js from 'xml2js';
import fetch from 'node-fetch';

const XML_PATH = path.resolve(`${__dirname}/tmp/testReport.xml`);
const ZIP_PATH = path.resolve(`${__dirname}/target.zip`);
const TEMP_DIR_PATH = path.resolve(`${__dirname}/tmp`);

export type CoverageItemType = {
  label: string;
  value: number;
};

export type Coverage = Array<CoverageItemType>;

function titleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export const transformReportResponseToCoverage = (
  report: Array<{ $: { type: string; missed: string; covered: string } }>,
): Coverage => {
  const transformedResponse = report.map(reportItem => {
    const coveredNumber = parseInt(reportItem.$.covered, 10);
    const missedNumber = parseInt(reportItem.$.missed, 10);
    const coveredPercentage =
      (coveredNumber / (coveredNumber + missedNumber)) * 100;
    return {
      label: titleCase(reportItem.$.type),
      value: Math.round(coveredPercentage),
    };
  });
  return transformedResponse;
};

export const readXml = async (xmlPath: string) => {
  const XML = fs.readFileSync(xmlPath);
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(XML);
  return result;
};

export async function unzip(zipPath: string, destinationPath: string) {
  await extract(zipPath, { dir: destinationPath });
}

export const downloadFile = async (url: string, downloadPath: string) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(downloadPath);
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
};
