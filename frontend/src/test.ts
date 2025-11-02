// This file is the test entrypoint used by the Angular CLI's Karma builder.
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
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
getTestBed().configureTestingModule({
  imports: [RouterTestingModule, HttpClientTestingModule]
});
