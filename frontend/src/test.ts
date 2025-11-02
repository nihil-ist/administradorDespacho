// This file is the test entrypoint used by the Angular CLI's Karma builder.
import 'zone.js/testing';

import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Provide common testing modules globally so specs that import standalone
// components which depend on ActivatedRoute / HttpClient work in CI without
// modifying every single spec. If your specs need further isolation, adjust
// them individually.
// Some specs call TestBed.configureTestingModule themselves and may omit
// common testing modules (RouterTestingModule, HttpClientTestingModule).
// To avoid editing many specs, wrap TestBed.configureTestingModule to
// automatically merge these default imports when a spec calls it.
const originalConfigureTestingModule = (TestBed as any).configureTestingModule.bind(TestBed);
(TestBed as any).configureTestingModule = (moduleDef: any = {}) => {
  const defaultImports = [RouterTestingModule, HttpClientTestingModule];
  const mergedImports = Array.from(new Set([...(moduleDef.imports || []), ...defaultImports]));
  const merged = { ...moduleDef, imports: mergedImports };
  return originalConfigureTestingModule(merged);
};
