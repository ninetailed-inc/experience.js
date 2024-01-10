/**
 * This is a custom named setup file that will be executed before all tests.
 * Its usage is to import custom matchers utilize in dom related tests.
 * Find more information here:
 * https://github.com/testing-library/jest-dom#usage
 * https://jestjs.io/docs/configuration#setupfilesafterenv-array
 */

import '@testing-library/jest-dom';

import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
